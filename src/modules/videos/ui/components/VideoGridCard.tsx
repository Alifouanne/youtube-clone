import type { SuggestionsGetManyOutput } from "@/modules/suggestions/types";
import Link from "next/link";
import VideoThumbnail from "./VideoThumbnail";
import VideoInfo from "./VideoInfo";

interface VideoGridCardProps {
  data: SuggestionsGetManyOutput["items"][number];
  onRemove?: () => void;
}
const VideoGridCard = ({ data, onRemove }: VideoGridCardProps) => {
  return (
    <div className="flex flex-col gap-3 w-full group/card">
      <Link
        href={`/videos/${data.id}`}
        className="block overflow-hidden rounded-xl"
      >
        <div className="transition-transform duration-300 ease-out group-hover/card:scale-[1.02]">
          <VideoThumbnail
            thumbnailUrl={data.thumbnailUrl}
            previewUrl={data.previewUrl}
            title={data.title}
            duration={data.duration}
          />
        </div>
      </Link>
      <VideoInfo data={data} onRemove={onRemove} />
    </div>
  );
};

export default VideoGridCard;
