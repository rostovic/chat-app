import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./router";
import cors from "cors";

const server = createHTTPServer({
  router: appRouter,
  middleware: cors(),
});

server.listen(5000);
console.log("Server is running at http://localhost:5000");
