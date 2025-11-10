"use client";
// VideoOwner component displays the uploader/channel info (avatar, name, subscribers, subscribe button or edit button)
import Link from "next/link";
import { VideoGetOneOutput } from "../../types";
import StudioSidebarAvatar from "@/modules/studio/ui/components/studio-sidebar/StudioSidebarAvatar";
import { useAuth } from "@clerk/nextjs";
import SubscribeButton from "@/components/SubscribeButton";
import { SquarePenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserInfo from "@/modules/users/ui/components/UserInfo";
import { useSubscriptions } from "@/modules/subscription/hooks/useSubscriptions";

// Props for the VideoOwner: user (uploader info) and id (videoId)
interface VideoOwnerProps {
  user: VideoGetOneOutput["user"];
  id: string;
}

const VideoOwner = ({ id: videoId, user }: VideoOwnerProps) => {
  // Get currently authenticated Clerk user id (if any)
  const { userId, isLoaded } = useAuth();

  // Hook to handle subscribing/unsubscribing to this user's channel
  const { isPending, onClick } = useSubscriptions({
    userId: user.id, // channel/user to subscribe/unsubscribe
    fromVideoId: videoId, // optional: for cache invalidation on toggle
  });

  // Format the subscriber count in a compact notation (e.g., '10K')
  const compactSubscribers = Intl.NumberFormat("en", {
    notation: "compact",
  }).format(user.subscriptionCount);

  return (
    <div className="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0">
      {/* Uploader profile link and avatar, name, subscriber count */}
      <Link href={`/users/${user.id}`}>
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar for the channel/user */}
          <StudioSidebarAvatar
            imageUrl={user.imageUrl}
            name={user.name}
            size="lg"
          />
          {/* Name and subscriber count */}
          <div className="flex flex-col gap-1 min-w-0">
            {/* Channel/User full name (with Verified badge + tooltip if applicable) */}
            <UserInfo name={user.name} size="lg" verified showTooltip />
            {/* Subscriber count */}
            <span className="text-sm text-muted-foreground line-clamp-1">
              {compactSubscribers} Subscribers
            </span>
          </div>
        </div>
      </Link>
      {/* Show "Edit Video" if viewing own video; else show Subscribe button */}
      {userId === user.clerkId ? (
        // Show Edit Video button for the owner/uploader
        <Button variant="secondary" className="rounded-full" asChild>
          <Link href={`/studio/videos/${videoId}`}>
            Edit Video <SquarePenIcon />
          </Link>
        </Button>
      ) : (
        // Subscribe/unsubscribe button for viewers
        <SubscribeButton
          onClick={onClick}
          disabled={isPending || !isLoaded} // disable button during mutation or when the user is not loaded yet
          isSubscribed={user.isSubscribed ?? false} // subscribed state
          isLoading={isPending} // show loader if pending
          className="flex-none"
          showIcon
        />
      )}
    </div>
  );
};

export default VideoOwner;
