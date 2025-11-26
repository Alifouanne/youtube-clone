"use client";

// Import necessary UI components and hooks
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import {
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import StudioSidebarAvatar from "./StudioSidebarAvatar";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";

// StudioSidebarHeader displays the top section (profile preview) in the studio sidebar.
// It adjusts its rendering based on authentication (user presence) and sidebar state (collapsed or expanded).
const StudioSidebarHeader = () => {
  // Get the authenticated user object
  const { user } = useUser();
  // Get the current sidebar state (expanded/collapsed)
  const { state } = useSidebar();

  // If user data is not yet loaded, show loading skeletons
  if (!user)
    return (
      <SidebarHeader className="flex items-center justify-center pb-4">
        {/* Avatar skeleton */}
        <Skeleton className="size-[112px] rounded-full" />
        {/* Name and description skeletons */}
        <div className="flex flex-col items-center mt-2 gap-y-1 p-[14px]">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </SidebarHeader>
    );

  // If the sidebar is collapsed, just show a small avatar in the menu
  if (state === "collapsed") {
    return (
      <SidebarMenuItem>
        {/* Button with tooltip for user's profile */}
        <SidebarMenuButton tooltip="Your profile" asChild>
          <Link href="/users/current">
            {/* Mini avatar for collapsed state */}
            <StudioSidebarAvatar
              imageUrl={user.imageUrl}
              name={user.fullName || "User"}
              size="xs"
            />
            <span className="text-sm">Your Profile</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // When expanded, show a large avatar and detailed user info
  return (
    <SidebarHeader className="flex items-center justify-center pb-4">
      {/* Main user avatar with profile link */}
      <Link href="/user/current">
        <StudioSidebarAvatar
          imageUrl={user.imageUrl}
          name={user.fullName || "User"}
          className="size-[112px] hover:opacity-80 transition-opacity md:hover:animate-pop"
        />
      </Link>
      {/* Display user name and label */}
      <Item>
        <ItemContent>
          <ItemTitle className="font-extrabold tracking-tight select-none bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900 text-transparent bg-clip-text dark:bg-gradient-to-br dark:from-slate-100 dark:via-slate-500 dark:to-slate-950 dark:text-transparent dark:bg-clip-text">
            Your Profile
          </ItemTitle>
          <ItemDescription className="text-xs  text-zinc-600 dark:text-zinc-400 leading-relaxed select-none">
            {user.fullName}
          </ItemDescription>
        </ItemContent>
      </Item>
    </SidebarHeader>
  );
};

export default StudioSidebarHeader;
