import { format, formatDistanceToNow } from "date-fns";
import { VideoGetOneOutput } from "../../types";
import VideoDescription from "./VideoDescription";
import VideoMenu from "./VideoMenu";
import VideoOwner from "./VideoOwner";
import VideoReactions from "./VideoReactions";

interface VideoTopRowProps {
  video: VideoGetOneOutput;
}
const VideoTopRow = ({ video }: VideoTopRowProps) => {
  const compactViews = Intl.NumberFormat("en", {
    notation: "compact",
  }).format(1000);

  const expandedViews = Intl.NumberFormat("en", {
    notation: "standard",
  }).format(1000);
  const compactDate = formatDistanceToNow(video.createdAt, { addSuffix: true });
  const expandedDate = format(video.createdAt, "d MMM YYY");
  return (
    <div className="flex flex-col gap-4 mt-4">
      <h1 className="text-xl font-semibold">{video.title}</h1>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <VideoOwner user={video.user} id={video.id} />
        <div className="flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 sm:mb-0 gap-2">
          <VideoReactions />
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
