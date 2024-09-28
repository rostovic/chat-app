import { useRef } from "react";
import { trpc } from "../trpc";

const TextBox = ({ roomId }: { roomId: string }) => {
  const messageMutation = trpc.sendMessage.useMutation();
  const text = useRef("");

  const sendMessage = () => {
    messageMutation.mutate({ message: text.current, roomId: roomId });
  };

  return (
    <div>
      <input
        type={"text"}
        onChange={(e) => (text.current = e.currentTarget.value)}
      ></input>
      <button onClick={sendMessage}>Send</button>
      {messageMutation.isError && <p>{messageMutation.error.message}</p>}
    </div>
  );
};

export default TextBox;
