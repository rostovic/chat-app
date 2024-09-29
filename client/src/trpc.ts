import {
  createTRPCReact,
  createWSClient,
  httpLink,
  splitLink,
  wsLink,
} from "@trpc/react-query";

import type { AppRouter } from "../../server/router";

const wsClient = createWSClient({
  url: `ws://localhost:5000`,
});

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition(op) {
        return op.type === "subscription";
      },
      true: wsLink({
        client: wsClient,
      }),
      false: httpLink({
        url: `http://localhost:5000`,
      }),
    }),
  ],
});
