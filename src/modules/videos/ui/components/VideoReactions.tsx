"use client";

// ------------------------------
// Imports
// ------------------------------

// Import Button and ButtonGroup UI components
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
// Import Tooltip-related components
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// Utility for class name concatenation
import { cn } from "@/lib/utils";
// Icons for thumbs up/down
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
// Types for video info
import { VideoGetOneOutput } from "../../types";
// Clerk hook for authentication UI
import { useClerk } from "@clerk/nextjs";
// TRPC client for API mutations, cache
import { trpc } from "@/trpc/client";
// Toast notification system
import { toast } from "sonner";

// ------------------------------
// VideoReactionsProps Interface
// ------------------------------

/**
 * Props accepted by the VideoReactions component.
 */
interface VideoReactionsProps {
  videoId: VideoGetOneOutput["id"];
  initialLikes?: VideoGetOneOutput["likeCount"]; // Initial number of likes
  initialDislikes?: VideoGetOneOutput["dislikeCount"]; // Initial number of dislikes
  initialReaction?: VideoGetOneOutput["currentViewerReaction"]; // Initial reaction of the viewer
  onReactionChange?: (reaction: "like" | "dislike" | null) => void; // Callback for outside state mgmt
  disabled?: boolean; // If true, disables controls
  showTooltips?: boolean; // Whether to show tooltips on hover
}

// ------------------------------
// VideoReactions Component
// ------------------------------

/**
 * VideoReactions component
 *
 * Displays like/dislike buttons for a video, tracks the current user's reaction,
 * and provides UI/UX feedback with optional tooltips.
 */
const VideoReactions = ({
  initialLikes,
  initialDislikes,
  initialReaction,
  disabled = false,
  showTooltips = true,
  videoId,
}: VideoReactionsProps) => {
  // Clerk instance for authentication modal
  const clerk = useClerk();
  // TRPC utils for cache invalidation
  const utils = trpc.useUtils();

  // Like mutation
  const like = trpc.videos.like.useMutation({
    onMutate: async () => {
      // 1. Cancel any outgoing refetches for this video to avoid overwrites
      await utils.videos.getOne.cancel({ videoId });

      // 2. Snapshot the previous data
      const previousData = utils.videos.getOne.getData({ videoId });

      // 3. Optimistically update the cache
      if (previousData) {
        utils.videos.getOne.setData({ videoId }, (old) => {
          if (!old) return old;

          // Logic: Toggle like
          // If already liked -> remove like (decrement likeCount, set reaction null)
          // If disliked -> remove dislike (decrement dislikeCount), add like (increment likeCount, set reaction like)
          // If nothing -> add like (increment likeCount, set reaction like)

          const wasLiked = old.currentViewerReaction === "like";
          const wasDisliked = old.currentViewerReaction === "dislike";

          let newLikeCount = old.likeCount;
          let newDislikeCount = old.dislikeCount;
          let newReaction: "like" | "dislike" | null = "like";

          if (wasLiked) {
            newLikeCount -= 1;
            newReaction = null;
          } else if (wasDisliked) {
            newDislikeCount -= 1;
            newLikeCount += 1;
          } else {
            newLikeCount += 1;
          }

          return {
            ...old,
            likeCount: newLikeCount,
            dislikeCount: newDislikeCount,
            currentViewerReaction: newReaction,
          };
        });
      }

      // 4. Return context with the previous data for rollback
      return { previousData };
    },
    onError: (error, _, context) => {
      // If mutation fails, roll back to the snapshot
      if (context?.previousData) {
        utils.videos.getOne.setData({ videoId }, context.previousData);
      }
      toast.error("Something went wrong");
      // If unauthorized, prompt user to sign in
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is in sync
      utils.videos.getOne.invalidate({ videoId });
    },
  });

  // Dislike mutation with Optimistic Update
  const dislike = trpc.videos.dislike.useMutation({
    onMutate: async () => {
      // 1. Cancel outgoing refetches
      await utils.videos.getOne.cancel({ videoId });

      // 2. Snapshot previous data
      const previousData = utils.videos.getOne.getData({ videoId });

      // 3. Optimistically update cache
      if (previousData) {
        utils.videos.getOne.setData({ videoId }, (old) => {
          if (!old) return old;

          const wasLiked = old.currentViewerReaction === "like";
          const wasDisliked = old.currentViewerReaction === "dislike";

          let newLikeCount = old.likeCount;
          let newDislikeCount = old.dislikeCount;
          let newReaction: "like" | "dislike" | null = "dislike";

          if (wasDisliked) {
            newDislikeCount -= 1;
            newReaction = null;
          } else if (wasLiked) {
            newLikeCount -= 1;
            newDislikeCount += 1;
          } else {
            newDislikeCount += 1;
          }

          return {
            ...old,
            likeCount: newLikeCount,
            dislikeCount: newDislikeCount,
            currentViewerReaction: newReaction,
          };
        });
      }

      // 4. Return snapshot
      return { previousData };
    },
    onError: (error, _, context) => {
      // Rollback on error
      if (context?.previousData) {
        utils.videos.getOne.setData({ videoId }, context.previousData);
      }
      toast.error("Something went wrong");
      // If unauthorized, prompt user to sign in
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
    onSettled: () => {
      // Sync with server
      utils.videos.getOne.invalidate({ videoId });
    },
  });

  // ------------------------------
  // Helper: Format a count into short number (e.g., 1.2K, 3.4M)
  // ------------------------------
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // ------------------------------
  // Like Button JSX
  // ------------------------------
  // Renders the like button, styled according to user's current reaction
  const LikeButton = (
    <Button
      variant={initialReaction === "like" ? "default" : "outline"}
      onClick={() => like.mutate({ videoId })}
      disabled={like.isPending || dislike.isPending || disabled}
      className={cn(
        "gap-2 transition-all duration-200",
        initialReaction === "like" &&
          "bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700"
      )}
    >
      {/* Thumbs up icon, filled and scaled if selected */}
      <ThumbsUpIcon
        className={cn(
          "size-5 transition-all duration-200",
          initialReaction === "like" && "fill-current scale-110"
        )}
      />
      {/* Like count */}
      <span className="font-medium tabular-nums">
        {formatCount(initialLikes ?? 0)}
      </span>
    </Button>
  );

  // ------------------------------
  // Dislike Button JSX
  // ------------------------------
  // Renders the dislike button, styled according to user's current reaction
  const DislikeButton = (
    <Button
      variant={initialReaction === "dislike" ? "default" : "outline"}
      onClick={() => dislike.mutate({ videoId })}
      disabled={disabled || like.isPending || dislike.isPending}
      className={cn(
        "gap-2 transition-all duration-200",
        initialReaction === "dislike" &&
          "bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700"
      )}
    >
      {/* Thumbs down icon, filled and scaled if selected */}
      <ThumbsDownIcon
        className={cn(
          "size-5 transition-all duration-200",
          initialReaction === "dislike" && "fill-current scale-110"
        )}
      />
      {/* Dislike count */}
      <span className="font-medium tabular-nums">
        {formatCount(initialDislikes ?? 0)}
      </span>
    </Button>
  );

  // ------------------------------
  // Render logic
  // ------------------------------

  // If tooltips are disabled, show just the button group
  if (!showTooltips) {
    return (
      <ButtonGroup aria-label="reaction control">
        {LikeButton}
        {DislikeButton}
      </ButtonGroup>
    );
  }

  // Otherwise, wrap buttons in tooltips ("Like", "Remove like", etc)
  return (
    <TooltipProvider>
      <ButtonGroup aria-label="reaction control">
        {/* Like button with tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>{LikeButton}</TooltipTrigger>
          <TooltipContent>
            <p>{initialReaction === "like" ? "Remove like" : "Like"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Dislike button with tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>{DislikeButton}</TooltipTrigger>
          <TooltipContent>
            <p>
              {initialReaction === "dislike" ? "Remove dislike" : "Dislike"}
            </p>
          </TooltipContent>
        </Tooltip>
      </ButtonGroup>
    </TooltipProvider>
  );
};

// Export VideoReactions component as default
export default VideoReactions;
