"use client";

// Import icons and UI components used in sidebar section
import { GalleryVerticalEndIcon } from "@/components/ui/gallery-vertical-end";
import { HistoryIcon } from "@/components/ui/history";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UpvoteIcon } from "@/components/ui/upvote";
import { useAuth, useClerk } from "@clerk/nextjs";
import Link from "next/link";

// Define the menu items for the personal section of the sidebar.
// Each item has a title, URL, icon, and a flag indicating if authentication is required.
const items = [
  {
    title: "History",
    url: "/playlists/history",
    icon: HistoryIcon,
    auth: true, // Requires sign-in
  },
  {
    title: "Liked Videos",
    url: "/playlists/liked",
    icon: UpvoteIcon,
    auth: true, // Requires sign-in
  },
  {
    title: "All Playlists",
    url: "/playlists",
    icon: GalleryVerticalEndIcon,
    auth: true, // Requires sign-in
  },
];

// PersonalSection renders the "You" group of the sidebar.
// It conditionally opens the sign-in dialog for private (auth) routes when necessary.
const PersonalSection = () => {
  // Get Clerk instance for authentication actions (e.g. opening sign-in modal)
  const clerk = useClerk();
  // Get signed-in status from Clerk authentication
  const { isSignedIn } = useAuth();

  return (
    <SidebarGroup>
      {/* Group label for this section */}
      <SidebarGroupLabel>You</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Render each personal item as a sidebar menu entry */}
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                isActive={false}
                // Handle click:
                // Prevent navigation and show Clerk sign-in modal for unauthenticated users on private routes.
                onClick={(e) => {
                  e.preventDefault();
                  if (!isSignedIn && item.auth) {
                    return clerk.openSignIn();
                  }
                }}
              >
                <Link
                  href={item.url}
                  className="flex items-center gap-4 md:hover:animate-pulsing"
                >
                  {/* Render the associated icon for this menu item */}
                  <item.icon size={18} />
                  {/* Render the title for the menu item */}
                  <span className="text-sm">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default PersonalSection;
