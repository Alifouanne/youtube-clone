"use client";

// Import necessary UI components and icons
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

// Props for the VideoMenu component
interface VideoMenuProps {
  videoId: string; // Video identifier
  variant?: "ghost" | "secondary"; // Optional styling variant for the button
  onRemove?: () => void; // Callback for remove action
  onShare?: () => void; // Callback for share action
  onAddToPlaylist?: () => void; // Callback for add to playlist action
  onReport?: () => void; // Callback for report action
  onDownload?: () => void; // Callback for download action
  onSaveToWatchLater?: () => void; // Callback for save to watch later action
  showDownload?: boolean; // Whether to show the download option
  showReport?: boolean; // Whether to show the report option
  showWatchLater?: boolean; // Whether to show the watch later option
}

// Menu of actions for a video, toggled via the "more" button
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
  // State to manage dropdown open/close
  const [isOpen, setIsOpen] = useState(false);

  // Handles share menu action: copies link to clipboard and shows a toast
  const handleShare = () => {
    const fullUrl = `${
      process.env.VERCEL_URL || "http://localhost:3000"
    }/videos/${videoId}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Link copied to the clipboard");
    setIsOpen(false);
  };

  // Handles add to playlist action then closes menu
  const handleAddToPlaylist = () => {
    onAddToPlaylist?.();
    setIsOpen(false);
  };

  // Handles 'save to watch later' action then closes menu
  const handleSaveToWatchLater = () => {
    onSaveToWatchLater?.();
    setIsOpen(false);
  };

  // Handles download action then closes menu
  const handleDownload = () => {
    onDownload?.();
    setIsOpen(false);
  };

  // Handles report action then closes menu
  const handleReport = () => {
    onReport?.();
    setIsOpen(false);
  };

  // Handles remove action then closes menu
  const handleRemove = () => {
    onRemove?.();
    setIsOpen(false);
  };

  return (
    // Dropdown menu root, controlled by 'isOpen' state
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      {/* The button that triggers the dropdown menu */}
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

      {/* Dropdown menu content */}
      <DropdownMenuContent
        align="end"
        className="w-56"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Share option */}
        <DropdownMenuItem
          onClick={handleShare}
          className="cursor-pointer gap-2"
        >
          <ShareIcon className="size-4" />
          <span>Share</span>
        </DropdownMenuItem>

        {/* Add to playlist option */}
        <DropdownMenuItem
          onClick={handleAddToPlaylist}
          className="cursor-pointer gap-2"
        >
          <ListPlusIcon className="size-4" />
          <span>Add to playlist</span>
        </DropdownMenuItem>

        {/* Save to Watch Later option, conditionally rendered */}
        {showWatchLater && (
          <DropdownMenuItem
            onClick={handleSaveToWatchLater}
            className="cursor-pointer gap-2"
          >
            <ClockIcon className="size-4" />
            <span>Save to Watch Later</span>
          </DropdownMenuItem>
        )}

        {/* Download option, conditionally rendered with separator */}
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

        {/* Separator before report or remove actions, if either will be shown */}
        {(showReport || onRemove) && <DropdownMenuSeparator />}

        {/* Report option, conditionally rendered */}
        {showReport && (
          <DropdownMenuItem
            onClick={handleReport}
            className="cursor-pointer gap-2"
          >
            <FlagIcon className="size-4" />
            <span>Report</span>
          </DropdownMenuItem>
        )}

        {/* Remove option, rendered if onRemove callback is provided */}
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

// Export the VideoMenu component for use elsewhere
export default VideoMenu;
