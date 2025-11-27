import type { SuggestionsGetManyOutput } from "@/modules/suggestions/types";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import VideoThumbnail from "./VideoThumbnail";
import { cn } from "@/lib/utils";
import StudioSidebarAvatar from "@/modules/studio/ui/components/studio-sidebar/StudioSidebarAvatar";
import UserInfo from "@/modules/users/ui/components/UserInfo";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import VideoMenu from "./VideoMenu";

const VideoRowCardVariants = cva(
  "group flex min-w-0 rounded-lg transition-all duration-300 hover:bg-accent/50 p-2 -m-2",
  {
    variants: {
      size: {
        default: "gap-4",
        compact: "gap-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const thumbnailVariants = cva(
  "relative flex-none rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]",
  {
    variants: {
      size: {
        default: "w-[38%] aspect-video",
        compact: "w-[168px] aspect-video",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface VideoRowCardProps extends VariantProps<typeof VideoRowCardVariants> {
  data: SuggestionsGetManyOutput["items"][number];
  onRemove?: () => void;
}

export const VideoRowCardSkeleton = () => {
  return <div>Skeleton</div>;
};

const VideoRowCard = ({ data, onRemove, size }: VideoRowCardProps) => {
  const compactViews = Intl.NumberFormat("en", {
    notation: "compact",
  }).format(data.viewsCount);
  const compactLikes = Intl.NumberFormat("en", {
    notation: "compact",
  }).format(data.likeCount);
  return (
    <TooltipProvider>
      <div className={VideoRowCardVariants({ size })}>
        <Link
          href={`/videos/${data.id}`}
          className={thumbnailVariants({ size })}
        >
          <VideoThumbnail
            thumbnailUrl={data.thumbnailUrl}
            previewUrl={data.previewUrl}
            title={data.title}
            duration={data.duration}
          />
        </Link>
        <div className="flex-1 min-w-0 py-1">
          <div className="flex justify-between gap-x-3">
            <Link
              href={`/videos/${data.id}`}
              className="flex-1 min-w-0 space-y-2"
            >
              <h3
                className={cn(
                  "font-semibold line-clamp-2 leading-snug transition-colors duration-200 group-hover:text-primary",
                  size === "compact" ? "text-sm" : "text-base"
                )}
              >
                {data.title}
              </h3>
              {size === "default" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">{compactViews} Views</span>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="font-medium">{compactLikes} Likes</span>
                </div>
              )}
              {size === "default" && (
                <>
                  <div className="flex items-center gap-2.5 py-1">
                    <StudioSidebarAvatar
                      size="sm"
                      imageUrl={data.user.imageUrl}
                      name={data.user.name}
                    />
                    <UserInfo
                      size="sm"
                      name={data.user.name}
                      showTooltip
                      verified
                    />
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xs text-muted-foreground/90 w-fit line-clamp-2 leading-relaxed hover:text-muted-foreground transition-colors duration-200">
                        {data.description ?? "No description"}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="start"
                      className="bg-popover border-border text-popover-foreground shadow-lg"
                    >
                      <p className="text-xs">From the video description</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
              {size === "compact" && (
                <div className="space-y-1.5">
                  <UserInfo size="sm" name={data.user.name} />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{compactViews} Views</span>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="font-medium">{compactLikes} Likes</span>
                  </div>
                </div>
              )}
            </Link>
            <div className="flex-none -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <VideoMenu
                videoId={data.id}
                onRemove={onRemove}
                showDownload={false}
                showReport={false}
                showWatchLater={false}
              />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default VideoRowCard;
