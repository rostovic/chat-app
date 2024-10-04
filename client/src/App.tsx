import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { trpc, trpcClient } from "./trpc";
import IndexPage from "./pages/IndexPage";

export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div id="app-container">
          <IndexPage setTheme={setTheme} />
        </div>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
