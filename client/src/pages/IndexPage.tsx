import { trpc } from "../trpc";

export default function IndexPage() {
  const userQuery = trpc.hello.useQuery({ name: "kek" });

  return (
    <div>
      <p>{userQuery.data?.message}</p>

      <button>Create Frodo</button>
    </div>
  );
}
