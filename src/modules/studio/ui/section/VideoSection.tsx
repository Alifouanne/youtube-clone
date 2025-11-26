"use client";

// Imports for UI components, utility functions, hooks, and icons
import InfiniteScroll from "@/components/InfiniteScroll";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, snakeCaseToTitle } from "@/lib/utils";
import ErrorFallback from "@/modules/home/ui/fallbacks/ErrorFallback";
import VideoThumbnail from "@/modules/videos/ui/components/VideoThumbnail";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { format } from "date-fns";
import { Globe2Icon, LockIcon } from "lucide-react";

/**
 * Skeleton loader component for the VideoSection.
 * Renders placeholder rows to indicate loading state while videos are being fetched.
 */
const VideoSectionSkeleton = () => {
  return (
    <div>
      <div className="border-y">
        <Table>
          {/* Table header with column names */}
          <TableHeader>
            <TableRow className="hover:bg-background select-none">
              <TableHead className="pl-6 w-[510px]">Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="text-right pr-6">Likes</TableHead>
            </TableRow>
          </TableHeader>

          {/* Render 5 placeholder rows for loading state */}
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="pl-6 w-[510px]">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail skeleton */}
                    <div className="w-36 shrink-0">
                      <Skeleton className="w-full h-20 rounded-md" />
                    </div>
                    {/* Title and description skeleton */}
                    <div className="flex flex-col gap-y-1 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {/* Visibility badge skeleton */}
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  {/* Status badge skeleton */}
                  <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  {/* Date skeleton */}
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  {/* Views skeleton */}
                  <Skeleton className="h-4 w-12 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  {/* Comments skeleton */}
                  <Skeleton className="h-4 w-12 ml-auto" />
                </TableCell>
                <TableCell className="text-right pr-6">
                  {/* Likes skeleton */}
                  <Skeleton className="h-4 w-12 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

/**
 * VideoSection component (default export)
 * Handles error boundaries and suspense for the video list.
 * Shows a skeleton loader while fetching, and fallback error UI if failed.
 */
const VideoSection = () => {
  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary
        fallback={
          <ErrorFallback
            title="Unable to load videos"
            description="There was a problem loading your videos. Please refresh the page or try again later."
          />
        }
      >
        <VideoSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

/**
 * Main table view for the video section.
 * Fetches paginated video data, displays each video in a row.
 * Handles infinite scroll and navigation to video details on row click.
 */
const VideoSectionSuspense = () => {
  // Fetch paginated video data using TRPC (with suspense)
  const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    {
      limit: 5, // Fetch 5 videos per page
    },
    {
      getNextPageParam: (lastpage) => lastpage.nextCursor, // for infinite scrolling
    }
  );
  const router = useRouter();

  return (
    <div>
      <div className="border-y">
        <Table>
          {/* Video table header */}
          <TableHeader>
            <TableRow className="hover:bg-background select-none">
              <TableHead className="pl-6 w-[510px]">Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="text-right pr-6">Likes</TableHead>
            </TableRow>
          </TableHeader>

          {/* Render rows for each video fetched */}
          <TableBody>
            {videos.pages.flatMap((page) =>
              page.items.map((video) => (
                <TableRow
                  className="cursor-pointer"
                  onClick={() => router.push(`/studio/videos/${video.id}`)} // Navigate to video detail on click
                  key={video.id}
                >
                  {/* Video thumbnail, title, and description cell */}
                  <TableCell className="pl-6 w-[510px]">
                    <div className="flex items-center gap-4">
                      {/* Thumbnail image */}
                      <div className="  w-36 shrink-0">
                        <VideoThumbnail
                          thumbnailUrl={video.thumbnailUrl}
                          previewUrl={video.previewUrl}
                          title={video.title}
                          duration={video.duration || 0}
                        />
                      </div>
                      {/* Title and description */}
                      <div className="flex flex-col overflow-hidden gap-y-1">
                        <span className="text-sm line-clamp-1">
                          {video.title}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {video.description || "No Description"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  {/* Video visibility badge cell */}
                  <TableCell>
                    <div className="flex items-center">
                      <Badge
                        variant={
                          video.visibility === "private"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {/* Show lock or globe icon based on visibility */}
                        {video.visibility === "private" ? (
                          <>
                            <LockIcon className="size-4 mr-2" />
                          </>
                        ) : (
                          <>
                            <Globe2Icon className="size-4 mr-2" />
                          </>
                        )}
                        {snakeCaseToTitle(video.visibility)}
                      </Badge>
                    </div>
                  </TableCell>
                  {/* Video encoding status badge cell */}
                  <TableCell>
                    <div className="flex items-center">
                      <Badge
                        variant={
                          video.muxStatus === "ready"
                            ? "default"
                            : video.muxStatus === "errored"
                            ? "destructive"
                            : "secondary"
                        }
                        className={cn(
                          video.muxStatus === "waiting"
                            ? "bg-yellow-600/10 text-yellow-600 "
                            : video.muxStatus === "ready"
                            ? "bg-green-600/10 text-green-600 "
                            : video.muxStatus === "error"
                            ? "bg-red-600/10 text-red-600 "
                            : video.muxStatus === null
                            ? "bg-gray-600/10 text-gray-600 "
                            : "bg-gray-600/10 text-gray-600 "
                        )}
                      >
                        {snakeCaseToTitle(video.muxStatus || "error")}
                      </Badge>
                    </div>
                  </TableCell>
                  {/* Video upload/created date cell */}
                  <TableCell className="text-sm truncate">
                    {format(new Date(video.createdAt), "dd MMM , yyyy")}
                  </TableCell>
                  {/* Placeholders for future stats (views, comments, likes) */}
                  <TableCell className="text-right">Views</TableCell>
                  <TableCell className="text-right">Comments</TableCell>
                  <TableCell className="text-right pr-6">Likes</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Infinite scroll - loads more videos as user scrolls */}
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
        isManual
      />
    </div>
  );
};

export default VideoSection;
