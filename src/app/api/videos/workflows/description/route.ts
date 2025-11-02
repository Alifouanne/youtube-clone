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
  const generatedDescription = await context.run(
    "generate-ai-description",
    async () => {
      const SystemPrompt = ` Your task is to summarize the transcript of a video. Please
follow these guidelines:
- Be brief. Condense the content into a summary that captures the key points and main ideas without
losing important details.
- Avoid jargon or overly complex language unless necessary for the context.
- Focus on the most critical information, ignoring filler, repetitive statements, or irrelevant
tangents.
- ONLY return the summary, no other text, annotations, or comments.
- Aim for a summary that is 3-5 sentences long and no more than 200 characters. `;

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
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
        max_completion_tokens: 300,
      });
      const content =
        completion.choices[0].message.content ||
        "Hit the limit today , try later.";

      return { content };
    }
  );

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
