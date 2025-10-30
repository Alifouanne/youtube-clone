"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon } from "@/components/ui/EllipsisVerticalIcon";
import { TrashIcon } from "@/components/ui/TrashIcon";
import ErrorFallback from "@/modules/home/ui/fallbacks/ErrorFallback";
import { trpc } from "@/trpc/client";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { videoUpdateSchema } from "@/database/schema";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Captions,
  CopyCheck,
  CopyIcon,
  Eye,
  Globe2Icon,
  ImagePlusIcon,
  LockIcon,
  NotebookText,
  RotateCcw,
  SparkleIcon,
} from "lucide-react";
import VideoPlayer from "@/modules/videos/ui/components/VideoPlayer";
import Link from "next/link";
import { cn, snakeCaseToTitle } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import ThumbnailUploadModal from "../components/ThumbnailUploadModal";
interface FormSectionProps {
  videoId: string;
}
const FormSectionSkeleton = () => {
  return <div>Loading...</div>;
};
const FormSection = ({ videoId }: FormSectionProps) => {
  return (
    <Suspense fallback={<FormSectionSkeleton />}>
      <ErrorBoundary
        fallback={
          <ErrorFallback
            title="Unable to load video details"
            description="There was a problem retrieving the video data. Please refresh the page or try again later."
          />
        }
      >
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);
  const router = useRouter();
  const utils = trpc.useUtils();
  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();
  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      toast.success("You Updated video details");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });
  const remove = trpc.videos.remove.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      toast.success("You video removed ");
      router.push("/studio");
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });
  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    defaultValues: video,
    resolver: zodResolver(videoUpdateSchema),
  });

  const onSubmit = async (data: z.infer<typeof videoUpdateSchema>) => {
    await update.mutateAsync(data);
  };
  const fullUrl = `${
    process.env.VERCEL_URL || "http://localhost:3000"
  }/videos/${video.id}`;
  const [isCopied, setIsCopied] = useState(false);
  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  return (
    <>
      <ThumbnailUploadModal
        open={thumbnailModalOpen}
        onOpenChange={setThumbnailModalOpen}
        videoId={videoId}
      />
      <form onSubmit={form.handleSubmit(onSubmit)} id="form-video">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Video Details</h1>
            <p className="text-xs text-muted-foreground">
              Manage and customize your video settings
            </p>
          </div>
          <div className="flex items-center gap-x-2 ">
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? (
                <>
                  <Spinner /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <EllipsisVerticalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => remove.mutate({ id: videoId })}
                  className="text-destructive focus:text-destructive"
                >
                  <TrashIcon className="size-4 mr-2" /> Delete Video
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="space-y-8 lg:col-span-3">
            <FieldGroup className="space-y-6">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="form-video-title"
                      className="text-base font-semibold"
                    >
                      Title
                    </FieldLabel>

                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id="form-video-title"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter a compelling title for your video"
                        className="text-base"
                      />
                      <InputGroupAddon align="inline-start">
                        <Captions className="h-4 w-4 text-muted-foreground" />
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription className="text-sm">
                      Create a clear, engaging title that accurately describes
                      your content.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="form-video-description"
                      className="text-base font-semibold"
                    >
                      Description
                      {/* add AI button  */}
                    </FieldLabel>

                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="form-video-description"
                        aria-invalid={fieldState.invalid}
                        placeholder="Describe your video content in detail..."
                        value={field.value ?? ""}
                        rows={10}
                        className="resize-none pr-10 text-base"
                      />
                      <InputGroupAddon align="block-start">
                        <NotebookText className="h-4 w-4 text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums text-xs">
                          {field.value?.length}/100 character
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription className="text-sm">
                      Provide detailed information to help viewers discover your
                      content
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="thumbnailUrl"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="form-video-thumbnailId"
                      className="text-base font-semibold"
                    >
                      Thumbnail
                    </FieldLabel>
                    <div className="p-0.5 border border-dashed border-neutral-400 relative h-[84px] w-[153px] group">
                      <Image
                        fill
                        alt="Thumbnail"
                        src={video.thumbnailUrl || "/placeholder.svg"}
                        className="object-cover"
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          id="form-video-categoryId"
                          aria-invalid={fieldState.invalid}
                        >
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="absolute top-1 right-1 opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-7"
                          >
                            <EllipsisVerticalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" side="right">
                          <DropdownMenuItem
                            onClick={() => setThumbnailModalOpen(true)}
                          >
                            <ImagePlusIcon className="size-4 mr-1" />
                            Change
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <SparkleIcon className="size-4 mr-1" />
                            AI-Generated
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RotateCcw className="size-4 mr-1" />
                            Restore
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Field>
                )}
              />
              <Controller
                name="categoryId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="form-video-categoryId"
                      className="text-base font-semibold"
                    >
                      Category
                    </FieldLabel>

                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <SelectTrigger
                        id="form-video-categoryId"
                        aria-invalid={fieldState.invalid}
                        className="text-base"
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem value={category.id} key={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FieldDescription className="text-sm">
                      Choose the most relevant category to improve
                      discoverability.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card className="overflow-hidden border-2">
              <div className="aspect-video bg-muted relative overflow-hidden">
                <VideoPlayer
                  playbackId={video.muxPlaybackId}
                  thumbnailUrl={video.thumbnailUrl}
                  videoId={video.id}
                  videoTitle={video.title}
                />
              </div>

              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        Video Link
                      </p>
                      <Link
                        href={`/videos/${video.id}`}
                        className="text-sm text-primary hover:underline line-clamp-1 break-all"
                      >
                        {fullUrl}
                      </Link>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-8 w-8"
                      disabled={isCopied}
                      onClick={onCopy}
                    >
                      {isCopied ? (
                        <CopyCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <CopyIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs font-medium">Status</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        video.muxStatus === "waiting"
                          ? "bg-yellow-600/10 text-yellow-600 "
                          : video.muxStatus === "ready"
                          ? "bg-green-600/10 text-green-600 "
                          : video.muxStatus === "error"
                          ? "bg-red-600/10 text-red-600 "
                          : video.muxStatus === null
                          ? "bg-gray-600/10 text-gray-600 "
                          : "bg-gray-600/10 text-gray-600 "
                      )}
                    >
                      {snakeCaseToTitle(video.muxStatus || "preparing")}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Captions className="h-4 w-4" />
                      <span className="text-xs font-medium">Subtitles</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        video.muxStatus === "waiting"
                          ? "bg-yellow-600/10 text-yellow-600 "
                          : video.muxStatus === "ready"
                          ? "bg-green-600/10 text-green-600 "
                          : video.muxStatus === "error"
                          ? "bg-red-600/10 text-red-600 "
                          : video.muxStatus === null
                          ? "bg-gray-600/10 text-gray-600 "
                          : "bg-gray-600/10 text-gray-600 "
                      )}
                    >
                      {snakeCaseToTitle(video.muxTrackState || "no_subtitle")}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <FieldGroup>
              <Controller
                name="visibility"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="form-video-visibility"
                      className="text-base font-semibold"
                    >
                      Visibility
                    </FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <SelectTrigger
                        id="form-video-visibility"
                        aria-invalid={fieldState.invalid}
                        className="text-base"
                      >
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe2Icon className="h-4 w-4" />
                            <span>Public</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <LockIcon className="h-4 w-4" />
                            <span>Private</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldDescription className="text-sm">
                      Control who can view your video
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>
        </div>
      </form>
    </>
  );
};

export default FormSection;
