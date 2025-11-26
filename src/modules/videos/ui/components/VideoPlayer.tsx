"use client";

// Import the MuxPlayer React component for video playback
import MuxPlayer from "@mux/mux-player-react";
// Import a Skeleton component for loading states
import { Skeleton } from "@/components/ui/skeleton";

// Define the props expected by the VideoPlayer component
interface VideoPlayerProps {
  playbackId?: string | null | undefined; // Unique ID for playback from Mux
  thumbnailUrl?: string | null | undefined; // Optional video thumbnail URL
  autoPlay?: boolean; // Whether to autoplay the video
  onPlay?: () => void; // Optional callback triggered when video starts playing
  videoId?: string | null | undefined; // Internal video identifier (optional)
  videoTitle?: string | null | undefined; // Title of video, for metadata (optional)
}

// Skeleton loader component displayed while the video player is loading
export const VideoPlayerSkeleton = () => {
  return (
    <div className="aspect-video">
      {/* Displays a skeleton placeholder in a 16:9 aspect ratio */}
      <Skeleton className="w-full h-full rounded-xl" />
    </div>
  );
};

// Main video player component that wraps MuxPlayer
const VideoPlayer = ({
  playbackId,
  thumbnailUrl,
  autoPlay,
  onPlay,
  videoId,
  videoTitle,
}: VideoPlayerProps) => {
  return (
    <MuxPlayer
      playbackId={playbackId || ""} // Use playbackId or empty string as fallback
      // Set video metadata for tracking and analytics
      metadata={{ video_id: { videoId }, video_title: { videoTitle } }}
      // Poster image to show before the video loads
      poster={thumbnailUrl || "/placeholder.svg"}
      playerInitTime={0} // Start playback from the beginning
      autoPlay={autoPlay} // Enable or disable auto play
      thumbnailTime={0} // Generate thumbnails from start of the video
      className="w-full h-full object-contain" // Sizing and object-fit styling
      accentColor="#ff2056" // Customize player's accent color
      onPlay={onPlay} // Callback when the video is played
    />
  );
};

// Export the VideoPlayer component as default
export default VideoPlayer;
