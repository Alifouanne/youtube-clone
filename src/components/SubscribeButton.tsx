"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, BellOff } from "lucide-react";
import { Spinner } from "./ui/spinner";

interface SubscribeButtonProps {
  disabled?: boolean;
  isSubscribed: boolean;
  isLoading?: boolean;
  className?: string;
  onClick: () => void;
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
}

const SubscribeButton = ({
  disabled = false,
  isSubscribed,
  isLoading = false,
  className,
  onClick,
  size = "default",
  showIcon = true,
}: SubscribeButtonProps) => {
  const Icon = isLoading ? Spinner : isSubscribed ? BellOff : Bell;
  const isDisabled = disabled || isLoading;

  return (
    <Button
      disabled={isDisabled}
      variant={isSubscribed ? "secondary" : "default"}
      className={cn(
        "rounded-full transition-all duration-200",
        !isDisabled && "hover:scale-105 active:scale-95",
        isSubscribed &&
          "hover:bg-destructive hover:text-destructive-foreground",
        className
      )}
      onClick={onClick}
      size={size}
      aria-label={isSubscribed ? "Unsubscribe" : "Subscribe"}
    >
      {showIcon && (
        <Icon
          className={cn(
            "size-4",

            size === "sm" && "size-3",
            size === "lg" && "size-5"
          )}
        />
      )}
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
