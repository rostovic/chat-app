import { useState } from "react";
import { trpc } from "../trpc";

export default function IndexPage() {
  const [count, setCount] = useState(0);

  trpc.randomNumber.useSubscription(undefined, {
    onData({ randomNumber }) {
      setCount((prev) => prev + 1);
      console.log(randomNumber);
    },
    enabled: count < 3,
  });
  const userQuery = trpc.hello.useQuery({ name: "kek" });

  return (
    <div>
      <p>{userQuery.data?.message}</p>
      <p>Count: {count}</p>
      <button>Create Frodo</button>
    </div>
  );
}
