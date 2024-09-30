import { initTRPC, TRPCError } from "@trpc/server";
import { observable, Observer } from "@trpc/server/observable";
import { z } from "zod";

type ActionType =
  | "CHANGE_NICKNAME"
  | "SPECIAL_STYLING"
  | "DELETE_LAST_MESSAGE"
  | "DISPLAY_MESSAGE"
  | "USER_CURRENTLY_TYPING";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const roomEmits = new Map<
  string,
  {
    emit: Observer<
      {
        action: ActionType;
        payload: string;
        userId: string;
      },
      unknown
    >;
    userId: string;
  }[]
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
      let roomEmitsArray = roomEmits.get(roomId);
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
          case "/typing":
            action = "USER_CURRENTLY_TYPING";
            roomEmitsArray = roomEmitsArray?.filter(
              (roomEmit) => roomEmit.userId !== userId
            );
            break;
        }
      }

      if (roomEmitsArray) {
        roomEmitsArray.forEach((emitData) => {
          try {
            emitData.emit.next({ payload, action, userId });
          } catch (error) {
            console.log(error);
          }
        });
      }

      return { success: true };
    }),

  onMessage: publicProcedure
    .input(z.object({ roomId: z.string(), userId: z.string() }))
    .subscription(({ input }) => {
      const { roomId, userId } = input;

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
        const roomEmitsArray = roomEmits.get(roomId);
        if (roomEmitsArray) {
          roomEmitsArray.push({ emit, userId });
        } else {
          roomEmits.set(roomId, [{ emit, userId }]);
        }
        console.log(`${roomId} connected.`);

        return () => {
          if (roomEmitsArray) {
            const newRoomEmits = roomEmitsArray.filter(
              (roomEmit) => roomEmit.emit !== emit
            );
            roomEmits.set(roomId, newRoomEmits);
          }
          // roomEmits.delete(roomId);
          console.log(`User disconnected from room ${roomId}.`);
        };
      });
    }),
});

export type AppRouter = typeof appRouter;
