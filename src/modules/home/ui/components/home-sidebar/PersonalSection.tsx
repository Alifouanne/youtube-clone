"use client";

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

const items = [
  {
    title: "History",
    url: "/playlists/history",
    icon: HistoryIcon,
    auth: true,
  },
  {
    title: "Liked Videos",
    url: "/playlists/liked",
    icon: UpvoteIcon,
    auth: true,
  },
  {
    title: "All Playlists",
    url: "/playlists",
    icon: GalleryVerticalEndIcon,
    auth: true,
  },
];
const PersonalSection = () => {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>You</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                isActive={false}
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
                  <item.icon size={18} />
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
