import { initTRPC } from "@trpc/server";
import { observable, Observer } from "@trpc/server/observable";
import { z } from "zod";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const roomEmits = new Map<
  string,
  Observer<
    {
      message: string;
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
      })
    )
    .mutation(({ input }) => {
      const { roomId, message } = input;

      const roomEmitArray = roomEmits.get(roomId);

      if (roomEmitArray) {
        roomEmitArray.forEach((emit) => {
          try {
            emit.next({ message });
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

      return observable<{ message: string }>((emit) => {
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
