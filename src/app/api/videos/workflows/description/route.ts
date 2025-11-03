// Import necessary dependencies for database access, AI integration, and API serving
import { db } from "@/database";
import { videoTable } from "@/database/schema";
import { ai } from "@/lib/gemini";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";

// Define the expected structure for incoming request payload
interface Input {
  userId: string;
  videoId: string;
}

// Export the POST endpoint handler for video description generation using Upstash's workflow
export const { POST } = serve(async (context) => {
  // Extract userId and videoId from the API request payload
  const { userId, videoId } = context.requestPayload as Input;

  // Step 1: Retrieve the target video owned by the requesting user
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

  // Step 2: Fetch the transcript file from Mux using the video's playback and track IDs
  const transcript = await context.run("get-transcript", async () => {
    // Construct the transcript URL
    const trackUrl = ` https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
    // Fetch the transcript text
    const response = await fetch(trackUrl);
    const text = await response.text();
    if (!text) {
      throw new Error("Bad request no transcript found");
    }
    return text;
  });

  // Step 3: Generate a summarized description using AI (Gemini)
  const generatedDescription = await context.run(
    "generate-ai-description",
    async () => {
      // Compose the system prompt with summarization instructions
      const SystemPrompt = ` Your task is to summarize the transcript of a video. Please
follow these guidelines:
- Be brief. Condense the content into a summary that captures the key points and main ideas without
losing important details.
- Avoid jargon or overly complex language unless necessary for the context.
- Focus on the most critical information, ignoring filler, repetitive statements, or irrelevant
tangents.
- ONLY return the summary, no other text, annotations, or comments.
- Aim for a summary that is 3-5 sentences long and no more than 200 characters. `;

      // Call the Gemini AI model with the prompt and transcript
      const completion = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "model",
            parts: [{ text: SystemPrompt }],
          },
          {
            role: "user",
            parts: [{ text: transcript }],
          },
        ],
        config: {
          temperature: 0.8,
        },
      });
      // Use the returned text, or fallback if quota is reached
      const content = completion.text || "Hit the limit today , try later.";

      // Return object with the generated content
      return { content };
    }
  );

  // Step 4: Update the video's description field in the database with the generated summary
  await context.run("update-video", async () => {
    await db
      .update(videoTable)
      .set({
        description: generatedDescription.content,
      })
      .where(
        and(
          eq(videoTable.id, video.id),
          eq(videoTable.uploaderId, video.uploaderId)
        )
      );
  });
});
