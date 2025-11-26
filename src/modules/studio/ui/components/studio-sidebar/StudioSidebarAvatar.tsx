// Import UI components for avatar display and utility functions for CSS class management and variant handling.
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

// Define avatar style variants for different sizes using class-variance-authority (cva).
const avatarVariants = cva("", {
  variants: {
    size: {
      default: "size-9", // Default size styling
      xs: "size-4", // Extra small
      sm: "size-6", // Small
      lg: "size-10", // Large
      xl: "h-[160px] w-[160px] ", // Extra large (custom h/w)
    },
  },
  defaultVariants: {
    size: "default", // Default to "default" size if not specified
  },
});

// Define the prop types for StudioSidebarAvatar, including image URL, name, CSS class, size variant, and optional click handler.
interface StudioSidebarAvatarProps extends VariantProps<typeof avatarVariants> {
  imageUrl: string; // URL of the avatar image
  name: string; // Display name (for alt text)
  className?: string; // Additional CSS class names
  onClick?: () => void; // Optional click event handler
}

// StudioSidebarAvatar is a presentational component to show a user avatar in the studio sidebar.
const StudioSidebarAvatar = ({
  imageUrl,
  name,
  className,
  onClick,
  size,
}: StudioSidebarAvatarProps) => {
  return (
    // The Avatar root element, styled and optionally clickable.
    <Avatar
      className={cn(avatarVariants({ size, className }))}
      onClick={onClick}
    >
      {/* AvatarImage displays the user's image with the alt set to their name. */}
      <AvatarImage src={imageUrl} alt={name} />
    </Avatar>
  );
};

export default StudioSidebarAvatar;
