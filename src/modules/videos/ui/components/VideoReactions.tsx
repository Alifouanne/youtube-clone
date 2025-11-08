"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { useState } from "react";

interface VideoReactionsProps {
  initialLikes?: number;
  initialDislikes?: number;
  initialReaction?: "like" | "dislike" | null;
  onReactionChange?: (reaction: "like" | "dislike" | null) => void;
  disabled?: boolean;
  showTooltips?: boolean;
}

const VideoReactions = ({
  initialLikes = 0,
  initialDislikes = 0,
  initialReaction = null,
  onReactionChange,
  disabled = false,
  showTooltips = true,
}: VideoReactionsProps) => {
  const [viewerReaction, setViewerReaction] = useState<
    "like" | "dislike" | null
  >(initialReaction);
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleLike = () => {
    if (disabled) return;

    let newReaction: "like" | "dislike" | null;
    let newLikes = likes;
    let newDislikes = dislikes;

    if (viewerReaction === "like") {
      // Remove like
      newReaction = null;
      newLikes = likes - 1;
    } else if (viewerReaction === "dislike") {
      // Switch from dislike to like
      newReaction = "like";
      newLikes = likes + 1;
      newDislikes = dislikes - 1;
    } else {
      // Add like
      newReaction = "like";
      newLikes = likes + 1;
    }

    setViewerReaction(newReaction);
    setLikes(newLikes);
    setDislikes(newDislikes);
    onReactionChange?.(newReaction);
  };

  const handleDislike = () => {
    if (disabled) return;

    let newReaction: "like" | "dislike" | null;
    let newLikes = likes;
    let newDislikes = dislikes;

    if (viewerReaction === "dislike") {
      // Remove dislike
      newReaction = null;
      newDislikes = dislikes - 1;
    } else if (viewerReaction === "like") {
      // Switch from like to dislike
      newReaction = "dislike";
      newDislikes = dislikes + 1;
      newLikes = likes - 1;
    } else {
      // Add dislike
      newReaction = "dislike";
      newDislikes = dislikes + 1;
    }

    setViewerReaction(newReaction);
    setLikes(newLikes);
    setDislikes(newDislikes);
    onReactionChange?.(newReaction);
  };

  const LikeButton = (
    <Button
      variant={viewerReaction === "like" ? "default" : "outline"}
      onClick={handleLike}
      disabled={disabled}
      className={cn(
        "gap-2 transition-all duration-200",
        viewerReaction === "like" &&
          "bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700"
      )}
    >
      <ThumbsUpIcon
        className={cn(
          "size-5 transition-all duration-200",
          viewerReaction === "like" && "fill-current scale-110"
        )}
      />
      <span className="font-medium tabular-nums">{formatCount(likes)}</span>
    </Button>
  );

  const DislikeButton = (
    <Button
      variant={viewerReaction === "dislike" ? "default" : "outline"}
      onClick={handleDislike}
      disabled={disabled}
      className={cn(
        "gap-2 transition-all duration-200",
        viewerReaction === "dislike" &&
          "bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700"
      )}
    >
      <ThumbsDownIcon
        className={cn(
          "size-5 transition-all duration-200",
          viewerReaction === "dislike" && "fill-current scale-110"
        )}
      />
      <span className="font-medium tabular-nums">{formatCount(dislikes)}</span>
    </Button>
  );

  if (!showTooltips) {
    return (
      <ButtonGroup aria-label="reaction control">
        {LikeButton}
        {DislikeButton}
      </ButtonGroup>
    );
  }

  return (
    <TooltipProvider>
      <ButtonGroup aria-label="reaction control">
        <Tooltip>
          <TooltipTrigger asChild>{LikeButton}</TooltipTrigger>
          <TooltipContent>
            <p>{viewerReaction === "like" ? "Remove like" : "Like"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>{DislikeButton}</TooltipTrigger>
          <TooltipContent>
            <p>{viewerReaction === "dislike" ? "Remove dislike" : "Dislike"}</p>
          </TooltipContent>
        </Tooltip>
      </ButtonGroup>
    </TooltipProvider>
  );
};

export default VideoReactions;
