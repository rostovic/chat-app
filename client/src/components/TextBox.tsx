import { useRef } from "react";

import { trpc } from "../trpc";

const TextBox = ({ roomId, userId }: { roomId: string; userId: string }) => {
  const messageMutation = trpc.sendMessage.useMutation();
  const text = useRef("");

  const sendMessage = () => {
    messageMutation.mutate({
      message: text.current,
      roomId,
      userId,
    });
  };

  return (
    <div className="flex ">
      <input
        type={"text"}
        onChange={(e) => (text.current = e.currentTarget.value)}
        className="flex flex-1 border-2 border-gray-400 "
      />
      <button
        onClick={sendMessage}
        className="bg-white border-2 px-1 border-gray-400 font-bold text-green-700 "
      >
        Send
      </button>
      {messageMutation.isError && <p>{messageMutation.error.message}</p>}
    </div>
  );
};

export default TextBox;
