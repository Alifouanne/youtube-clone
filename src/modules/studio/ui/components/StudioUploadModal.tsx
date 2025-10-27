"use client";
import React from "react";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import UploadDialog from "@/components/UploadDialog";
import StudioUploader from "./StudioUploader";
import { useRouter } from "next/navigation";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, ...props }, ref) => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      toast.success("Video created successfully!");
    },
    onError: (error) => {
      toast.error(`Error creating video: ${error.message}`);
    },
  });
  const onSuccess = () => {
    if (!create.data?.video.id) return;
    create.reset();
    router.push(`/studio/videos/${create.data.video.id}`);
  };
  return (
    <>
      <UploadDialog
        open={!!create.data}
        title="Upload a video"
        onOpenChange={() => create.reset()}
      >
        {create.data?.url ? (
          <StudioUploader endpoint={create.data?.url} onSuccess={onSuccess} />
        ) : (
          <Spinner />
        )}
      </UploadDialog>
      <button
        ref={ref}
        className={cn(
          "group relative w-28 cursor-pointer overflow-hidden rounded-md border bg-background p-1 text-center font-semibold",
          className
        )}
        {...props}
        onClick={() => create.mutate()}
        disabled={create.isPending}
      >
        <span className="inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {create.isPending ? (
            <Spinner className="text-center flex items-center mt-2" />
          ) : (
            text
          )}
        </span>
        <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-1 text-primary-foreground opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100">
          <span>{text}</span>
          {create.isPending ? <Spinner /> : <PlusIcon />}
        </div>
        <div className="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-primary transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:bg-primary"></div>
      </button>
    </>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
