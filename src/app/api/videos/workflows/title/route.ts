// Import required modules and utilities for database access, AI, and API routing
import { db } from "@/database";
import { videoTable } from "@/database/schema";
import { ai } from "@/lib/gemini";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";

// Define the expected shape of the request payload for this endpoint
interface Input {
  userId: string;
  videoId: string;
}

// Export a POST handler via Upstash Workflows to generate an AI-powered video title
export const { POST } = serve(async (context) => {
  // Extract the user and video IDs from the request payload
  const { userId, videoId } = context.requestPayload as Input;

  // Step 1: Fetch the video belonging to the user from the database
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

  // Step 2: Retrieve the video's transcript from the Mux server using playback and track IDs
  const transcript = await context.run("get-transcript", async () => {
    const trackUrl = ` https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
    const response = await fetch(trackUrl);
    const text = await response.text();
    if (!text) {
      throw new Error("Bad request no transcript found");
    }
    return text;
  });

  // Step 3: Use Gemini AI to generate a SEO-friendly YouTube title given the transcript
  const generatedTitle = await context.run("generate-ai-title", async () => {
    // The AI instruction prompt, providing the requirements and format for the generated title
    const SystemPrompt = `Your task is to generate an SE0-focused title for a YouTube video based on its transcript. Please follow these guidelines:
- Be concise but descriptive, using relevant keywords to improve discoverability.
- Highlight the most compelling or unique aspect of the video content.
- Avoid jargon or overly complex language unless it directly supports searchability.
- Use action-oriented phrasing or clear value propositions where applicable.
- Ensure the title is 3-8 words long and no more than 100 characters.
- ONLY return the title as plain text. Do not add quotes or any additional formatting. `;

    // Ask the Gemini model for a title, using the provided transcript and system prompt
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
    // Use the AI-generated title, or a fallback if generation failed/limit reached
    const content = completion.text || "Hit the limit today , try later.";

    return { content };
  });

  // Step 4: Update the video's title in the database with the newly generated title
  await context.run("update-video", async () => {
    await db
      .update(videoTable)
      .set({
        title: generatedTitle.content,
      })
      .where(
        and(
          eq(videoTable.id, video.id),
          eq(videoTable.uploaderId, video.uploaderId)
        )
      );
  });
});
