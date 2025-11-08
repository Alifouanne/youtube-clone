"use client";

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

interface UserInfoProps extends VariantProps<typeof userInfoVariants> {
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  avatarFallback?: string;
  verified?: boolean;
  showTooltip?: boolean;
  className?: string;
  onClick?: () => void;
}

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
  const content = (
    <div
      className={cn(
        userInfoVariants({ size, className }),
        onClick && "cursor-pointer transition-opacity hover:opacity-80"
      )}
      onClick={onClick}
    >
      {/* Avatar */}
      {(avatarUrl || avatarFallback) && (
        <Avatar className={avatarVariants({ size })}>
          <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {avatarFallback || name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Text content */}
      <div className={textVariants({ size })}>
        <div className={nameVariants({ size })}>
          <span className="truncate">{name}</span>
          {verified && (
            <BadgeCheck
              className={badgeVariants({ size })}
              aria-label="Verified"
            />
          )}
        </div>
        {subtitle && <p className={subtitleVariants({ size })}>{subtitle}</p>}
      </div>
    </div>
  );

  if (!showTooltip) {
    return content;
  }

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
