// Import required components and icons.
// Button: UI button component
// MuxUploader components: Video uploader UI and logic (drop area, file select, progress, status)
// UploadIcon: Uploading icon
import { Button } from "@/components/ui/button";
import MuxUploader, {
  MuxUploaderDrop,
  MuxUploaderFileSelect,
  MuxUploaderProgress,
  MuxUploaderStatus,
} from "@mux/mux-uploader-react";
import { UploadIcon } from "lucide-react";

// Props interface for the StudioUploader component.
// - endpoint: optional Mux direct upload URL
// - onSuccess: callback when a video upload succeeds
interface StudioUploaderProps {
  endpoint?: string | null;
  onSuccess: () => void;
}

// StudioUploader component provides a drag-and-drop (or select) UI for uploading video files.
// Uses MuxUploader for uploading and tracking progress.
const StudioUploader = ({ onSuccess, endpoint }: StudioUploaderProps) => {
  return (
    <div>
      {/* Hidden MuxUploader instance to handle the upload logic.
          - endpoint: the upload URL
          - id: referenced by other mux ui components
          - className: hidden (controller only)
          - onSuccess: trigger callback when upload completes */}
      <MuxUploader
        endpoint={endpoint}
        id="video-uploader"
        className="hidden group/uploader:"
        onSuccess={onSuccess}
      />

      {/* Visible drop area UI for users to drag and drop their video files */}
      <MuxUploaderDrop muxUploader="video-uploader" className="group/drop">
        {/* Heading with upload icon and instructions */}
        <div slot="heading" className="flex flex-col items-center gap-6">
          {/* Circular background with animated upload icon */}
          <div className="flex items-center justify-center gap-2 rounded-full bg-muted size-32">
            <UploadIcon className="size-10 text-muted-foreground animate-bouncing animate-iteration-count-infinite transition-all" />
          </div>
          {/* Information and description for the uploader */}
          <div className="flex flex-col gap-2 text-center">
            <p className="text-sm">Drag and drop video files to upload</p>
            <p className="text-xs text-muted-foreground">
              Your video will be private until you publish them
            </p>
          </div>
          {/* File selection button as alternative to drag and drop */}
          <MuxUploaderFileSelect muxUploader="video-uploader">
            <Button type="button" className="rounded-full">
              Select Files
            </Button>
          </MuxUploaderFileSelect>
        </div>
        {/* Separator (currently hidden) */}
        <span slot="separator" className="hidden" />
        {/* Indicates upload status (idle, uploading, error, success) */}
        <MuxUploaderStatus muxUploader="video-uploader" className="text-sm" />
        {/* Shows text percentage progress of current upload */}
        <MuxUploaderProgress
          muxUploader="video-uploader"
          className="text-sm"
          type="percentage"
        />
        {/* Shows a horizontal bar progress indicator */}
        <MuxUploaderProgress
          muxUploader="video-uploader"
          type="bar"
          color="#737373"
        />
      </MuxUploaderDrop>
    </div>
  );
};

// Export the StudioUploader component as default export.
export default StudioUploader;
