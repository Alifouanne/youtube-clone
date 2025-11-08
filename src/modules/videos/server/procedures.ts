// --------------------------- IMPORTS AND DEPENDENCIES ---------------------------
// Import database instance and schema/table definitions for videos
import { db } from "@/database";
import { usersTable, videoTable, videoUpdateSchema } from "@/database/schema";

// Import Mux client for video asset management (uploads/processing/deletions)
import { mux } from "@/lib/mux";

// Import workflow utility for triggering Upstash/AI workflows (background jobs)
import { workflow } from "@/lib/workflow";

// Import tRPC helpers to define restricted (authenticated) endpoints and routers
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";

// tRPC error-handling construct for clear error signaling to consumers
import { TRPCError } from "@trpc/server";

// Import Drizzle ORM helpers for query composition
import { and, eq, getTableColumns } from "drizzle-orm";

// Import UploadThing API for managing uploads/removals of thumbnail and preview files
import { UTApi } from "uploadthing/server";

// Import Zod validation for input schemas
import z from "zod";

// --------------------------- tRPC VIDEO ROUTER DEFINITION ---------------------------

/**
 * The videoRouter exposes all mutations for managing user videos.
 * Endpoints are protected to allow only authenticated actions on owned resources.
 * Responsibilities include:
 *   - AI-powered title/description/thumbnail generation
 *   - Thumbnail restoration/management
 *   - Full video removal (DB + assets)
 *   - Video detail updates (title, metadata, visibility)
 *   - Creation of new uploads with Mux/session bootstrap
 */
export const videoRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ videoId: z.uuid() }))
    .query(async ({ input }) => {
      const [existingVideo] = await db
        .select({
          ...getTableColumns(videoTable),
          user: {
            ...getTableColumns(usersTable),
          },
        })
        .from(videoTable)
        .innerJoin(usersTable, eq(videoTable.uploaderId, usersTable.id))
        .where(eq(videoTable.id, input.videoId));
      if (!existingVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "There is no video found in Database",
        });
      }
      return existingVideo;
    }),
  /**
   * Trigger a background workflow to generate a suggested title for a video.
   * Only the authenticated owner can request this.
   * The actual title update is left to the user to accept/apply.
   */
  generateTitle: protectedProcedure
    .input(z.object({ videoId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Base URL for workflow depending on deployment environment
      const BASE_URL = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `${process.env.UPSTASH_WORKFLOW_URL}`;
      const { id: userId } = ctx.user;
      const { videoId } = input;

      // Trigger the AI workflow endpoint to suggest a title for this video
      await workflow.trigger({
        url: `${BASE_URL}/api/videos/workflows/title`,
        body: { userId, videoId },
      });
    }),

  /**
   * Initiate background AI workflow for generating a suggested description
   * for a given video, provided as a mutation for the owning user.
   */
  generateDescription: protectedProcedure
    .input(z.object({ videoId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const BASE_URL = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `${process.env.UPSTASH_WORKFLOW_URL}`;
      const { id: userId } = ctx.user;
      const { videoId } = input;

      // Trigger the workflow that prompts AI to generate this video's description
      await workflow.trigger({
        url: `${BASE_URL}/api/videos/workflows/description`,
        body: { userId, videoId },
      });
    }),

  /**
   * Request an AI-generated thumbnail for a video, given a user-provided prompt.
   * Enforces a minimum prompt length for better quality outcomes.
   */
  generateThumbnail: protectedProcedure
    .input(z.object({ videoId: z.uuid(), prompt: z.string().min(10) }))
    .mutation(async ({ ctx, input }) => {
      const BASE_URL = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `${process.env.UPSTASH_WORKFLOW_URL}`;
      const { id: userId } = ctx.user;
      const { videoId, prompt } = input;

      // Start workflow that generates and updates the thumbnail asset via AI/image
      await workflow.trigger({
        url: `${BASE_URL}/api/videos/workflows/thumbnail`,
        body: { userId, videoId, prompt },
      });
    }),

  /**
   * Restore a video's thumbnail to its original Mux asset preview.
   * This will remove a custom AI/uploaded thumbnail (if it exists) and
   * then download/rehash the public Mux thumbnail via UploadThing.
   * Only allows action by the current (authenticated) video owner.
   */
  restoreThumbnail: protectedProcedure
    .input(z.object({ videoId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;
      const utapi = new UTApi();

      // Retrieve the user's video; fail if missing or unauthorized
      const [video] = await db
        .select()
        .from(videoTable)
        .where(
          and(eq(videoTable.id, videoId), eq(videoTable.uploaderId, userId))
        );
      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No Video found to restore the thumbnail",
        });
      }

      // If there was a custom thumbnail, attempt to delete from UploadThing (no-fail)
      if (video.thumbnailKey) {
        try {
          await utapi.deleteFiles(video.thumbnailKey);
          console.log("🧹 Deleted old custom thumbnail:", video.thumbnailKey);
        } catch (error) {
          // Log and proceed even if deletion failed
          console.error("❌ Failed to delete UploadThing file:", error);
        }
      }

      // Video must have a muxPlaybackId in order to restore the Mux thumbnail preview
      if (!video.muxPlaybackId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No PlaybackId  found to restore the thumbnail",
        });
      }

      // Construct the public thumbnail URL at Mux for this asset
      const tempThumbnailUrl = `https://image.mux.com/${video.muxPlaybackId}/thumbnail.jpg`;

      // Upload the Mux thumbnail via URL into UploadThing storage
      const uploadedThumbnail = await utapi.uploadFilesFromUrl(
        tempThumbnailUrl
      );
      if (!uploadedThumbnail.data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "unable to upload file to uploadthing",
        });
      }
      const { key: thumbnailKey, ufsUrl: thumbnailUrl } =
        uploadedThumbnail.data;

      // Update this video's record to point to the new hosted thumbnail/image
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

      // Return the updated row (could be consumed for UI refresh)
      return updatedVideo;
    }),

  /**
   * Remove a video and its assets. This endpoint deletes:
   *   - the video record for this user
   *   - attached custom/AI thumbnails and preview files from storage
   *   - the original asset from Mux (if available)
   * All deletions are partial-fault-tolerant: logs, but doesn't block on error.
   */
  remove: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id: videoId } = input;
      const utapi = new UTApi();

      // Fetch/validate user ownership of the video to be deleted
      const [existVideo] = await db
        .select()
        .from(videoTable)
        .where(
          and(eq(videoTable.id, videoId), eq(videoTable.uploaderId, userId))
        );
      if (!existVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No video found to delete",
        });
      }

      // Remove custom/AI thumbnail and preview files if present
      const filesToDelete = [];
      if (existVideo.thumbnailKey) filesToDelete.push(existVideo.thumbnailKey);
      if (existVideo.previewKey) filesToDelete.push(existVideo.previewKey);

      // Delete all associated files from UploadThing (do not block if fails)
      if (filesToDelete.length > 0) {
        try {
          await utapi.deleteFiles(filesToDelete);
          console.log("🧹 Deleted UploadThing assets:", filesToDelete);
        } catch (error) {
          console.error("❌ Failed to delete UploadThing assets:", error);
        }
      }

      // Remove the main video asset from Mux (if available)
      if (existVideo.muxAssetId) {
        try {
          await mux.video.assets.delete(existVideo.muxAssetId);
          console.log("🗑️ Deleted Mux asset:", existVideo.muxAssetId);
        } catch (error) {
          console.error("❌ Failed to delete Mux asset:", error);
        }
      }

      // Actually remove the video DB entry for this user's record
      const [removedVideo] = await db
        .delete(videoTable)
        .where(
          and(eq(videoTable.id, input.id), eq(videoTable.uploaderId, userId))
        )
        .returning();

      if (!removedVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video deletion failed — record not found",
        });
      }
      return removedVideo;
    }),

  /**
   * Update main video details for an existing video, restricting to the current owner.
   * Updates allowed: title, description, category, and visibility.
   */
  update: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No Id found for the input",
        });
      }

      // Perform update of provided fields; update timestamp automatically
      const [updatedVideo] = await db
        .update(videoTable)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updatedAt: new Date(),
        })
        .where(
          and(eq(videoTable.id, input.id), eq(videoTable.uploaderId, userId))
        )
        .returning();

      if (!updatedVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "There is no updated video found",
        });
      }

      return updatedVideo;
    }),

  /**
   * Create a new video record and generate a secure Mux upload URL for direct upload.
   * Allows returning of the video DB row plus the upload URL to the client.
   * Asset is minimally titled and flagged as 'waiting' until upload completes.
   */
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    // Request an upload session from Mux, configure for streaming and subtitles
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId, // Useful for associating Mux events/webhooks
        playback_policies: ["public"],
        static_renditions: [
          { resolution: "1080p" },
          { resolution: "audio-only" },
          { resolution: "480p" },
          { resolution: "720p" },
        ],
        inputs: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English Auto-Generated",
              },
            ],
          },
        ],
      },
      cors_origin: "*", // Allow all client origins for in-browser upload
    });

    // Insert initial DB row for the new video; user will later update with desired metadata
    const [video] = await db
      .insert(videoTable)
      .values({
        uploaderId: userId,
        title: "Untitled", // Placeholder until the user supplies metadata
        muxStatus: "waiting", // Indicates asset is not yet processed/available
        muxUploadId: upload.id,
      })
      .returning();

    // Send both the DB video record and the newly-allocated Mux upload URL
    return { video: video, url: upload.url };
  }),
});
