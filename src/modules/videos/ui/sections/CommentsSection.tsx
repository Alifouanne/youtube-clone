"use client";

import InfiniteScroll from "@/components/InfiniteScroll";
import { Badge } from "@/components/ui/badge";
import CommentForm from "@/modules/comments/ui/components/CommentForm";
import CommentItem from "@/modules/comments/ui/components/CommentItem";
import ErrorFallback from "@/modules/home/ui/fallbacks/ErrorFallback";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface commentsSectionProps {
  videoId: string;
}

export const CommentsSection = ({ videoId }: commentsSectionProps) => {
  return (
    <Suspense fallback={<CommentsSectionSkeleton />}>
      <ErrorBoundary
        fallback={
          <ErrorFallback
            title="Unable to load comments"
            description="There was a problem loading the comments. Please try again later."
          />
        }
      >
        <CommentsSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};
const CommentsSectionSkeleton = () => {
  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-9 w-32 rounded-full" />
        <div className="flex gap-3 sm:gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="flex flex-col gap-4 mt-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex gap-3 sm:gap-4 py-3 rounded-lg border border-border/30"
            >
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-3">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CommentsSectionSuspense = ({ videoId }: commentsSectionProps) => {
  const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
    { videoId, limit: 5 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  return (
    <div className="mt-6 ">
      <div className="flex flex-col gap-6">
        <Badge className="text-xl font-bold " variant="secondary">
          {comments.pages[0].totalCount} Comments
        </Badge>
        <CommentForm videoId={videoId} />
        <div className="flex flex-col gap-4 mt-2">
          {comments.pages
            .flatMap((page) => page.items)
            .map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          <InfiniteScroll
            hasNextPage={query.hasNextPage}
            isFetchingNextPage={query.isFetchingNextPage}
            fetchNextPage={query.fetchNextPage}
            isManual
          />
        </div>
      </div>
    </div>
  );
};

export default CommentsSection;
