"use client";

// Import required UI components and utilities
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { BadgeCheck } from "lucide-react";

// Style variants for the main UserInfo container
const userInfoVariants = cva("flex items-center gap-2", {
  variants: {
    size: {
      sm: "gap-1.5",
      default: "gap-2",
      lg: "gap-3",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

// Style variants for the user's avatar
const avatarVariants = cva("shrink-0", {
  variants: {
    size: {
      sm: "size-6",
      default: "size-8",
      lg: "size-10",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

// Style variants for the text section (name and subtitle)
const textVariants = cva("flex flex-col min-w-0", {
  variants: {
    size: {
      sm: "gap-0",
      default: "gap-0.5",
      lg: "gap-0.5",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

// Style variants for displaying the user's name and (optionally) verified badge
const nameVariants = cva(
  "font-medium text-foreground line-clamp-1 flex items-center gap-1",
  {
    variants: {
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

// Style variants for the subtitle (e.g. a user's email or summary)
const subtitleVariants = cva("text-muted-foreground line-clamp-1", {
  variants: {
    size: {
      sm: "text-[10px]",
      default: "text-xs",
      lg: "text-sm",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

// Style variants for the verified badge icon
const badgeVariants = cva("shrink-0 text-primary", {
  variants: {
    size: {
      sm: "size-3",
      default: "size-3.5",
      lg: "size-4",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

// Props for the UserInfo component, including interface for style variants
interface UserInfoProps extends VariantProps<typeof userInfoVariants> {
  name: string; // User's display name
  subtitle?: string; // Optional subtitle text
  avatarUrl?: string; // Optional avatar image URL
  avatarFallback?: string; // If no avatar, fallback string (e.g. an initial)
  verified?: boolean; // Show a verified badge if true
  showTooltip?: boolean; // Show tooltip on hover
  className?: string; // Additional custom classNames
  onClick?: () => void; // Optional click handler
}

// UserInfo component displays user's avatar and name, supports optional tooltip and badge
const UserInfo = ({
  name,
  subtitle,
  avatarUrl,
  avatarFallback,
  verified = false,
  showTooltip = true,
  className,
  size,
  onClick,
}: UserInfoProps) => {
  // Main content to be rendered (used inside and outside tooltip)
  const content = (
    <div
      // Merge style variant and custom classNames, apply pointer cursor/hover effect if clickable
      className={cn(
        userInfoVariants({ size, className }),
        onClick && "cursor-pointer transition-opacity hover:opacity-80"
      )}
      onClick={onClick}
    >
      {/* User avatar section */}
      {(avatarUrl || avatarFallback) && (
        <Avatar className={avatarVariants({ size })}>
          <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {avatarFallback || name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      {/* User name and (optionally) subtitle */}
      <div className={textVariants({ size })}>
        <div className={nameVariants({ size })}>
          {/* Truncated username */}
          <span className="truncate">{name}</span>
          {/* Verified badge, if enabled */}
          {verified && (
            <BadgeCheck
              className={badgeVariants({ size })}
              aria-label="Verified"
            />
          )}
        </div>
        {/* Optional subtitle below the name */}
        {subtitle && <p className={subtitleVariants({ size })}>{subtitle}</p>}
      </div>
    </div>
  );

  // If tooltips are disabled, just return the content directly
  if (!showTooltip) {
    return content;
  }

  // Tooltip appears on hover/focus; shows name & subtitle
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent align="center" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{name}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UserInfo;
