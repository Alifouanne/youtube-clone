// Import the database client and table schemas
import { db } from "@/database";
import {
  usersTable,
  videoReactionTable,
  videoTable,
  videoViewsTable,
} from "@/database/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, not, or } from "drizzle-orm";
import { z } from "zod";

/**
 * suggestionsRouter defines API endpoints related to video suggestion
 *
 * Currently, it provides a paginated (cursor-based) endpoint to fetch suggested videos,
 * excluding a given video, with optional cursor for pagination.
 */
export const suggestionsRouter = createTRPCRouter({
  /**
   * getMany - Fetches a paginated list of suggested public videos.
   * Excludes the video specified by videoId and supports cursor-based pagination.
   *
   * Input:
   *   - cursor (optional): For pagination, containing id and updatedAt.
   *   - limit: Number of videos to return (max 100).
   *   - videoId: The video to exclude from the results (e.g., the one being watched).
   *
   * Returns:
   *   - items: Array of videos, each including user, view count, like count, dislike count.
   *   - nextCursor: Cursor for next page, or null if no more data.
   */
  getMany: baseProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
        videoId: z.uuid(),
      })
    )
    .query(async ({ input }) => {
      // Destructure input for use
      const { cursor, limit, videoId } = input;

      // Check if the referenced video exists by querying with the given videoId
      const [existingVideo] = await db
        .select()
        .from(videoTable)
        .where(eq(videoTable.id, videoId));

      // Throw an error if the video does not exist; do not suggest videos for a nonexistent reference
      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The referenced video does not exist.",
        });
      }

      // Construct and execute the query to fetch suggested videos.
      // Each item includes a user (uploader), the number of views, like count, and dislike count.
      const data = await db
        .select({
          ...getTableColumns(videoTable), // Include all columns from videoTable, e.g. id, title, etc.
          user: usersTable, // Include joined user (uploader) fields
          // Count the number of views for the video
          viewsCount: db.$count(
            videoViewsTable,
            eq(videoViewsTable.videoId, videoTable.id)
          ),
          // Count the number of 'like' reactions for the video
          likeCount: db.$count(
            videoReactionTable,
            and(
              eq(videoReactionTable.videoId, videoTable.id),
              eq(videoReactionTable.type, "like")
            )
          ),
          // Count the number of 'dislike' reactions for the video
          dislikeCount: db.$count(
            videoReactionTable,
            and(
              eq(videoReactionTable.videoId, videoTable.id),
              eq(videoReactionTable.type, "dislike")
            )
          ),
        })
        .from(videoTable)
        // Join uploader information (the user who uploaded the video)
        .innerJoin(usersTable, eq(videoTable.uploaderId, usersTable.id))
        .where(
          and(
            eq(videoTable.visibility, "public"), // Only include videos that are public
            existingVideo.categoryId
              ? eq(videoTable.categoryId, existingVideo.categoryId)
              : undefined, // If the referenced video has a category, suggest videos in same category
            not(eq(videoTable.id, videoId)), // Exclude the referenced video from suggestions
            // Apply cursor for pagination if provided
            cursor
              ? or(
                  lt(videoTable.updatedAt, cursor.updatedAt), // Fetch videos updated before the cursor
                  and(
                    eq(videoTable.updatedAt, cursor.updatedAt),
                    lt(videoTable.id, cursor.id) // If same update time, fetch only with smaller id
                  )
                )
              : undefined
          )
        )
        // Order videos by updatedAt descending, then id descending, for pagination consistency
        .orderBy(desc(videoTable.updatedAt), desc(videoTable.id))
        // Limit results (fetch one more to see if there's another page)
        .limit(limit + 1);

      // Determine if there's another page by checking if we fetched more than the requested limit
      const hasMore = data.length > limit;

      // Remove the extra item if it exists, to only return the requested number
      const items = hasMore ? data.slice(0, -1) : data;

      // Set the cursor for the next page if applicable
      // The cursor consists of the id & updatedAt of the last item returned
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      // Return the suggested items and the pagination cursor (or null if no more)
      return { items, nextCursor };
    }),
});
