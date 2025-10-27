// Imports all dependencies needed for querying the database,
// handling input validation, routing, and building SQL queries.
import { db } from "@/database";
import { videoTable } from "@/database/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, lt, or } from "drizzle-orm";
import { z } from "zod";

// Defines the tRPC router for the studio module.
// This router contains procedures for authenticated users
// to manage and retrieve their uploaded videos.
export const studioRouter = createTRPCRouter({
  // Exposes a query to retrieve a single video
  // belonging to the authenticated user by id.
  getOne: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id } = input;

      // Selects the video record by id and ensures it belongs to the user.
      const [video] = await db
        .select()
        .from(videoTable)
        .where(and(eq(videoTable.id, id), eq(videoTable.uploaderId, userId)));

      // Throws a TRPC error if the video was not found or does not belong to the user.
      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }
      // Returns the found video.
      return video;
    }),

  // Provides a paginated list of videos uploaded by the authenticated user.
  // Uses cursor-based pagination for efficient navigation of large datasets.
  getMany: protectedProcedure
    .input(
      z.object({
        // The cursor is optional; if present, it indicates where to resume fetching videos.
        cursor: z
          .object({
            id: z.uuid(), // The UUID of the last fetched video in the previous batch.
            updatedAt: z.date(), // The updatedAt timestamp of the last fetched video.
          })
          .nullish(),

        // The maximum number of videos to fetch in one request.
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;

      // Constructs a query that fetches videos belonging to the user, optionally paginated by cursor.
      // If a cursor is provided, selects videos "before" the cursor (i.e., more recent).
      // Results are ordered by updatedAt descending, then id descending for uniqueness.
      // Fetches one more than the requested limit to determine if there is a next page.
      const data = await db
        .select()
        .from(videoTable)
        .where(
          and(
            eq(videoTable.uploaderId, userId),
            cursor
              ? or(
                  lt(videoTable.updatedAt, cursor.updatedAt),
                  and(
                    eq(videoTable.updatedAt, cursor.updatedAt),
                    lt(videoTable.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(videoTable.updatedAt), desc(videoTable.id))
        .limit(limit + 1);

      // Checks if more results exist after this page.
      const hasMore = data.length > limit;

      // Trims the array to the requested page size.
      const items = hasMore ? data.slice(0, -1) : data;

      // Prepares the next cursor if there are additional results available.
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      // Returns the videos and the pagination cursor for further fetching.
      return { items, nextCursor };
    }),
});
