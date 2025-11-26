"use client";
// Import necessary UI components and icons
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/trpc/client";
import CommentItem from "./CommentItem";
import { Button } from "@/components/ui/button";
import { CornerDownRightIcon } from "lucide-react";

// Props type for the CommentReplies component
interface CommentRepliesProps {
  parentId: string; // The ID of the parent comment to fetch replies for
  video: string; // The video ID replies belong to
}

// Displays all replies to a comment, with "show more" pagination
const CommentReplies = ({ parentId, video }: CommentRepliesProps) => {
  // Use the trpc infinite query for paginated fetching of replies
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.comments.getMany.useInfiniteQuery(
      {
        limit: 5, // Limit the number of replies per page
        videoId: video, // The parent video ID
        parentId, // The specific parent comment ID
      },
      {
        // Function to get the cursor for the next page
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  return (
    // Left padding for indentation of replies
    <div className="pl-14">
      {/* Container for replies list */}
      <div className="flex flex-col gap-4 mt-2">
        {/* Display a spinner if loading */}
        {isLoading && (
          <div className="flex items-center justify-center">
            <Spinner />
          </div>
        )}
        {/* If not loading, render the list of replies using CommentItem */}
        {!isLoading &&
          data?.pages.flatMap((page) =>
            page.items.map((comment) => (
              <CommentItem key={comment.id} comment={comment} variant="reply" />
            ))
          )}
      </div>
      {/* Show "Show more" button if more replies are available */}
      {hasNextPage && (
        <Button
          variant="tertiary"
          size="sm"
          // Fetch more replies on click
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mt-2"
        >
          <CornerDownRightIcon />
          Show more
        </Button>
      )}
    </div>
  );
};

export default CommentReplies;
