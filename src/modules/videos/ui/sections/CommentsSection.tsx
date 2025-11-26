"use client";

// Imports for UI building blocks and utilities
import InfiniteScroll from "@/components/InfiniteScroll";
import { Badge } from "@/components/ui/badge";
import CommentForm from "@/modules/comments/ui/components/CommentForm";
import CommentItem from "@/modules/comments/ui/components/CommentItem";
import ErrorFallback from "@/modules/home/ui/fallbacks/ErrorFallback";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

// Props interface for the CommentsSection
interface commentsSectionProps {
  videoId: string; // The ID of the video for which comments are shown
}

/**
 * CommentsSection:
 * - Root component for displaying comments on a video.
 * - Wraps the comments UI in Suspense and ErrorBoundary for loading and error handling.
 */
export const CommentsSection = ({ videoId }: commentsSectionProps) => {
  return (
    // Suspense for showing a skeleton loader while loading comments data
    <Suspense fallback={<CommentsSectionSkeleton />}>
      {/* ErrorBoundary catches errors in the comments tree and shows a fallback */}
      <ErrorBoundary
        fallback={
          <ErrorFallback
            title="Unable to load comments"
            description="There was a problem loading the comments. Please try again later."
          />
        }
      >
        {/* The actual comments content, separated for suspenseability */}
        <CommentsSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

/**
 * CommentsSectionSkeleton:
 * - Shown as a placeholder while comments are being loaded.
 * - Displays animated skeleton lines and shapes resembling the comment UI.
 */
const CommentsSectionSkeleton = () => {
  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6">
        {/* Skeleton for comments count badge */}
        <Skeleton className="h-9 w-32 rounded-full" />
        {/* Skeleton for the comment form */}
        <div className="flex gap-3 sm:gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        {/* Skeletons to represent a few top-level comments */}
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

/**
 * CommentsSectionSuspense:
 * - Contains the actual comments UI (not the loading/error wrappers).
 * - Fetches and renders comments using TRPC with infinite scroll/pagination.
 * - Renders a comment form for submitting new comments.
 * - Renders a list of CommentItem components for each comment.
 * - Adds InfiniteScroll for loading additional pages of comments.
 */
const CommentsSectionSuspense = ({ videoId }: commentsSectionProps) => {
  // Fetch comments for the video with TRPC's infinite query in suspense mode
  const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
    { videoId, limit: 5 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  return (
    <div className="mt-6 ">
      <div className="flex flex-col gap-6">
        {/* Display total comments count as a badge */}
        <Badge className="text-xl font-bold " variant="secondary">
          {comments.pages[0].totalCount} Comments
        </Badge>

        {/* Comment form for posting a new top-level comment */}
        <CommentForm videoId={videoId} />

        {/* List of comments */}
        <div className="flex flex-col gap-4 mt-2">
          {/* Render each comment using CommentItem */}
          {comments.pages
            .flatMap((page) => page.items)
            .map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          {/* Infinite Scroll for pagination */}
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
