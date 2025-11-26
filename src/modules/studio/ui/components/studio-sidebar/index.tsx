"use client";

// Import sidebar components and utilities for building the sidebar UI.
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

// StudioSidebar displays the navigation sidebar for the studio section.
const StudioSidebar = () => {
  // Get the current pathname to determine which menu item is active.
  const pathName = usePathname();

  return (
    // Sidebar wrapper component with custom styling and collapsibility.
    <Sidebar
      className="pt-16 z-40 shadow-md dark:shadow-gray-400/5 border-r"
      collapsible="icon"
    >
      {/* Main content area for the sidebar */}
      <SidebarContent className="bg-background">
        {/* Grouping for organizational or accessibility purposes */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Renders the header section specific to the studio sidebar */}
              <StudioSidebarHeader />
              {/* Menu item for navigating to the 'Content' page */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Content"
                  asChild
                  // Mark this item active if the user is on the '/studio' path
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
              {/* Visual separator between main and secondary actions */}
              <Separator />
              {/* Menu item for exiting studio, navigating back to the root page */}
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
