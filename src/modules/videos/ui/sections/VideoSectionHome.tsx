"use client";

import { cn } from "@/lib/utils";
import ErrorFallback from "@/modules/home/ui/fallbacks/ErrorFallback";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import VideoPlayer from "../components/VideoPlayer";
import VideoBanner from "../components/VideoBanner";
import VideoTopRow from "../components/VideoTopRow";
import { useAuth } from "@clerk/nextjs";

interface VideoSectionHomeProps {
  videoId: string;
}
const VideoSectionHome = ({ videoId }: VideoSectionHomeProps) => {
  return (
    <Suspense fallback={<>Loading...</>}>
      <ErrorBoundary
        fallback={
          <ErrorFallback
            title="Unable to load the video"
            description="There was a problem loading your video. Please refresh the page or try again later."
          />
        }
      >
        <VideoSectionHomeSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const VideoSectionHomeSuspense = ({ videoId }: VideoSectionHomeProps) => {
  const [video] = trpc.videos.getOne.useSuspenseQuery({ videoId });
  return (
    <>
      <div
        className={cn(
          "aspect-video bg-black rounded-xl overflow-hidden relative",
          video.muxStatus !== "ready" && "rounded-b-none"
        )}
      >
        <VideoPlayer
          autoPlay
          onPlay={() => {}}
          playbackId={video.muxPlaybackId}
          thumbnailUrl={video.thumbnailUrl}
          videoId={video.id}
          videoTitle={video.title}
        />
      </div>
      <VideoBanner status={video.muxStatus} />
      <VideoTopRow video={video} />
    </>
  );
};
export default VideoSectionHome;
