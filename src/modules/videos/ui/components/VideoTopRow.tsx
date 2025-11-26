// Import date-fns utilities for formatting dates
import { format, formatDistanceToNow } from "date-fns";
// Import type for the video object
import { VideoGetOneOutput } from "../../types";
// Import UI components used in the top row section
import VideoDescription from "./VideoDescription";
import VideoMenu from "./VideoMenu";
import VideoOwner from "./VideoOwner";
import VideoReactions from "./VideoReactions";
import { Skeleton } from "@/components/ui/skeleton";

// Props definition for the VideoTopRow component
interface VideoTopRowProps {
  video: VideoGetOneOutput;
}

/**
 * Skeleton placeholder for the VideoTopRow.
 * Displays skeletons mimicking the layout of the top section
 * while the actual video data is loading.
 */
export const VideoTopRowSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Title skeleton */}
      <Skeleton className="h-7 w-3/4 sm:w-2/3" />
      {/* Top row: Owner and actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Owner/Channel skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40 sm:w-56" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        {/* Reactions and menu skeleton */}
        <div className="flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 sm:mb-0 gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      {/* Description and meta skeleton */}
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

/**
 * Main component for rendering the "top row" of a video page.
 * Displays the title, owner, actions (likes, menu), and description/meta.
 */
const VideoTopRow = ({ video }: VideoTopRowProps) => {
  // Format view counts as compact (e.g., 1.2K) and expanded (e.g., 1,234)
  const compactViews = Intl.NumberFormat("en", {
    notation: "compact",
  }).format(video.viewsCount);

  const expandedViews = Intl.NumberFormat("en", {
    notation: "standard",
  }).format(video.viewsCount);

  // Generate relative and absolute date strings
  const compactDate = formatDistanceToNow(video.createdAt, { addSuffix: true });
  const expandedDate = format(video.createdAt, "d MMM yyy");

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Video title */}
      <h1 className="text-xl font-semibold">{video.title}</h1>

      {/* Owner info and actions row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Video owner/channel info */}
        <VideoOwner user={video.user} id={video.id} />

        {/* Reaction (like/dislike) buttons and 3-dot menu */}
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

      {/* Video description and metadata (views, date, etc) */}
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
