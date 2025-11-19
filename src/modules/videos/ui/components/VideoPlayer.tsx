"use client";
import MuxPlayer from "@mux/mux-player-react";
import { Skeleton } from "@/components/ui/skeleton";
interface VideoPlayerProps {
  playbackId?: string | null | undefined;
  thumbnailUrl?: string | null | undefined;
  autoPlay?: boolean;
  onPlay?: () => void;
  videoId?: string | null | undefined;
  videoTitle?: string | null | undefined;
}
export const VideoPlayerSkeleton = () => {
  return (
    <div className="aspect-video">
      <Skeleton className="w-full h-full rounded-xl" />
    </div>
  );
};
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
      playbackId={playbackId || ""}
      metadata={{ video_id: { videoId }, video_title: { videoTitle } }}
      poster={thumbnailUrl || "/placeholder.svg"}
      playerInitTime={0}
      autoPlay={autoPlay}
      thumbnailTime={0}
      className="w-full h-full object-contain"
      accentColor="#ff2056"
      onPlay={onPlay}
    />
  );
};

export default VideoPlayer;
