"use client";

// Utility and library imports
import { cn } from "@/lib/utils";
import ErrorFallback from "@/modules/home/ui/fallbacks/ErrorFallback";
import { trpc } from "@/trpc/client";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import VideoPlayer from "../components/VideoPlayer";
import VideoBanner from "../components/VideoBanner";
import VideoTopRow from "../components/VideoTopRow";
import { useAuth } from "@clerk/nextjs";

// Props definition for the main video section component
interface VideoSectionHomeProps {
  videoId: string; // Unique identifier for the video
}

/**
 * VideoSectionHome
 *
 * Top-level section for rendering a home page video experience.
 * Handles suspense loading, error fallback, and delegates real rendering
 * to `VideoSectionHomeSuspense`.
 */
const VideoSectionHome = ({ videoId }: VideoSectionHomeProps) => {
  return (
    // Suspense boundary shows fallback while loading (SSR/async support)
    <Suspense fallback={<>Loading...</>}>
      {/* ErrorBoundary catches rendering errors and shows fallback */}
      <ErrorBoundary
        fallback={
          <ErrorFallback
            title="Unable to load the video"
            description="There was a problem loading your video. Please refresh the page or try again later."
          />
        }
      >
        {/* Core video section logic is implemented in this sub-component */}
        <VideoSectionHomeSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

/**
 * VideoSectionHomeSuspense
 *
 * Responsible for fetching, rendering, and handling logic for a single video.
 * Includes:
 *  - Querying video data
 *  - Handling view event (track unique play for signed in users)
 *  - Rendering video player, banner, and top navigation/info row
 */
const VideoSectionHomeSuspense = ({ videoId }: VideoSectionHomeProps) => {
  // Used to prevent double-counting views in the current session
  const [viewRecorded, setViewRecorded] = useState(false);

  // Destructure isSignedIn to check auth state
  const { isSignedIn } = useAuth();

  // Get TRPC helper utils for invalidation, etc.
  const utils = trpc.useUtils();

  // Suspense query to fetch video data (waits for result)
  const [video] = trpc.videos.getOne.useSuspenseQuery({ videoId });

  // Mutation to record a video view, with cache invalidation on success
  const createView = trpc.videos.createView.useMutation({
    onSuccess: () => {
      // Invalidate the cached video, so it refetches with up-to-date data (e.g., view count)
      utils.videos.getOne.invalidate({ videoId });
    },
  });

  /**
   * handlePlay
   * Called when the user plays the video.
   * If user is signed in and view hasn't been recorded this session, records a view in DB.
   */
  const handlePlay = () => {
    if (!isSignedIn || viewRecorded) return; // Avoid duplicate or unauthorized view records
    createView.mutate({ videoId });
    setViewRecorded(true); // Prevent double-record for same session
  };

  return (
    <>
      {/* Video player area, styled container */}
      <div
        className={cn(
          "aspect-video bg-black rounded-xl overflow-hidden relative", // Appearance for standard state
          video.muxStatus !== "ready" && "rounded-b-none" // Lose bottom round if not ready (e.g., processing)
        )}
      >
        {/* VideoPlayer renders the actual player, passes playback info and events */}
        <VideoPlayer
          autoPlay
          onPlay={handlePlay}
          playbackId={video.muxPlaybackId}
          thumbnailUrl={video.thumbnailUrl}
          videoId={video.id}
          videoTitle={video.title}
        />
      </div>
      {/* Banner for displaying status info, e.g., "Processing", "Failed", etc. */}
      <VideoBanner status={video.muxStatus} />
      {/* Top row contains title, controls, etc. */}
      <VideoTopRow video={video} />
    </>
  );
};

export default VideoSectionHome;
