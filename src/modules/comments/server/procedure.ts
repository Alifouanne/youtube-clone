import { db } from "@/database";
import { commentsTable, usersTable } from "@/database/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import z from "zod";

// Create a TRPC router for comment-related endpoints
export const commentsRouter = createTRPCRouter({
  // Endpoint for removing (deleting) a comment; user must be authenticated
  remove: protectedProcedure
    // Validate input: requires an 'id' of the comment to delete (UUID)
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ input, ctx }) => {
      // Get the user ID of the requester from the authentication context
      const { id: userId } = ctx.user;
      // Get the comment ID from input
      const { id } = input;

      // Attempt to delete the comment where both IDs match
      // Only deletes if the comment exists and the current user is the author
      const [deletedComment] = await db
        .delete(commentsTable)
        .where(
          and(
            eq(commentsTable.id, id), // Comment with specified ID
            eq(commentsTable.userId, userId) // Written by the authenticated user
          )
        )
        .returning(); // Return the deleted row (if any)

      // If no comment was deleted (not found or not owned by user), throw error
      if (!deletedComment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found or you are not authorized to delete it.",
        });
      }

      // Return the deleted comment to the client
      return deletedComment;
    }),
  // Endpoint for users to create a comment (must be authenticated)
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.uuid(), // ID of the video to comment on
        content: z.string(), // Content of the comment
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get the user's ID from the authentication context
      const userId = ctx.user.id;
      const { videoId, content } = input;

      // Insert the new comment into the database and return the created row
      const [createdComment] = await db
        .insert(commentsTable)
        .values({ userId, videoId, content })
        .returning();
      return createdComment;
    }),

  // Endpoint to fetch a list of comments for a video, with pagination
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.uuid(), // ID of the video to fetch comments for
        // Optional cursor for pagination ("infinite scrolling")
        cursor: z.object({ id: z.uuid(), updatedAt: z.date() }).nullish(),
        // How many comments to fetch (between 1 and 100, default 5)
        limit: z.number().min(1).max(100).default(5),
      })
    )
    .query(async ({ input }) => {
      const { videoId, cursor, limit } = input;

      // Fetch comments from the database with pagination and include user info
      const data = await db
        .select({
          ...getTableColumns(commentsTable), // select all comment fields
          user: usersTable, // also join the user who wrote the comment
        })
        .from(commentsTable)
        .where(
          and(
            eq(commentsTable.videoId, videoId), // filter by video
            // If paginating, fetch comments "before" the cursor position
            cursor
              ? or(
                  lt(commentsTable.updatedAt, cursor.updatedAt),
                  and(
                    eq(commentsTable.updatedAt, cursor.updatedAt),
                    lt(commentsTable.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .innerJoin(usersTable, eq(commentsTable.userId, usersTable.id)) // join user table
        .orderBy(desc(commentsTable.updatedAt), desc(commentsTable.id)) // most recent first
        .limit(limit + 1); // Fetch one extra to check if there are more (for pagination)

      const hasMore = data.length > limit; // Check if more comments are available
      const items = hasMore ? data.slice(0, -1) : data; // Only send the requested number of comments
      const lastItem = items[items.length - 1]; // The last comment in this batch

      // If there are more, provide a cursor for the next page; else null
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      // Get the total number of comments for this video (for client display)
      const totalCount = await db.$count(
        commentsTable,
        eq(commentsTable.videoId, videoId)
      );
      // Return the paginated comments and the next cursor
      return { nextCursor, items, totalCount };
    }),
});
