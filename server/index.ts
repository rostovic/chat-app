import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { WebSocketServer } from "ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { AppRouter, appRouter } from "./router";
import cors from "cors";

const server = createHTTPServer({
  router: appRouter,
  middleware: cors(),
});

const wss = new WebSocketServer({ server });
applyWSSHandler<AppRouter>({
  wss,
  router: appRouter,
});

server.listen(5000);
console.log("Server is running at http://localhost:5000");
