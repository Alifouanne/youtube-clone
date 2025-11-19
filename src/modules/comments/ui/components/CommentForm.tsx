"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { commentsInsertSchema } from "@/database/schema";
import StudioSidebarAvatar from "@/modules/studio/ui/components/studio-sidebar/StudioSidebarAvatar";
import { trpc } from "@/trpc/client";
import { useClerk, useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface commentFormProps {
  videoId: string;
  onSuccess?: () => void;
}
const CommentForm = ({ videoId, onSuccess }: commentFormProps) => {
  const { user } = useUser();
  const clerk = useClerk();
  const utils = trpc.useUtils();
  const create = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId });
      form.reset();
      toast.success("Comment added successfully.");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });
  const formSchema = commentsInsertSchema.omit({ userId: true });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoId,
      content: "",
    },
  });
  const handleSubmit = (value: z.infer<typeof formSchema>) => {
    create.mutate(value);
  };
  return (
    <form
      className="flex gap-3 sm:gap-4 group transition-all duration-200"
      id="form-comment"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className="shrink-0 transition-transform duration-200 group-focus-within:scale-105">
        <StudioSidebarAvatar
          size="lg"
          imageUrl={user?.imageUrl || "/userPlaceholder.svg"}
          name={user?.fullName || "User"}
        />
      </div>
      <FieldSet className="flex-1 min-w-0">
        <FieldGroup>
          <Controller
            name="content"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor="form-comment-content"
                  className="text-sm font-medium transition-colors duration-200 group-focus-within:text-foreground"
                >
                  Write a Comment
                </FieldLabel>

                <InputGroup className="flex-1 border border-border/50 rounded-lg transition-all duration-200 hover:border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 bg-background/50 backdrop-blur-sm">
                  <InputGroupTextarea
                    {...field}
                    id="form-comment-comment"
                    aria-invalid={fieldState.invalid}
                    placeholder="Share your thoughts..."
                    className="resize-none bg-transparent overflow-hidden min-h-0 border-0 focus-visible:ring-0 placeholder:text-muted-foreground/60 transition-all duration-200 px-4 py-3"
                    rows={1}
                  />
                  <InputGroupAddon align="block-end" className="p-2">
                    <InputGroupButton
                      size="sm"
                      variant="default"
                      className="ml-auto font-medium shadow-sm hover:shadow transition-all duration-200 opacity-0 group-focus-within:opacity-100 translate-y-1 group-focus-within:translate-y-0"
                      type="submit"
                      disabled={create.isPending}
                    >
                      {create.isPending ? (
                        <>
                          Comment <Spinner />
                        </>
                      ) : (
                        "Comment"
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription className="text-xs mt-2 transition-all duration-200 opacity-60 group-focus-within:opacity-100">
                  Please keep your comment respectful and on topic.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
    </form>
  );
};

export default CommentForm;
