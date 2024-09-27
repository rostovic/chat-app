import { trpc } from "../trpc";
import TextBox from "../components/TextBox";

const IndexPage = () => {
  trpc.onMessage.useSubscription(
    { roomId: "1" },
    {
      onData: (data) => {
        console.log(data);
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
        <TextBox roomId={"1"} />
      </div>
    </div>
  );
};

export default IndexPage;
