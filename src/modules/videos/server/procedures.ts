import { db } from "@/database";
import { videoTable, videoUpdateSchema } from "@/database/schema";
import { mux } from "@/lib/mux";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

// This router provides endpoints for video mutations, such as updating video details and creating new video uploads.
export const videoRouter = createTRPCRouter({
  update: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      // Ensure that input includes an id
      const { id: userId } = ctx.user;
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No Id found for the input",
        });
      }
      // Update the video record with the provided data, only if the uploader matches the current user
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
      // Throw an error if no video was found to update
      if (!updatedVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "There is no updated video found",
        });
      }
    }),
  create: protectedProcedure.mutation(async ({ ctx }) => {
    // Create a new video upload on Mux for the current user
    const { id: userId } = ctx.user;

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId, // Attach user ID as passthrough for later lookups
        playback_policies: ["public"], // Set uploaded video to be publicly viewable
        static_renditions: [
          { resolution: "1080p" }, // Enable 1080p video rendition
          { resolution: "audio-only" }, // Provide audio-only playback
          { resolution: "480p" }, // Enable 480p video rendition
          { resolution: "720p" }, // Enable 720p video rendition
        ],
        inputs: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English Auto-Generated", // Add auto-generated English subtitles
              },
            ],
          },
        ],
      },
      cors_origin: "*", // Accept uploads from any domain/origin
    });

    // Store a placeholder record for the new video in the database
    const [video] = await db
      .insert(videoTable)
      .values({
        uploaderId: userId,
        title: "Untitled",
        muxStatus: "waiting",
        muxUploadId: upload.id,
      })
      .returning();

    // Return both the DB video record and the Mux upload URL to the client
    return { video: video, url: upload.url };
  }),
});
