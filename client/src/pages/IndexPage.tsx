import { useEffect, useRef, useState } from "react";

import { trpc } from "../trpc";
import TextBox from "../components/TextBox";
import notificationSound from "../assets/audio/notification.wav";
import { generateRgbColor } from "../utils/util";
const ROOM_ID = "1";

const IndexPage = ({
  setTheme,
}: {
  setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
}) => {
  const [messagesArray, setMessagesArray] = useState<
    { userId: string; message: string; isThink: boolean; color?: string }[]
  >([]);
  const [userId] = useState(Math.random().toString());
  const scrollViewRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countDownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [userTyping, setUserTyping] = useState<string | null>(null);
  const audio = new Audio(notificationSound);
  const [countDown, setCountdown] = useState({ timer: 0, url: "" });

  trpc.onMessage.useSubscription(
    { roomId: ROOM_ID, userId },
    {
      onData: (data) => {
        if (
          data.action === "DISPLAY_MESSAGE" ||
          data.action === "SPECIAL_STYLING"
        ) {
          const color = generateRgbColor(50, 255);
          const modifiedMessage = (data.payload as string)
            .replaceAll(":)", "😊")
            .replaceAll(";)", "😉");
          setMessagesArray((prevMessagesArray) => [
            ...prevMessagesArray,
            {
              userId: data.userId,
              message: modifiedMessage,
              isThink: data.action === "SPECIAL_STYLING",
              color: data.action === "SPECIAL_STYLING" ? color : undefined,
            },
          ]);
          audio.play();
        }

        if (data.action === "CHANGE_NICKNAME" && data.userId !== userId) {
          document.title = data.payload as string;
        }

        if (data.action === "DELETE_LAST_MESSAGE") {
          for (let i = messagesArray.length - 1; i >= 0; i--) {
            if (messagesArray[i].userId === data.userId) {
              let newMessageArray = messagesArray.filter(
                (_, index) => index !== i
              );
              setMessagesArray(newMessageArray);
              break;
            }
          }
        }

        if (data.action === "EDIT_LAST_MESSAGE") {
          const newMessageArray = [...messagesArray];

          for (let i = newMessageArray.length - 1; i >= 0; i--) {
            if (newMessageArray[i].userId === data.userId) {
              newMessageArray[i].message = data.payload + " (edited)";
              break;
            }
          }

          setMessagesArray(newMessageArray);
        }

        if (data.action === "USER_CURRENTLY_TYPING") {
          setUserTyping(data.userId);
          if (!timerRef.current) {
            timerRef.current = setTimeout(() => {
              setUserTyping(null);
            }, 2000);
          } else {
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
              setUserTyping(null);
            }, 2000);
          }
        }

        if (data.action === "COUNTDOWN_URL") {
          if (countDownTimerRef.current) {
            clearTimeout(countDownTimerRef.current);
          }
          setCountdown({
            timer: (data.payload as { timer: number; url: string }).timer,
            url: (data.payload as { timer: number; url: string }).url,
          });
          countDownTimerRef.current = setInterval(() => {
            setCountdown((prev) => {
              const newTime = prev.timer - 1;
              if (newTime <= 0) {
                window
                  .open(prev.url, "_blank", "width=800,height=600")
                  ?.focus();
                if (countDownTimerRef.current) {
                  clearTimeout(countDownTimerRef.current);
                }
                return { timer: 0, url: "" };
              }
              return { ...prev, timer: newTime };
            });
          }, 1000);
        }
      },
    }
  );

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        top: scrollViewRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messagesArray]);

  const showMessages = () => {
    return messagesArray.map((message, index) => (
      <div
        key={index}
        className={`flex p-2 px-4 rounded-2xl max-w-70% ${
          message.userId === userId
            ? "self-start bg-blue-400"
            : "self-end bg-red-300"
        }`}
        style={{ backgroundColor: message.color }}
      >
        <p className="flex break-all">{message.message}</p>
      </div>
    ));
  };

  const showCountdown = () => {
    if (countDown.url === "") {
      return;
    }
    return (
      <h1 className="font-bold text-3xl text-slate-900 dark:text-gray-50">
        Countdown: {countDown.timer}
      </h1>
    );
  };

  return (
    <div className="flex flex-1 flex-col justify-center items-center gap-4 bg-gray-50 dark:bg-slate-700">
      {showCountdown()}
      <div className="flex flex-col justify-end h-[700px] w-[50%] bg-gray-200 dark:bg-slate-900">
        <div
          className="flex flex-col p-1 gap-1 overflow-y-scroll"
          ref={scrollViewRef}
        >
          {showMessages()}
        </div>
        {userTyping ? <p>{document.title} is typing...</p> : null}
        <TextBox roomId={ROOM_ID} userId={userId} setTheme={setTheme} />
      </div>
    </div>
  );
};

export default IndexPage;
