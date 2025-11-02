import { db } from "@/database";
import { videoTable } from "@/database/schema";
import { groq } from "@/lib/groq";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";

interface Input {
  userId: string;
  videoId: string;
}

export const { POST } = serve(async (context) => {
  const { userId, videoId } = context.requestPayload as Input;

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
  const transcript = await context.run("get-transcript", async () => {
    const trackUrl = ` https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
    const response = await fetch(trackUrl);
    const text = await response.text();
    if (!text) {
      throw new Error("Bad request no transcript found");
    }
    return text;
  });
  const generatedTitle = await context.run("generate-ai-title", async () => {
    const SystemPrompt = `Your task is to generate an SE0-focused title for a YouTube video based on its transcript. Please follow these guidelines:
- Be concise but descriptive, using relevant keywords to improve discoverability.
- Highlight the most compelling or unique aspect of the video content.
- Avoid jargon or overly complex language unless it directly supports searchability.
- Use action-oriented phrasing or clear value propositions where applicable.
- Ensure the title is 3-8 words long and no more than 100 characters.
- ONLY return the title as plain text. Do not add quotes or any additional formatting. `;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: SystemPrompt,
        },
        {
          role: "user",
          content: transcript,
        },
      ],
      temperature: 0.8,
      max_completion_tokens: 200,
    });
    const content =
      completion.choices[0].message.content ||
      "Hit the limit today , try later.";

    return { content };
  });

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
