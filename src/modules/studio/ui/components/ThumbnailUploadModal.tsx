"use client";
import UploadDialog from "@/components/UploadDialog";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface ThumbnailUploadModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const ThumbnailUploadModal = ({
  onOpenChange,
  open,
  videoId,
}: ThumbnailUploadModalProps) => {
  const utils = trpc.useUtils();
  const onUploadComplete = () => {
    onOpenChange(false);
    utils.studio.getOne.invalidate({ id: videoId });
    utils.studio.getMany.invalidate();
    toast.success('"Thumbnail Updated successfully!"');
  };
  return (
    <UploadDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Upload a thumbnail"
    >
      <UploadDropzone
        endpoint="thumbnailUploader"
        input={{
          videoId,
        }}
        onClientUploadComplete={onUploadComplete}
      />
    </UploadDialog>
  );
};

export default ThumbnailUploadModal;
