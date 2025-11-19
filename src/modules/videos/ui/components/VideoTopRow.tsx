import { format, formatDistanceToNow } from "date-fns";
import { VideoGetOneOutput } from "../../types";
import VideoDescription from "./VideoDescription";
import VideoMenu from "./VideoMenu";
import VideoOwner from "./VideoOwner";
import VideoReactions from "./VideoReactions";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoTopRowProps {
  video: VideoGetOneOutput;
}

export const VideoTopRowSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 mt-4">
      <Skeleton className="h-7 w-3/4 sm:w-2/3" />
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40 sm:w-56" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 sm:mb-0 gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
};

const VideoTopRow = ({ video }: VideoTopRowProps) => {
  const compactViews = Intl.NumberFormat("en", {
    notation: "compact",
  }).format(video.viewsCount);

  const expandedViews = Intl.NumberFormat("en", {
    notation: "standard",
  }).format(video.viewsCount);
  const compactDate = formatDistanceToNow(video.createdAt, { addSuffix: true });
  const expandedDate = format(video.createdAt, "d MMM yyy");
  return (
    <div className="flex flex-col gap-4 mt-4">
      <h1 className="text-xl font-semibold">{video.title}</h1>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <VideoOwner user={video.user} id={video.id} />
        <div className="flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 sm:mb-0 gap-2">
          <VideoReactions
            videoId={video.id}
            initialLikes={video.likeCount}
            initialDislikes={video.dislikeCount}
            initialReaction={video.currentViewerReaction}
          />
          <VideoMenu
            videoId={video.id}
            variant="secondary"
            showDownload={false}
            showReport={false}
            showWatchLater={false}
          />
        </div>
      </div>
      <VideoDescription
        description={video.description}
        compactDate={compactDate}
        expandedDate={expandedDate}
        compactViews={compactViews}
        expandedViews={expandedViews}
      />
    </div>
  );
};

export default VideoTopRow;
