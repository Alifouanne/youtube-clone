"use client";

// Import icons for sidebar menu items
import { FlameIcon } from "@/components/ui/flame";
import { HeartIcon } from "@/components/ui/heart";
import { HouseIcon } from "@/components/ui/HouseIcon";

// Import sidebar UI components
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Import authentication hooks from Clerk
import { useAuth, useClerk } from "@clerk/nextjs";

// Next.js Link component for client-side navigation
import Link from "next/link";

// Define sidebar menu items - each item has a title, url, and icon.
// The "auth" property indicates the route requires sign-in.
const items = [
  {
    title: "Home",
    url: "/",
    icon: HouseIcon,
  },
  {
    title: "Subscriptions",
    url: "/feed/subscriptions",
    icon: HeartIcon,
    auth: true,
  },
  {
    title: "Trending",
    url: "/feed/trending",
    icon: FlameIcon,
  },
];

// MainSection component renders the main section of the sidebar.
const MainSection = () => {
  // Access Clerk instance for authentication actions
  const clerk = useClerk();
  // Determine if user is signed in
  const { isSignedIn } = useAuth();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Render each item in the sidebar menu */}
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                isActive={false}
                // Handle click: If route requires auth and user is not signed in,
                // prevent navigation and open sign-in modal
                onClick={(e) => {
                  if (!isSignedIn && item.auth) {
                    e.preventDefault();
                    return clerk.openSignIn();
                  }
                }}
              >
                <Link
                  href={item.url}
                  className="flex items-center gap-4 md:hover:animate-pulsing"
                >
                  {/* Render icon for the menu item */}
                  <item.icon size={18} />
                  {/* Render the item title */}
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

export default MainSection;
