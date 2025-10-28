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
  Globe2Icon,
  LockIcon,
  NotebookText,
} from "lucide-react";
import VideoPlayer from "@/modules/videos/ui/components/VideoPlayer";
import Link from "next/link";
import { snakeCaseToTitle } from "@/lib/utils";
import { useRouter } from "next/navigation";
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
    <form onSubmit={form.handleSubmit(onSubmit)} id="form-video">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Video Details</h1>
          <p className="text-xs text-muted-foreground">
            Manage your video details
          </p>
        </div>
        <div className="flex items-center gap-x-2 ">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? (
              <>
                <Spinner /> Wait
              </>
            ) : (
              "Save"
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => remove.mutate({ id: videoId })}>
                <TrashIcon className="size-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="space-y-8 lg:col-span-3">
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-video-title">Title</FieldLabel>

                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="form-video-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="Add a title to your video"
                    />
                    <InputGroupAddon align="inline-start">
                      <Captions />
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Enter a clear and concise title for your video. This will
                    help viewers understand the content at a glance.
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
                  <FieldLabel htmlFor="form-video-description">
                    Description
                    {/* add AI button  */}
                  </FieldLabel>

                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="form-video-description"
                      aria-invalid={fieldState.invalid}
                      placeholder="Add a description to your video"
                      value={field.value ?? ""}
                      rows={10}
                      className="resize-none pr-10 "
                    />
                    <InputGroupAddon align="block-start" className="">
                      <NotebookText />
                    </InputGroupAddon>
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {field.value?.length}/100 character
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Provide a detailed description to help viewers know more
                    about your video. Good descriptions can improve discovery.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* add thumbnail field here */}
            <Controller
              name="categoryId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-video-categoryId">
                    Category
                  </FieldLabel>

                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <SelectTrigger
                      id="form-video-categoryId"
                      aria-invalid={fieldState.invalid}
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

                  <FieldDescription>
                    Choose the category that best fits your video to help
                    audiences find relevant content and improve recommendations.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </div>
        <div className="flex flex-col gap-y-8 lg:col-span-2">
          <div className="flex flex-col gap-4 dark:bg-card bg-gray-200 rounded-xl overflow-hidden h-fit">
            <div className="aspect-video overflow-hidden relative">
              <VideoPlayer
                playbackId={video.muxPlaybackId}
                thumbnailUrl={video.thumbnailUrl}
                videoId={video.id}
                videoTitle={video.title}
              />
            </div>
            <div className="p-4 flex flex-col gap-y-6">
              <div className="flex justify-between items-center gap-x-2">
                <div className="flex flex-col gap-y-1">
                  <p className="text-xs text-muted-foreground">Video Link</p>
                  <div className="flex items-center gap-x-2">
                    <Link href={`/videos/${video.id}`}>
                      <p className="line-clamp-1 text-sm text-blue-500">
                        {fullUrl}
                      </p>
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      className="shrink-0 "
                      size="icon"
                      disabled={isCopied}
                      onClick={onCopy}
                    >
                      {isCopied ? <CopyCheck /> : <CopyIcon />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-y-1">
                  <p className="text-muted-foreground text-xs">Video Status</p>
                  <p className="text-sm ">
                    {snakeCaseToTitle(video.muxStatus || "preparing")}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-y-1">
                  <p className="text-muted-foreground text-xs">
                    Subtitle Status
                  </p>
                  <p className="text-sm ">
                    {snakeCaseToTitle(video.muxTrackState || "no_subtitle")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <FieldGroup>
            <Controller
              name="visibility"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-video-visibility">
                    Visibility
                  </FieldLabel>

                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <SelectTrigger
                      id="form-video-visibility"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select a visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <Globe2Icon className="size-4 mr-2" />
                        Public
                      </SelectItem>
                      <SelectItem value="private">
                        <LockIcon className="size-4 mr-2" />
                        Private
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <FieldDescription>
                    Choose the visibility that best fits your video to help
                    audiences find relevant content and improve recommendations.
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
  );
};

export default FormSection;
