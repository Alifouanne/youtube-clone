"use client";

import CommentForm from "@/modules/comments/ui/components/CommentForm";
import CommentItem from "@/modules/comments/ui/components/CommentItem";
import ErrorFallback from "@/modules/home/ui/fallbacks/ErrorFallback";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface commentsSectionProps {
  videoId: string;
}

export const CommentsSection = ({ videoId }: commentsSectionProps) => {
  return (
    <Suspense fallback={<>Loading...</>}>
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
const CommentsSectionSuspense = ({ videoId }: commentsSectionProps) => {
  const [comments] = trpc.comments.getMany.useSuspenseQuery({ videoId });
  return (
    <div className="mt-6 ">
      <div className="flex flex-col gap-6">
        <h1>0 Comments</h1>
        <CommentForm videoId={videoId} />
        <div className="flex flex-col gap-4 mt-2">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommentsSection;
