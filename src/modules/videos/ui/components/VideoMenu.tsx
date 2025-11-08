"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ListPlusIcon,
  ShareIcon,
  Trash2Icon,
  FlagIcon,
  DownloadIcon,
  ClockIcon,
  EllipsisVertical,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface VideoMenuProps {
  videoId: string;
  variant?: "ghost" | "secondary";
  onRemove?: () => void;
  onShare?: () => void;
  onAddToPlaylist?: () => void;
  onReport?: () => void;
  onDownload?: () => void;
  onSaveToWatchLater?: () => void;
  showDownload?: boolean;
  showReport?: boolean;
  showWatchLater?: boolean;
}

const VideoMenu = ({
  videoId,
  onRemove,
  onShare,
  onAddToPlaylist,
  onReport,
  onDownload,
  onSaveToWatchLater,
  variant = "ghost",
  showDownload = true,
  showReport = true,
  showWatchLater = true,
}: VideoMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = () => {
    const fullUrl = `${
      process.env.VERCEL_URL || "http://localhost:3000"
    }/videos/${videoId}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Link copied to the clipboard");
    setIsOpen(false);
  };

  const handleAddToPlaylist = () => {
    onAddToPlaylist?.();
    setIsOpen(false);
  };

  const handleSaveToWatchLater = () => {
    onSaveToWatchLater?.();
    setIsOpen(false);
  };

  const handleDownload = () => {
    onDownload?.();
    setIsOpen(false);
  };

  const handleReport = () => {
    onReport?.();
    setIsOpen(false);
  };

  const handleRemove = () => {
    onRemove?.();
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="icon"
          className="rounded-full transition-colors hover:bg-accent"
        >
          <EllipsisVertical className="size-4" />
          <span className="sr-only">Open video menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          onClick={handleShare}
          className="cursor-pointer gap-2"
        >
          <ShareIcon className="size-4" />
          <span>Share</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleAddToPlaylist}
          className="cursor-pointer gap-2"
        >
          <ListPlusIcon className="size-4" />
          <span>Add to playlist</span>
        </DropdownMenuItem>

        {showWatchLater && (
          <DropdownMenuItem
            onClick={handleSaveToWatchLater}
            className="cursor-pointer gap-2"
          >
            <ClockIcon className="size-4" />
            <span>Save to Watch Later</span>
          </DropdownMenuItem>
        )}

        {showDownload && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDownload}
              className="cursor-pointer gap-2"
            >
              <DownloadIcon className="size-4" />
              <span>Download</span>
            </DropdownMenuItem>
          </>
        )}

        {(showReport || onRemove) && <DropdownMenuSeparator />}

        {showReport && (
          <DropdownMenuItem
            onClick={handleReport}
            className="cursor-pointer gap-2"
          >
            <FlagIcon className="size-4" />
            <span>Report</span>
          </DropdownMenuItem>
        )}

        {onRemove && (
          <DropdownMenuItem
            onClick={handleRemove}
            className="cursor-pointer gap-2 text-destructive focus:text-destructive"
          >
            <Trash2Icon className="size-4" />
            <span>Remove</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default VideoMenu;
