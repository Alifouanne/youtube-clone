import { formatDuration } from "@/lib/utils";
import Image from "next/image";

interface VideoThumbnailProps {
  thumbnailUrl?: string | null;
  title: string;
  previewUrl?: string | null;
  duration: number;
}

const VideoThumbnail = ({
  thumbnailUrl,
  title,
  previewUrl,
  duration,
}: VideoThumbnailProps) => {
  // Preload preview image when component mounts

  return (
    <div className="relative group">
      {/* Thumbnail */}
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        <Image
          src={thumbnailUrl || "/placeholder.svg"}
          alt={title}
          fill
          className="size-full object-cover group-hover:opacity-0 transition-opacity duration-300 ease-in-out"
          priority={false}
          loading="lazy"
        />
        <Image
          src={previewUrl || "/placeholder.svg"}
          alt={title}
          fill
          className="size-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
          priority={false}
          loading="lazy"
        />
      </div>
      {/* Duration box */}
      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium ">
        {formatDuration(duration)}
      </div>
    </div>
  );
};

export default VideoThumbnail;
