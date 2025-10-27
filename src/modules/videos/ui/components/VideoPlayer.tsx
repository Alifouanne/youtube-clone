"use client";
import MuxPlayer from "@mux/mux-player-react";
interface VideoPlayerProps {
  playbackId?: string | null | undefined;
  thumbnailUrl?: string | null | undefined;
  autoPlay?: boolean;
  onPlay?: () => void;
  videoId?: string | null | undefined;
  videoTitle?: string | null | undefined;
}
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
