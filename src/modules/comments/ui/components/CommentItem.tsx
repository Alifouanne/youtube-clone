"use client";
// React and Next.js imports
import Link from "next/link";
import type { CommentGetManyOutput } from "../../types";
import { formatDistanceToNow } from "date-fns";
// Icon imports
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  MoreVertical,
  Trash2Icon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { trpc } from "@/trpc/client";
// Dropdown Menu UI components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
// Local components
import CommentForm from "./CommentForm";
import CommentReplies from "./CommentReplies";
import StudioSidebarAvatar from "@/modules/studio/ui/components/studio-sidebar/StudioSidebarAvatar";

// Props for the CommentItem component
interface CommentItemProps {
  comment: CommentGetManyOutput["items"][number];
  variant?: "reply" | "comment";
}

/**
 * CommentItem
 * Responsible for rendering a single comment or reply.
 * Handles logic for liking, disliking, replying, deleting, and displaying replies.
 */
const CommentItem = ({ comment, variant = "comment" }: CommentItemProps) => {
  // Clerk and trpc utils
  const clerk = useClerk();
  const utils = trpc.useUtils();

  // UI state
  const [isReplyOpen, setIsReplyOpen] = useState(false); // Whether the reply form is open
  const [isRepliesOpen, setIsRepliesOpen] = useState(false); // Whether replies are shown

  // Current authenticated user
  const { userId } = useAuth();

  // --- Delete comment mutation ---
  const remove = trpc.comments.remove.useMutation({
    // Show loading toast on mutation start
    onMutate: () => {
      const toastId = toast.loading("Deleting the comment...");
      return { toastId };
    },
    // On successful delete, dismiss toast, show success message, and refetch comment data
    onSuccess: (_, __, context) => {
      if (context?.toastId) toast.dismiss(context.toastId);
      toast.success("Comment deleted successfully");
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    // On error, dismiss toast and display error message. If unauthorized, prompt login.
    onError: (error, _, context) => {
      if (context?.toastId) toast.dismiss(context.toastId);
      toast.error("Something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  // --- Like comment mutation (with optimistic update) ---
  const like = trpc.comments.like.useMutation({
    onMutate: async () => {
      // Optimistically update like state in cache
      await utils.comments.getMany.cancel({ videoId: comment.videoId });
      const previousData = utils.comments.getMany.getInfiniteData({
        videoId: comment.videoId,
        limit: 5,
      });

      utils.comments.getMany.setInfiniteData(
        { videoId: comment.videoId, limit: 5 },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((item) => {
                if (item.id === comment.id) {
                  // Toggle/remove like if already liked
                  if (item.viewerReaction === "like") {
                    return {
                      ...item,
                      viewerReaction: null,
                      likeCount: item.likeCount - 1,
                    };
                  }
                  // Switch from dislike to like
                  if (item.viewerReaction === "dislike") {
                    return {
                      ...item,
                      viewerReaction: "like",
                      likeCount: item.likeCount + 1,
                      dislikeCount: item.dislikeCount - 1,
                    };
                  }
                  // Like from neutral
                  return {
                    ...item,
                    viewerReaction: "like",
                    likeCount: item.likeCount + 1,
                  };
                }
                return item;
              }),
            })),
          };
        }
      );

      return { previousData };
    },
    // If error, roll back to previous optimistic state
    onError: (error, _, context) => {
      if (context?.previousData) {
        utils.comments.getMany.setInfiniteData(
          { videoId: comment.videoId, limit: 5 },
          context.previousData
        );
      }
      // Prompt login if unauthorized
      if (error.data?.code === "UNAUTHORIZED") clerk.openSignIn();
    },
    // Always refetch data to sync
    onSettled: () => {
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
  });

  // --- Dislike comment mutation (with optimistic update) ---
  const dislike = trpc.comments.dislike.useMutation({
    onMutate: async () => {
      // Optimistically update dislike state in cache
      await utils.comments.getMany.cancel({ videoId: comment.videoId });
      const previousData = utils.comments.getMany.getInfiniteData({
        videoId: comment.videoId,
        limit: 5,
      });

      utils.comments.getMany.setInfiniteData(
        { videoId: comment.videoId, limit: 5 },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((item) => {
                if (item.id === comment.id) {
                  // Toggle/remove dislike if already disliked
                  if (item.viewerReaction === "dislike") {
                    return {
                      ...item,
                      viewerReaction: null,
                      dislikeCount: item.dislikeCount - 1,
                    };
                  }
                  // Switch from like to dislike
                  if (item.viewerReaction === "like") {
                    return {
                      ...item,
                      viewerReaction: "dislike",
                      dislikeCount: item.dislikeCount + 1,
                      likeCount: item.likeCount - 1,
                    };
                  }
                  // Dislike from neutral
                  return {
                    ...item,
                    viewerReaction: "dislike",
                    dislikeCount: item.dislikeCount + 1,
                  };
                }
                return item;
              }),
            })),
          };
        }
      );

      return { previousData };
    },
    // If error, roll back to previous optimistic state
    onError: (error, _, context) => {
      if (context?.previousData) {
        utils.comments.getMany.setInfiniteData(
          { videoId: comment.videoId, limit: 5 },
          context.previousData
        );
      }
      // Prompt login if unauthorized
      if (error.data?.code === "UNAUTHORIZED") clerk.openSignIn();
    },
    // Always refetch data to sync
    onSettled: () => {
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
  });

  // Render the comment item
  return (
    <div className="group relative py-4 transition-all duration-200 hover:bg-accent/50 rounded-xl px-3 -mx-3">
      {/* Layout: Avatar + Comment Content */}
      <div className="flex gap-4">
        {/* User avatar, links to user profile */}
        <Link href={`/users/${comment.userId}`} className="shrink-0">
          <StudioSidebarAvatar
            imageUrl={comment.user.imageUrl}
            name={comment.user.name}
            size={variant === "comment" ? "lg" : "sm"}
          />
        </Link>

        {/* Comment main content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header: Username, timestamp, menu (if comment) */}
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/users/${comment.userId}`}
              className="hover:opacity-80 transition-opacity"
            >
              <div className="flex items-baseline gap-2 flex-wrap">
                {/* Username */}
                <span className="font-semibold text-sm">
                  {comment.user.name}
                </span>
                {/* Time since comment posted */}
                <span className="text-xs text-muted-foreground/80">
                  {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                </span>
              </div>
            </Link>
            {/* Options dropdown only for main comments, not replies */}
            {variant === "comment" && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent shrink-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {/* Reply option */}
                  <DropdownMenuItem onClick={() => setIsReplyOpen(true)}>
                    <MessageSquare className="size-4" />
                    Reply
                  </DropdownMenuItem>

                  {/* Delete option (only shown for own comments) */}
                  {comment.user.clerkId === userId && (
                    <DropdownMenuItem
                      onClick={() => remove.mutate({ id: comment.id })}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2Icon className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Comment text */}
          <p className="text-sm leading-relaxed text-foreground">
            {comment.content}
          </p>

          {/* Like/Dislike/Reply actions */}
          <div className="flex items-center gap-1 pt-1">
            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              disabled={like.isPending || dislike.isPending}
              className={cn(
                "h-9 px-3 gap-2 text-xs font-medium rounded-full transition-all duration-200",
                "hover:bg-accent hover:scale-105",
                comment.viewerReaction === "like"
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-950/70"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => {
                like.mutate({ commentId: comment.id });
              }}
            >
              <ThumbsUp
                className={cn(
                  "h-4 w-4 transition-all duration-200",
                  comment.viewerReaction === "like" && "fill-current"
                )}
              />
              <span className="font-medium">
                {/* Show count if >0, otherwise label */}
                {comment.likeCount > 0 ? comment.likeCount : "Like"}
              </span>
            </Button>

            {/* Dislike Button */}
            <Button
              variant="ghost"
              size="sm"
              disabled={like.isPending || dislike.isPending}
              className={cn(
                "h-9 px-3 gap-2 text-xs font-medium rounded-full transition-all duration-200",
                "hover:bg-accent hover:scale-105",
                comment.viewerReaction === "dislike"
                  ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-950/70"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => dislike.mutate({ commentId: comment.id })}
            >
              <ThumbsDown
                className={cn(
                  "h-4 w-4 transition-all duration-200",
                  comment.viewerReaction === "dislike" && "fill-current"
                )}
              />
              <span className="font-medium">
                {/* Show count if >0, otherwise label */}
                {comment.dislikeCount > 0 ? comment.dislikeCount : "Dislike"}
              </span>
            </Button>

            {/* Reply Button (only for top-level comments) */}
            {variant === "comment" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 gap-2 text-xs font-medium rounded-full text-muted-foreground hover:text-foreground hover:bg-accent hover:scale-105 transition-all duration-200"
                onClick={() => setIsReplyOpen(true)}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">Reply</span>
              </Button>
            )}
          </div>

          {/* Reply Form (opened when replying to a comment) */}
          {isReplyOpen && variant === "comment" && (
            <div className="mt-4 pt-3 pl-4 border-l-2 border-primary/30 animate-in slide-in-from-top-2 duration-300">
              <CommentForm
                videoId={comment.videoId}
                onSuccess={() => {
                  setIsReplyOpen(false);
                  setIsRepliesOpen(true); // Show replies when a reply is posted
                }}
                variant="reply"
                parentId={comment.id}
                onCancel={() => setIsReplyOpen(false)}
              />
            </div>
          )}

          {/* Show replies toggle button (if there are replies, for comments only) */}
          {comment.replyCount > 0 && variant === "comment" && (
            <div className="pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRepliesOpen((current) => !current)}
                className="h-8 px-3 gap-2 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-200"
              >
                {/* Show up/down chevron depending on expanded state */}
                {isRepliesOpen ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
                <span>
                  {comment.replyCount}{" "}
                  {comment.replyCount === 1 ? "reply" : "replies"}
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Reply list: Only show if replies exist, are expanded, and this is a comment (not a reply) */}
      {comment.replyCount > 0 && variant === "comment" && isRepliesOpen && (
        <CommentReplies parentId={comment.id} video={comment.videoId} />
      )}
    </div>
  );
};

export default CommentItem;
