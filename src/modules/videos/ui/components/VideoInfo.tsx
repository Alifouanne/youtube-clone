import StudioSidebarAvatar from "@/modules/studio/ui/components/studio-sidebar/StudioSidebarAvatar";
import type { SuggestionsGetManyOutput } from "@/modules/suggestions/types";
import UserInfo from "@/modules/users/ui/components/UserInfo";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import VideoMenu from "./VideoMenu";

interface VideoInfoProps {
  data: SuggestionsGetManyOutput["items"][number];
  onRemove?: () => void;
}
const VideoInfo = ({ data, onRemove }: VideoInfoProps) => {
  const compactViews = Intl.NumberFormat("en", {
    notation: "compact",
  }).format(data.viewsCount);
  const compactDate = formatDistanceToNow(data.createdAt, { addSuffix: true });
  return (
    <div className="flex gap-3 group/info">
      <Link href={`/users/${data.user.id}`} className="flex-shrink-0">
        <div className="transition-transform duration-200 hover:scale-105">
          <StudioSidebarAvatar
            imageUrl={data.user.imageUrl}
            name={data.user.name}
          />
        </div>
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/videos/${data.id}`}>
          <h3 className="font-semibold line-clamp-1 lg:line-clamp-2 text-base break-words transition-colors duration-200 hover:text-primary">
            {data.title}
          </h3>
        </Link>
        <Link href={`/users/${data.user.id}`} className="block mt-1">
          <div className="transition-colors duration-200 hover:text-foreground">
            <UserInfo name={data.user.name} showTooltip verified />
          </div>
        </Link>
        <Link href={`/videos/${data.id}`}>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1 transition-colors duration-200 hover:text-foreground">
            <span className="font-medium">{compactViews}</span> views{" "}
            <span className="mx-1">•</span> {compactDate}
          </p>
        </Link>
      </div>
      <div className="flex-shrink-0 opacity-0 group-hover/info:opacity-100 transition-opacity duration-200">
        <VideoMenu
          videoId={data.id}
          onRemove={onRemove}
          showDownload={false}
          showReport={false}
          showWatchLater={false}
        />
      </div>
    </div>
  );
};

export default VideoInfo;
