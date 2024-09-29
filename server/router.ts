import { initTRPC, TRPCError } from "@trpc/server";
import { observable, Observer } from "@trpc/server/observable";
import { string, z } from "zod";

type ActionType =
  | "CHANGE_NICKNAME"
  | "SPECIAL_STYLING"
  | "DELETE_LAST_MESSAGE"
  | "DISPLAY_MESSAGE";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const roomEmits = new Map<
  string,
  Observer<
    {
      action: ActionType;
      payload: string;
      userId: string;
    },
    unknown
  >[]
>();

export const appRouter = t.router({
  sendMessage: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
        message: z.string(),
        userId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { roomId, message, userId } = input;
      let action: ActionType = "DISPLAY_MESSAGE";
      let payload: string = message;
      if (message.startsWith("/")) {
        const splitAction = message
          .split(" ")
          .filter((element) => element !== "");

        switch (splitAction[0]) {
          case "/nick":
            action = "CHANGE_NICKNAME";
            splitAction.shift();
            payload = splitAction.join(" ");
            if (!payload) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Can not enter empty nickname!",
              });
            }
            break;
          case "/think":
            action = "SPECIAL_STYLING";
            splitAction.shift();
            payload = splitAction.join(" ");
            break;
          case "/oops":
            action = "DELETE_LAST_MESSAGE";
            break;
        }
      }
      // postavim action

      const roomEmitArray = roomEmits.get(roomId);

      if (roomEmitArray) {
        roomEmitArray.forEach((emit) => {
          try {
            emit.next({ payload, action, userId });
          } catch (error) {
            console.log(error);
          }
        });
      }

      return { success: true };
    }),

  onMessage: publicProcedure
    .input(z.object({ roomId: z.string() }))
    .subscription(({ input }) => {
      const { roomId } = input;

      // if (connectedUsers.size >= MAX_USERS) {
      //   throw new Error("The chat is full. Only 2 users are allowed.");
      // }

      // if (connectedUsers.has(roomId)) {
      //   throw new Error(
      //     "You are already connected from another window or device."
      //   );
      // }

      return observable<{
        payload: string;
        action: ActionType;
        userId: string;
      }>((emit) => {
        const userEmitsArray = roomEmits.get(roomId);
        if (userEmitsArray) {
          userEmitsArray.push(emit);
        } else {
          roomEmits.set(roomId, [emit]);
        }
        console.log(`${roomId} connected.`);

        return () => {
          if (userEmitsArray) {
            const newUserEmits = userEmitsArray.filter(
              (userEmit) => userEmit !== emit
            );
            roomEmits.set(roomId, newUserEmits);
          }
          // roomEmits.delete(roomId);
          console.log(`User disconnected from room ${roomId}.`);
        };
      });
    }),
});

export type AppRouter = typeof appRouter;
