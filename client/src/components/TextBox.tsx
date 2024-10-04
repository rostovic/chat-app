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
  const lastInputChangeTimestamp = useRef<number>(0);

  const sendMessage = () => {
    const message = text.current;
    if (inputRef.current) {
      inputRef.current.value = "";
      text.current = "";
    }

    if (message.length === 0) {
      return;
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

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    text.current = e.currentTarget.value;

    if (text.current.length > 0) {
      const timestamp = new Date().getTime();
      if (timestamp > lastInputChangeTimestamp.current + DELAY) {
        lastInputChangeTimestamp.current = timestamp;
        messageMutation.mutate({
          message: "/typing",
          roomId,
          userId,
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col">
      {messageMutation.isError && (
        <p className="text-red-500 font-bold align-middle m-1">
          {messageMutation.error.message}
        </p>
      )}
      <div className="flex">
        <input
          ref={inputRef}
          type={"text"}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          className="flex flex-1 border-2 border-gray-400"
        />
        <button
          onClick={() => {
            sendMessage();
          }}
          className="border-2 border-gray-400 px-1 font-bold text-gray-400  bg-white  hover:bg-gray-400  hover:text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default TextBox;
