import { useRef } from "react";

import { trpc } from "../trpc";

const DELAY = 2000;

const TextBox = ({ roomId, userId }: { roomId: string; userId: string }) => {
  const messageMutation = trpc.sendMessage.useMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const text = useRef("");
  const lastSent = useRef<number>(0);

  const sendMessage = () => {
    messageMutation.mutate({
      message: text.current,
      roomId,
      userId,
    });

    if (inputRef.current) {
      inputRef.current.value = "";
      text.current = "";
    }
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
