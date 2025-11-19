import { db } from "@/database";
import { commentsTable, usersTable } from "@/database/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { eq, getTableColumns } from "drizzle-orm";
import z from "zod";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.uuid(),
        content: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const { videoId, content } = input;

      const [createdComment] = await db
        .insert(commentsTable)
        .values({ userId, videoId, content })
        .returning();
      return createdComment;
    }),
  getMany: baseProcedure
    .input(z.object({ videoId: z.uuid() }))
    .query(async ({ input }) => {
      const { videoId } = input;
      const data = await db
        .select({
          ...getTableColumns(commentsTable),
          user: usersTable,
        })
        .from(commentsTable)
        .where(eq(commentsTable.videoId, videoId))
        .innerJoin(usersTable, eq(commentsTable.userId, usersTable.id));
      return data;
    }),
});
