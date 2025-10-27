"use client";

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

const VideoSectionSkeleton = () => {
  return (
    <div>
      <div className="border-y">
        <Table>
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
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="pl-6 w-[510px]">
                  <div className="flex items-center gap-4">
                    <div className="w-36 shrink-0">
                      <Skeleton className="w-full h-20 rounded-md" />
                    </div>
                    <div className="flex flex-col gap-y-1 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-12 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-12 ml-auto" />
                </TableCell>
                <TableCell className="text-right pr-6">
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

const VideoSectionSuspense = () => {
  const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    {
      limit: 5,
    },
    {
      getNextPageParam: (lastpage) => lastpage.nextCursor,
    }
  );
  const router = useRouter();
  return (
    <div>
      <div className="border-y">
        <Table>
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
          <TableBody>
            {videos.pages.flatMap((page) =>
              page.items.map((video) => (
                <TableRow
                  className="cursor-pointer"
                  onClick={() => router.push(`/studio/videos/${video.id}`)}
                  key={video.id}
                >
                  <TableCell className="pl-6 w-[510px]">
                    <div className="flex items-center gap-4">
                      <div className="  w-36 shrink-0">
                        <VideoThumbnail
                          thumbnailUrl={video.thumbnailUrl}
                          previewUrl={video.previewUrl}
                          title={video.title}
                          duration={video.duration || 0}
                        />
                      </div>
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
                  <TableCell>
                    <div className="flex items-center">
                      <Badge
                        variant={
                          video.visibility === "private"
                            ? "default"
                            : "secondary"
                        }
                      >
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
                  <TableCell className="text-sm truncate">
                    {format(new Date(video.createdAt), "dd MMM , yyyy")}
                  </TableCell>
                  <TableCell className="text-right">Views</TableCell>
                  <TableCell className="text-right">Comments</TableCell>
                  <TableCell className="text-right pr-6">Likes</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
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
