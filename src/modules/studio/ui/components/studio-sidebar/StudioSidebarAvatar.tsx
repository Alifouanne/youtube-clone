import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

const avatarVariants = cva("", {
  variants: {
    size: {
      default: "size-9",
      xs: "size-4",
      sm: "size-6",
      lg: "size-10",
      xl: "h-[160px] w-[160px] ",
    },
  },
  defaultVariants: {
    size: "default",
  },
});
interface StudioSidebarAvatarProps extends VariantProps<typeof avatarVariants> {
  imageUrl: string;
  name: string;
  className?: string;
  onClick?: () => void;
}
const StudioSidebarAvatar = ({
  imageUrl,
  name,
  className,
  onClick,
  size,
}: StudioSidebarAvatarProps) => {
  return (
    <Avatar
      className={cn(avatarVariants({ size, className }))}
      onClick={onClick}
    >
      <AvatarImage src={imageUrl} alt={name} />
    </Avatar>
  );
};

export default StudioSidebarAvatar;
