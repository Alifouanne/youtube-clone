"use client";

// Import necessary UI components and utility functions
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, BellOff } from "lucide-react";
import { Spinner } from "./ui/spinner";

// Define prop types for the SubscribeButton component
interface SubscribeButtonProps {
  disabled?: boolean; // Whether the button should be disabled
  isSubscribed: boolean; // Whether the user is currently subscribed
  isLoading?: boolean; // Whether a subscribe/unsubscribe action is in progress
  className?: string; // Optional additional CSS classes
  onClick: () => void; // Handler for button click
  size?: "default" | "sm" | "lg" | "icon"; // Size variant for styling
  showIcon?: boolean; // Whether to display the icon alongside the text
}

/**
 * SubscribeButton
 *
 * Renders a button to subscribe or unsubscribe from a user/channel.
 * - Shows a loading spinner during subscribe/unsubscribe actions.
 * - Toggles between "Subscribe" and "Unsubscribe" states.
 * - Optionally shows an icon indicating the subscription state.
 * - Adapts style and content based on props.
 */
const SubscribeButton = ({
  disabled = false,
  isSubscribed,
  isLoading = false,
  className,
  onClick,
  size = "default",
  showIcon = true,
}: SubscribeButtonProps) => {
  // Determine which icon to display:
  // - Spinner when loading
  // - BellOff when already subscribed
  // - Bell when not subscribed
  const Icon = isLoading ? Spinner : isSubscribed ? BellOff : Bell;

  // Disable button if any loading or external disabled flag is true
  const isDisabled = disabled || isLoading;

  return (
    <Button
      disabled={isDisabled}
      variant={isSubscribed ? "secondary" : "default"}
      className={cn(
        "rounded-full transition-all duration-200", // Always rounded with smooth transitions
        !isDisabled && "hover:scale-105 active:scale-95", // Scale effect on hover/active if enabled
        isSubscribed && // If subscribed, warn on hover
          "hover:bg-destructive hover:text-destructive-foreground",
        className // Include custom classes if provided
      )}
      onClick={onClick}
      size={size}
      aria-label={isSubscribed ? "Unsubscribe" : "Subscribe"} // Accessible label reflects action
    >
      {/* Show icon (spinner, bell, or bell-off) based on props */}
      {showIcon && (
        <Icon
          className={cn(
            "size-4", // Default icon size
            size === "sm" && "size-3", // Smaller icon for sm
            size === "lg" && "size-5" // Larger icon for lg
          )}
        />
      )}

      {/* Label that describes the current or pending action */}
      <span className={cn(showIcon && "ml-2")}>
        {isLoading
          ? isSubscribed
            ? "Unsubscribing..."
            : "Subscribing..."
          : isSubscribed
          ? "Unsubscribe"
          : "Subscribe"}
      </span>
    </Button>
  );
};

export default SubscribeButton;
