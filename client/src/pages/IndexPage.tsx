import { useEffect, useRef, useState } from "react";

import { trpc } from "../trpc";
import TextBox from "../components/TextBox";
const ROOM_ID = "1";

const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRgbColor = (min: number, max: number) => {
  return `rgb(${getRandomInt(min, max)}, ${getRandomInt(
    min,
    max
  )}, ${getRandomInt(min, max)})`;
};

const IndexPage = () => {
  const [messagesArray, setMessagesArray] = useState<
    { userId: string; message: string; isThink: boolean; color?: string }[]
  >([]);
  const [userId] = useState(Math.random().toString());
  const scrollViewRef = useRef<HTMLDivElement | null>(null);

  trpc.onMessage.useSubscription(
    { roomId: ROOM_ID },
    {
      onData: (data) => {
        console.log(data);
        if (
          data.action === "DISPLAY_MESSAGE" ||
          data.action === "SPECIAL_STYLING"
        ) {
          const color = generateRgbColor(50, 255);
          setMessagesArray((prevMessagesArray) => [
            ...prevMessagesArray,
            {
              userId: data.userId,
              message: data.payload,
              isThink: data.action === "SPECIAL_STYLING",
              color: data.action === "SPECIAL_STYLING" ? color : undefined,
            },
          ]);
        }

        if (data.action === "CHANGE_NICKNAME" && data.userId !== userId) {
          document.title = data.payload;
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

  return (
    <div className="flex flex-1 flex-col justify-center items-center bg-stone-600">
      <div className="flex flex-col justify-end h-[600px] w-[40%] bg-gray-100">
        <div
          className="flex flex-col p-1 gap-1 overflow-y-scroll"
          ref={scrollViewRef}
        >
          {showMessages()}
        </div>
        <TextBox roomId={ROOM_ID} userId={userId} />
        {/* <button
          onClick={() => {
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollTo({
                top: scrollViewRef.current.scrollHeight,
                behavior: "smooth",
              });
            }
          }}
        >
          Scroll
        </button> */}
      </div>
    </div>
  );
};

export default IndexPage;
