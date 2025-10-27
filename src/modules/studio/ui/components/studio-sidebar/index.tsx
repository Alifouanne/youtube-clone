"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import React from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/ui/arrow-left";
import { ClapIcon } from "@/components/ui/clap";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import StudioSidebarHeader from "./StudioSidebarHeader";

const StudioSidebar = () => {
  const pathName = usePathname();

  return (
    <Sidebar
      className="pt-16 z-40 shadow-md dark:shadow-gray-400/5 border-r"
      collapsible="icon"
    >
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <StudioSidebarHeader />
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Content"
                  asChild
                  isActive={pathName === "/studio"}
                >
                  <Link
                    href="/studio"
                    className="flex items-center gap-4 md:hover:animate-pulsing"
                  >
                    <ClapIcon size={18} />
                    <span className="text-sm">Content</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Separator />
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Exit Studio" asChild>
                  <Link
                    href="/"
                    className="flex items-center gap-4 md:hover:animate-pulsing"
                  >
                    <ArrowLeftIcon size={18} />
                    <span className="text-sm">Exit Studio</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default StudioSidebar;
