// --- Import required dependencies for the video router functionality ---
import { db } from "@/database"; // Database instance
import { videoTable, videoUpdateSchema } from "@/database/schema"; // Video table and update schema from DB
import { mux } from "@/lib/mux"; // Mux API instance for video operations
import { workflow } from "@/lib/workflow";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"; // Helpers to define tRPC routers/procedures
import { TRPCError } from "@trpc/server"; // tRPC error handling
import { and, eq } from "drizzle-orm"; // SQL query helpers
import { UTApi } from "uploadthing/server"; // UploadThing API for storage management
import z from "zod"; // Validation library

/**
 * videoRouter: tRPC router providing endpoints to manage videos.
 * Exposes secured endpoints for restoring thumbnails, removing videos,
 * updating details, and initiating uploads for authenticated users.
 */
export const videoRouter = createTRPCRouter({
  generateTitle: protectedProcedure
    .input(z.object({ videoId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const BASE_URL = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `${process.env.UPSTASH_WORKFLOW_URL}`;
      const { id: userId } = ctx.user;
      const { videoId } = input;
      const { workflowRunId } = await workflow.trigger({
        url: `${BASE_URL}/api/videos/workflows/title`,
        body: { userId, videoId },
      });
    }),
  generateDescription: protectedProcedure
    .input(z.object({ videoId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const BASE_URL = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `${process.env.UPSTASH_WORKFLOW_URL}`;
      const { id: userId } = ctx.user;
      const { videoId } = input;
      const { workflowRunId } = await workflow.trigger({
        url: `${BASE_URL}/api/videos/workflows/description`,
        body: { userId, videoId },
      });
    }),
  generateThumbnail: protectedProcedure
    .input(z.object({ videoId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const BASE_URL = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `${process.env.UPSTASH_WORKFLOW_URL}`;
      const { id: userId } = ctx.user;
      const { videoId } = input;
      const { workflowRunId } = await workflow.trigger({
        url: `${BASE_URL}/api/videos/workflows/thumbnail`,
        body: { userId, videoId },
      });
    }),
  /**
   * Endpoint: restoreThumbnail
   * Restores original thumbnail from Mux for an owned video.
   * Cleans up any custom thumbnail from UploadThing first.
   */
  restoreThumbnail: protectedProcedure
    .input(z.object({ videoId: z.uuid() })) // Validate input
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;
      const utapi = new UTApi();

      // Fetch video by id which belongs to the current user
      const [video] = await db
        .select()
        .from(videoTable)
        .where(
          and(eq(videoTable.id, videoId), eq(videoTable.uploaderId, userId))
        );

      // If video not found or not owned, throw an error
      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No Video found to restore the thumbnail",
        });
      }

      // Remove any custom thumbnail from UploadThing, if it exists
      if (video.thumbnailKey) {
        try {
          await utapi.deleteFiles(video.thumbnailKey);
          console.log("🧹 Deleted old custom thumbnail:", video.thumbnailKey);
        } catch (error) {
          // Continue on errors; log for debugging
          console.error("❌ Failed to delete UploadThing file:", error);
        }
      }

      // Require a muxPlaybackId to restore thumbnail from Mux
      if (!video.muxPlaybackId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No PlaybackId  found to restore the thumbnail",
        });
      }

      // Build the thumbnail URL using Mux playback ID
      const tempThumbnailUrl = `https://image.mux.com/${video.muxPlaybackId}/thumbnail.jpg`;

      // Upload the Mux thumbnail to UploadThing to obtain new storage details
      const uploadedThumbnail = await utapi.uploadFilesFromUrl(
        tempThumbnailUrl
      );

      // If upload fails, abort and respond with error
      if (!uploadedThumbnail.data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "unable to upload file to uploadthing",
        });
      }

      // Extract storage key and direct URL for new thumbnail
      const { key: thumbnailKey, ufsUrl: thumbnailUrl } =
        uploadedThumbnail.data;

      // Update video record's thumbnail metadata in the DB
      const [updatedVideo] = await db
        .update(videoTable)
        .set({
          thumbnailUrl: thumbnailUrl,
          thumbnailKey: thumbnailKey,
        })
        .where(
          and(eq(videoTable.id, videoId), eq(videoTable.uploaderId, userId))
        )
        .returning();

      // Return updated video information
      return updatedVideo;
    }),

  /**
   * Endpoint: remove
   * Deletes a video owned by the authenticated user along with relevant assets.
   */
  remove: protectedProcedure
    .input(z.object({ id: z.uuid() })) // Validate UUID input for video ID
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id: videoId } = input;
      const utapi = new UTApi();

      // Retrieve the targeted video belonging to the user
      const [existVideo] = await db
        .select()
        .from(videoTable)
        .where(
          and(eq(videoTable.id, videoId), eq(videoTable.uploaderId, userId))
        );

      // If video is not found, throw NOT_FOUND error
      if (!existVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No video found to delete",
        });
      }

      // Gather all associated asset keys to delete from UploadThing
      const filesToDelete = [];
      if (existVideo.thumbnailKey) filesToDelete.push(existVideo.thumbnailKey);
      if (existVideo.previewKey) filesToDelete.push(existVideo.previewKey);

      // Attempt to delete associated thumbnails and previews from UploadThing
      if (filesToDelete.length > 0) {
        try {
          await utapi.deleteFiles(filesToDelete);
          console.log("🧹 Deleted UploadThing assets:", filesToDelete);
        } catch (error) {
          // Log any deletion failure, but continue process
          console.error("❌ Failed to delete UploadThing assets:", error);
        }
      }

      // Attempt to delete the asset from Mux, if present
      if (existVideo.muxAssetId) {
        try {
          await mux.video.assets.delete(existVideo.muxAssetId);
          console.log("🗑️ Deleted Mux asset:", existVideo.muxAssetId);
        } catch (error) {
          // Log Mux deletion failures for debugging
          console.error("❌ Failed to delete Mux asset:", error);
        }
      }

      // Remove the video record from the DB
      const [removedVideo] = await db
        .delete(videoTable)
        .where(
          and(eq(videoTable.id, input.id), eq(videoTable.uploaderId, userId))
        )
        .returning();

      // If the DB deletion did not actually remove a row, error
      if (!removedVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video deletion failed — record not found",
        });
      }
      // Return the deleted video row
      return removedVideo;
    }),

  /**
   * Endpoint: update
   * Updates details for a user's video (title, description, etc).
   * Only allowed for the authenticated owner of the video.
   */
  update: protectedProcedure
    .input(videoUpdateSchema) // Validate update shape using zod schema
    .mutation(async ({ ctx, input }) => {
      // Enforce that the video ID is provided in update payload
      const { id: userId } = ctx.user;
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No Id found for the input",
        });
      }

      // Update designated fields for the video in DB, restrict by ownership
      const [updatedVideo] = await db
        .update(videoTable)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updatedAt: new Date(), // Mark update time
        })
        .where(
          and(eq(videoTable.id, input.id), eq(videoTable.uploaderId, userId))
        )
        .returning();

      // If no video was actually updated, signal not found
      if (!updatedVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "There is no updated video found",
        });
      }

      // Return updated video row
      return updatedVideo;
    }),

  /**
   * Endpoint: create
   * Starts a new upload session with Mux (generating a secure upload URL)
   * and creates a corresponding placeholder video row in the DB.
   * Only available to authenticated users.
   */
  create: protectedProcedure.mutation(async ({ ctx }) => {
    // Get user ID for passthrough field and DB ownership
    const { id: userId } = ctx.user;

    // Request a new upload slot from Mux with asset and subtitle settings
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId, // Used for webhook linkage
        playback_policies: ["public"], // Allow public playback
        static_renditions: [
          { resolution: "1080p" }, // Full HD
          { resolution: "audio-only" }, // Audio-only track
          { resolution: "480p" }, // SD quality
          { resolution: "720p" }, // HD quality
        ],
        inputs: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English Auto-Generated", // Enable English auto-subtitles
              },
            ],
          },
        ],
      },
      cors_origin: "*", // Allow upload from any origin
    });

    // Insert a new row with minimal placeholder data, referencing upload ID
    const [video] = await db
      .insert(videoTable)
      .values({
        uploaderId: userId,
        title: "Untitled", // Temp title; to be updated by user
        muxStatus: "waiting", // Indicates pending/uploading state
        muxUploadId: upload.id, // Store Mux upload ID for tracking
      })
      .returning();

    // Return both the database entry and the secure upload URL
    return { video: video, url: upload.url };
  }),
});
