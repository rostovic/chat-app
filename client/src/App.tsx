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
          <header className="flex h-16 justify-center align-middle bg-slate-700 dark:bg-gray-50">
            <button
              className="border-4 rounded-full px-4 my-2 text-gray-50 dark:text-slate-700 border-gray-50 dark:border-slate-700"
              onClick={() =>
                setTheme((prev) => (prev === "light" ? "dark" : "light"))
              }
            >
              Change theme
            </button>
          </header>
          <IndexPage setTheme={setTheme} />
          {/* <div className="h-64 w-64 bg-customColor dark:bg-darkCustomColor"></div> */}
          {/* <button onClick={() => setTheme((prev) => !prev)}>Change</button> */}
        </div>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
