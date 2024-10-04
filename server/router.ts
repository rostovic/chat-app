import { initTRPC, TRPCError } from "@trpc/server";
import { observable, Observer } from "@trpc/server/observable";
import { z } from "zod";
import { isValidUrl } from "./utils/util";

type ActionType =
  | "CHANGE_NICKNAME"
  | "SPECIAL_STYLING"
  | "DELETE_LAST_MESSAGE"
  | "DISPLAY_MESSAGE"
  | "USER_CURRENTLY_TYPING"
  | "EDIT_LAST_MESSAGE"
  | "COUNTDOWN_URL";

type PayloadType = { timer: number; url: string } | string;

const t = initTRPC.create();
const publicProcedure = t.procedure;

const roomEmits = new Map<
  string,
  {
    emit: Observer<
      {
        action: ActionType;
        payload: PayloadType;
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
      let payload: PayloadType = message;
      let roomEmitsArray = roomEmits.get(roomId);

      if (message.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can not send empty message!",
        });
      }

      if (message.startsWith("/")) {
        const splitAction = message
          .split(" ")
          .filter((element) => element !== "");
        const inputCommand = splitAction[0];

        switch (inputCommand) {
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
          case "/edit":
            action = "EDIT_LAST_MESSAGE";
            splitAction.shift();
            payload = splitAction.join(" ");
            if (!payload) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message:
                  "You need to enter text in order to replace your last message!",
              });
            }
            break;

          case "/countdown":
            action = "COUNTDOWN_URL";
            const [_, timer, url] = splitAction;
            if (!Number.isInteger(+timer)) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Enter a valid integer number!",
              });
            }
            if (!isValidUrl(url)) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Enter a valid url!",
              });
            }
            roomEmitsArray = roomEmitsArray?.filter(
              (roomEmit) => roomEmit.userId !== userId
            );
            payload = { timer: +timer, url };
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

      return observable<{
        payload: PayloadType;
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
          console.log(`User disconnected from room ${roomId}.`);
        };
      });
    }),
});

export type AppRouter = typeof appRouter;
