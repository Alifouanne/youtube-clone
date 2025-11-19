import Link from "next/link";
import { CommentGetManyOutput } from "../../types";
import StudioSidebarAvatar from "@/modules/studio/ui/components/studio-sidebar/StudioSidebarAvatar";
import { formatDistanceToNow } from "date-fns";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CommentItemProps {
  comment: CommentGetManyOutput[number];
}

const CommentItem = ({ comment }: CommentItemProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showReply, setShowReply] = useState(false);

  return (
    <div className="group relative py-3 transition-colors hover:bg-accent/30 rounded-lg px-2 -mx-2">
      <div className="flex gap-3">
        <Link href={`/users/${comment.userId}`} className="shrink-0">
          <div className="transition-transform hover:scale-105">
            <StudioSidebarAvatar
              size="lg"
              imageUrl={comment.user.imageUrl}
              name={comment.user.name}
            />
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <Link
              href={`/users/${comment.userId}`}
              className="hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm leading-none">
                  {comment.user.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                </span>
              </div>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm leading-relaxed mb-2 text-foreground/90">
            {comment.content}
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 gap-1.5 text-xs font-medium transition-colors ${
                isLiked
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                setIsLiked(!isLiked);
                if (!isLiked) setIsDisliked(false);
              }}
            >
              <ThumbsUp
                className={`h-3.5 w-3.5 transition-transform ${
                  isLiked ? "fill-current scale-110" : ""
                }`}
              />
              <span>{isLiked ? "Liked" : "Like"}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 gap-1.5 text-xs font-medium transition-colors ${
                isDisliked
                  ? "text-red-600 dark:text-red-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                setIsDisliked(!isDisliked);
                if (!isDisliked) setIsLiked(false);
              }}
            >
              <ThumbsDown
                className={`h-3.5 w-3.5 transition-transform ${
                  isDisliked ? "fill-current scale-110" : ""
                }`}
              />
              <span>{isDisliked ? "Disliked" : "Dislike"}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setShowReply(!showReply)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Reply</span>
            </Button>
          </div>

          {showReply && (
            <div className="mt-3 pl-2 border-l-2 border-border animate-in slide-in-from-top-2 duration-200">
              <p className="text-xs text-muted-foreground italic">
                Reply feature coming soon...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
