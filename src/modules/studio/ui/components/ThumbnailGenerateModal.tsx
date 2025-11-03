"use client";

// Import field components for building forms
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

// Import input components for enhanced input controls
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

// Import modal dialog for upload/generation UX
import UploadDialog from "@/components/UploadDialog";

// Import trpc client for API communication
import { trpc } from "@/trpc/client";

// Import utilities for form validation
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";

// Import React Hook Form and Zod for type-safe form state management
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

// Import Zod for schema validation
import z from "zod";

// Props for the thumbnail generation modal
interface ThumbnailGenerateModalProps {
  videoId: string; // ID of the video for which to generate a thumbnail
  open: boolean; // Controls modal visibility
  onOpenChange: (open: boolean) => void; // Callback for open state change
}

// Form schema, requires the user to enter a prompt with minimum length 10
const formSchema = z.object({
  prompt: z.string().min(10),
});

// Main component for Thumbnail Generation Modal
const ThumbnailGenerateModal = ({
  onOpenChange,
  open,
  videoId,
}: ThumbnailGenerateModalProps) => {
  // Setup react-hook-form with Zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  // Form submit handler: triggers API call to generate thumbnail with prompt
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    generateThumbnail.mutate({ videoId: videoId, prompt: values.prompt });
  };

  // Setup mutation for backend API call for thumbnail generation
  const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
    onSuccess: () => {
      toast.success("background task started", {
        description: "You will be notified when the task is complete",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Something went wrong !");
    },
  });

  return (
    <UploadDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Generate Thumbnail"
    >
      {/* Controlled form to capture 'prompt' input and submit */}
      <form id="form-thumbnail-generate" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="prompt"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                {/* Label for the prompt textarea */}
                <FieldLabel htmlFor="form-thumbnail-generate-prompt">
                  Prompt
                </FieldLabel>
                <InputGroup>
                  {/* User prompt for describing the thumbnail */}
                  <InputGroupTextarea
                    {...field}
                    id="form-thumbnail-generate-prompt"
                    aria-invalid={fieldState.invalid}
                    placeholder="Describe your video thumbnail in detail..."
                    value={field.value ?? ""}
                    rows={5}
                    cols={30}
                    className="resize-none pr-10 text-base"
                  />

                  {/* Submit button to generate thumbnail via AI */}
                  <InputGroupAddon align="block-end">
                    <InputGroupButton
                      aria-label="Thumbnail Generate AI"
                      title="Thumbnail Generate AI"
                      size="sm"
                      type="submit"
                      variant="outline"
                      disabled={generateThumbnail.isPending}
                    >
                      <Sparkles className="h-4 w-4 text-muted-foreground" />{" "}
                      Generate
                    </InputGroupButton>
                  </InputGroupAddon>
                  {/* Character counter display */}
                  <InputGroupAddon align="block-end">
                    <InputGroupText className="tabular-nums text-xs">
                      {field.value?.length}/150 character
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {/* Helper description below textarea */}
                <FieldDescription className="text-sm">
                  Provide detailed information to help AI generate your
                  thumbnail
                </FieldDescription>
                {/* Display validation error if input is invalid */}
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
    </UploadDialog>
  );
};

// Export as default so it can be used in other components
export default ThumbnailGenerateModal;
