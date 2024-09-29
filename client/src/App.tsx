import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { trpc, trpcClient } from "./trpc";
import IndexPage from "./pages/IndexPage";

export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div id="app-container">
          <IndexPage />
        </div>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
