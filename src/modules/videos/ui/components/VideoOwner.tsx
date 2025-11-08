"use client";
import Link from "next/link";
import { VideoGetOneOutput } from "../../types";
import StudioSidebarAvatar from "@/modules/studio/ui/components/studio-sidebar/StudioSidebarAvatar";
import { useAuth } from "@clerk/nextjs";
import SubscribeButton from "@/components/SubscribeButton";
import { SquarePenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserInfo from "@/modules/users/ui/components/UserInfo";

interface VideoOwnerProps {
  user: VideoGetOneOutput["user"];
  id: string;
}
const VideoOwner = ({ id: videoId, user }: VideoOwnerProps) => {
  const { userId } = useAuth();
  return (
    <div className="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0">
      <Link href={`/users/${user.id}`}>
        <div className="flex items-center gap-3 min-w-0">
          <StudioSidebarAvatar
            imageUrl={user.imageUrl}
            name={user.name}
            size="lg"
          />
          <div className="flex flex-col gap-1 min-w-0">
            <UserInfo name={user.name} size="lg" verified showTooltip />
            <span className="text-sm text-muted-foreground line-clamp-1">
              {0} Subscribers
            </span>
          </div>
        </div>
      </Link>
      {userId === user.clerkId ? (
        <Button variant="secondary" className="rounded-full" asChild>
          <Link href={`/studio/videos/${videoId}`}>
            Edit Video <SquarePenIcon />
          </Link>
        </Button>
      ) : (
        <SubscribeButton
          onClick={() => {}}
          disabled={false}
          isSubscribed={false}
          className="flex-none"
          showIcon
        />
      )}
    </div>
  );
};

export default VideoOwner;
