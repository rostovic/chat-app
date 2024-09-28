import { trpc } from "../trpc";
import TextBox from "../components/TextBox";
import { useEffect } from "react";
const ROOM_ID = "1";

const IndexPage = () => {
  useEffect(() => {
    document.title = "Anonymous";
  }, []);
  trpc.onMessage.useSubscription(
    { roomId: ROOM_ID },
    {
      onData: (data) => {
        if (data.action === "CHANGE_NICKNAME") {
          document.title = data.payload;
        }
      },
    }
  );

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          height: "600px",
          width: "30%",
          border: "2px solid black",
        }}
      >
        <div style={{ height: "95%" }}></div>
        <TextBox roomId={ROOM_ID} />
      </div>
    </div>
  );
};

export default IndexPage;
