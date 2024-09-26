// src/App.tsx
import React, { useState } from "react";
import { trpc } from "./trpc";

const App: React.FC = () => {
  const [name, setName] = useState("");

  const { data, refetch } = trpc.hello.useQuery({ name }, { enabled: false });

  return (
    <div>
      <h1>{data ? data.message : "Enter your name"}</h1>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <button onClick={() => refetch()}>Say Hello</button>
    </div>
  );
};

export default App;
