// Import necessary modules for database, AI, file storage, and routing
import { db } from "@/database";
import { videoTable } from "@/database/schema";
import { runware } from "@/lib/runware";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

// Define the required structure for the input payload
interface Input {
  videoId: string;
  userId: string;
  prompt: string;
}

// Export the POST endpoint using Upstash's workflow runner
export const { POST } = serve(async (context) => {
  // Extract input parameters from the request payload
  const { videoId, userId, prompt } = context.requestPayload as Input;
  const utapi = new UTApi();

  // 1. Fetch the video owned by the requesting user, or throw if not found
  const video = await context.run("get-video", async () => {
    const [existVideo] = await db
      .select()
      .from(videoTable)
      .where(
        and(eq(videoTable.id, videoId), eq(videoTable.uploaderId, userId))
      );
    if (!existVideo) {
      throw new Error("Video not found");
    }
    return existVideo;
  });

  // 2. Remove old thumbnail from storage if it exists and clear DB references
  await context.run("thumbnail-cleanup", async () => {
    if (video.thumbnailKey) {
      // Delete the previous thumbnail file from uploadthing
      await utapi.deleteFiles(video.thumbnailKey);

      // Set thumbnailKey and thumbnailUrl in the video record to null
      await db
        .update(videoTable)
        .set({
          thumbnailKey: null,
          thumbnailUrl: null,
        })
        .where(
          and(eq(videoTable.id, videoId), eq(videoTable.uploaderId, userId))
        );
    }
  });

  // 3. Generate a new thumbnail image using runware (AI image generation)
  const thumbnailImage = await context.run(
    "generate-thumbnail-image",
    async () => {
      // Request image generation from runware AI with the provided prompt
      const response = await runware.requestImages({
        model: "runware:100@1",
        positivePrompt: prompt,
        width: 1280,
        height: 768,
      });

      // Extract image URL from the AI response
      const imageUrl = response?.[0].imageURL;
      if (!imageUrl) {
        throw new Error("No image data returned from Gemini");
      }

      // Upload the generated image to uploadthing storage
      const file = await utapi.uploadFilesFromUrl(imageUrl);

      // Return data about the new file to be saved in the DB
      return { newFile: file.data };
    }
  );

  // 4. Update the video record with the new thumbnail file data (key and url)
  await context.run("update-video", async () => {
    await db
      .update(videoTable)
      .set({
        thumbnailKey: thumbnailImage?.newFile?.key,
        thumbnailUrl: thumbnailImage?.newFile?.ufsUrl,
      })
      .where(
        and(
          eq(videoTable.id, video.id),
          eq(videoTable.uploaderId, video.uploaderId)
        )
      );
  });
});
