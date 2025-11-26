import { db } from "@/database";
import {
  commentReactionTable,
  commentsTable,
  usersTable,
} from "@/database/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  isNull,
  lt,
  or,
} from "drizzle-orm";
import z from "zod";

/**
 * Comments Router
 *
 * Handles all TRPC endpoints related to comments, including liking, disliking,
 * creating, deleting, and fetching comments for a specific video. Also manages
 * comment reactions and pagination/cursor logic.
 */
export const commentsRouter = createTRPCRouter({
  /**
   * Like or unlike a comment.
   * - If already liked, removes like (toggle off).
   * - If not liked, creates a like or updates an existing reaction to "like".
   */
  like: protectedProcedure
    .input(z.object({ commentId: z.uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input;
      const userId = ctx.user.id;

      // Check if the user already liked this comment.
      const [existingReaction] = await db
        .select()
        .from(commentReactionTable)
        .where(
          and(
            eq(commentReactionTable.commentId, commentId),
            eq(commentReactionTable.userId, userId),
            eq(commentReactionTable.type, "like")
          )
        );
      // If already liked, remove the like (toggle/undo).
      if (existingReaction) {
        const [deleted] = await db
          .delete(commentReactionTable)
          .where(
            and(
              eq(commentReactionTable.commentId, commentId),
              eq(commentReactionTable.userId, userId)
            )
          )
          .returning();
        return deleted;
      }
      // Otherwise, create or switch the reaction to "like".
      const [created] = await db
        .insert(commentReactionTable)
        .values({
          userId,
          commentId,
          type: "like",
        })
        .onConflictDoUpdate({
          target: [commentReactionTable.commentId, commentReactionTable.userId],
          set: { type: "like" },
        })
        .returning();
      return created;
    }),

  /**
   * Dislike or remove dislike from a comment.
   * - If already disliked, removes dislike (toggle off).
   * - If not disliked, creates a dislike or updates an existing reaction to "dislike".
   */
  dislike: protectedProcedure
    .input(z.object({ commentId: z.uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input;
      const userId = ctx.user.id;

      // Check if the user already disliked this comment.
      const [existingReaction] = await db
        .select()
        .from(commentReactionTable)
        .where(
          and(
            eq(commentReactionTable.commentId, commentId),
            eq(commentReactionTable.userId, userId),
            eq(commentReactionTable.type, "dislike")
          )
        );
      // If already disliked, remove the dislike (toggle/undo).
      if (existingReaction) {
        const [deleted] = await db
          .delete(commentReactionTable)
          .where(
            and(
              eq(commentReactionTable.commentId, commentId),
              eq(commentReactionTable.userId, userId)
            )
          )
          .returning();
        return deleted;
      }
      // Otherwise, create or switch the reaction to "dislike".
      const [created] = await db
        .insert(commentReactionTable)
        .values({
          userId,
          commentId,
          type: "dislike",
        })
        .onConflictDoUpdate({
          target: [commentReactionTable.commentId, commentReactionTable.userId],
          set: { type: "dislike" },
        })
        .returning();
      return created;
    }),

  /**
   * Remove a comment authored by the current user.
   * Checks ownership and returns the deleted comment, or throws if unauthorized/not found.
   */
  remove: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { id } = input;

      // Try to delete the comment, ensuring the current user is the author.
      const [deletedComment] = await db
        .delete(commentsTable)
        .where(and(eq(commentsTable.id, id), eq(commentsTable.userId, userId)))
        .returning();

      // If not found, throw error (not authorized or comment doesn't exist).
      if (!deletedComment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found or you are not authorized to delete it.",
        });
      }

      return deletedComment;
    }),

  /**
   * Create a new comment or reply.
   * - If parentId is given, validates parent comment exists and replies to replies are prevented.
   */
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.uuid(),
        content: z.string(),
        parentId: z.uuid().nullish(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const { videoId, content, parentId } = input;

      // If replying, ensure parent comment exists.
      const [existingComment] = await db
        .select()
        .from(commentsTable)
        .where(inArray(commentsTable.id, parentId ? [parentId] : []));

      if (!existingComment && parentId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Parent comment not found. You cannot reply to a comment that does not exist.",
        });
      }

      // Prevent replies to replies (only allow one nested level).
      if (existingComment?.parentId && parentId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Replies to replies are not allowed.",
        });
      }

      // Insert the new comment or reply.
      const [createdComment] = await db
        .insert(commentsTable)
        .values({ userId, videoId, content, parentId })
        .returning();
      return createdComment;
    }),

  /**
   * Fetch many comments for a video (paginated).
   * - Supports cursor-based pagination.
   * - Can fetch top-level comments or replies for a parent comment.
   * - Includes user details, reaction info, and counts (likes, dislikes, replies).
   *
   * Input:
   *    videoId: UUID of the video.
   *    parentId: (optional) UUID of comment (for fetching replies)
   *    cursor: (optional) pagination cursor { id, updatedAt }
   *    limit: number of comments to fetch (default 5)
   *
   * Returns:
   *    items: comments (with metadata & reactions)
   *    nextCursor: the next cursor for paginating.
   *    totalCount: total number of top-level comments for the video.
   */
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.uuid(),
        parentId: z.uuid().nullish(),
        cursor: z.object({ id: z.uuid(), updatedAt: z.date() }).nullish(),
        limit: z.number().min(1).max(100).default(5),
      })
    )
    .query(async ({ input, ctx }) => {
      const { videoId, cursor, limit, parentId } = input;
      const { clerkUserId } = ctx;
      let userId;

      // Find userId (if logged in) so we can join in per-user reaction info.
      const [user] = await db
        .select()
        .from(usersTable)
        .where(inArray(usersTable.clerkId, clerkUserId ? [clerkUserId] : []));
      if (user) {
        userId = user.id;
      }

      // Prepare CTE for the current user's reactions to display (like/dislike).
      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            commentId: commentReactionTable.commentId,
            type: commentReactionTable.type,
          })
          .from(commentReactionTable)
          .where(inArray(commentReactionTable.userId, userId ? [userId] : []))
      );

      // Prepare CTE for counting replies to each comment.
      const replies = db.$with("replies").as(
        db
          .select({
            parentId: commentsTable.parentId,
            count: count(commentsTable.id).as("count"),
          })
          .from(commentsTable)
          .where(isNotNull(commentsTable.parentId))
          .groupBy(commentsTable.parentId)
      );

      /**
       * Query for comments:
       * - Can filter for top-level (parentId is null) or replies to a parent
       * - Joins in user data, per-comment reaction, and reply/like/dislike counts
       * - Implements cursor-based pagination for infinite loading
       */
      const data = await db
        .with(viewerReactions, replies)
        .select({
          ...getTableColumns(commentsTable), // All columns from the comments table
          user: usersTable, // The comment author's user details
          viewerReaction: viewerReactions.type, // The logged-in user's reaction (if any)
          replyCount: replies.count, // Number of replies to this comment
          likeCount: db.$count(
            commentReactionTable,
            and(
              eq(commentReactionTable.commentId, commentsTable.id),
              eq(commentReactionTable.type, "like")
            )
          ),
          dislikeCount: db.$count(
            commentReactionTable,
            and(
              eq(commentReactionTable.commentId, commentsTable.id),
              eq(commentReactionTable.type, "dislike")
            )
          ),
        })
        .from(commentsTable)
        .where(
          and(
            eq(commentsTable.videoId, videoId),
            // If parentId specified, fetch replies for that comment
            parentId
              ? eq(commentsTable.parentId, parentId)
              : // Otherwise, fetch top-level comments (parentId is null)
                isNull(commentsTable.parentId),
            // Apply cursor pagination if cursor is given
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
        .innerJoin(usersTable, eq(commentsTable.userId, usersTable.id))
        .leftJoin(
          viewerReactions,
          eq(viewerReactions.commentId, commentsTable.id)
        )
        .leftJoin(replies, eq(commentsTable.id, replies.parentId))
        // Order newest first, with id as tiebreaker for deterministic cursor
        .orderBy(desc(commentsTable.updatedAt), desc(commentsTable.id))
        // Fetch one extra row to determine if there are more (for cursor)
        .limit(limit + 1);

      // Pagination logic: check if there are more items after this page
      const hasMore = data.length > limit;
      // Return only the limited slice for this page
      const items = hasMore ? data.slice(0, -1) : data;
      // Last loaded item (for preparing next cursor)
      const lastItem = items[items.length - 1];

      // Next cursor for infinite pagination
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      // Total count of top-level comments (for UI purposes)
      // Note: this does NOT count replies.
      const totalCount = await db.$count(
        commentsTable,
        and(
          eq(commentsTable.videoId, videoId),
          parentId
            ? eq(commentsTable.parentId, parentId)
            : isNull(commentsTable.parentId)
        )
      );
      return { nextCursor, items, totalCount };
    }),
});
