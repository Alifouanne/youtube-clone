"use client";

import { FlameIcon } from "@/components/ui/flame";
import { HeartIcon } from "@/components/ui/heart";
import { HouseIcon } from "@/components/ui/HouseIcon";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth, useClerk } from "@clerk/nextjs";
import Link from "next/link";

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
const MainSection = () => {
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                isActive={false}
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

export default MainSection;
