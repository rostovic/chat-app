import { useRef } from "react";

import { trpc } from "../trpc";

const DELAY = 2000;

const TextBox = ({
  roomId,
  userId,
  setTheme,
}: {
  roomId: string;
  userId: string;
  setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
}) => {
  const messageMutation = trpc.sendMessage.useMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const text = useRef("");
  const lastSent = useRef<number>(0);

  const sendMessage = () => {
    const message = text.current;
    if (inputRef.current) {
      inputRef.current.value = "";
      text.current = "";
    }

    if (message === "/light") {
      setTheme("light");
      return;
    } else if (message === "/dark") {
      setTheme("dark");
      return;
    }
    messageMutation.mutate({
      message,
      roomId,
      userId,
    });
  };

  return (
    <div className="flex ">
      <input
        ref={inputRef}
        type={"text"}
        onChange={(e) => {
          text.current = e.currentTarget.value;

          if (text.current.length > 0) {
            const timestamp = new Date().getTime();
            if (timestamp > lastSent.current + DELAY) {
              lastSent.current = timestamp;
              messageMutation.mutate({
                message: "/typing true",
                roomId,
                userId,
              });
            }
          }
        }}
        className="flex flex-1 border-2 border-gray-400"
      />
      <button
        onClick={() => {
          sendMessage();
        }}
        className="bg-white border-2 px-1 border-gray-400 font-bold text-green-700 "
      >
        Send
      </button>
      {messageMutation.isError && <p>{messageMutation.error.message}</p>}
    </div>
  );
};

export default TextBox;
