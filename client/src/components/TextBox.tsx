import { useRef } from "react";
import { trpc } from "../trpc";

const TextBox = ({ roomId }: { roomId: string }) => {
  const kek = trpc.sendMessage.useMutation();
  const text = useRef("");
  const sendMessage = () => {
    kek.mutate({ message: text.current, roomId: roomId });
  };

  return (
    <div>
      <input
        type={"text"}
        onChange={(e) => (text.current = e.currentTarget.value)}
      ></input>
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default TextBox;
