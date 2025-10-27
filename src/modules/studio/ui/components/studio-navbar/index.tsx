import { ButtonGroupSeparator } from "@/components/ui/button-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { SidebarTrigger } from "@/components/ui/sidebar";
import AuthButton from "@/modules/auth/ui/components/auth-button";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ThemeToggleButton } from "@/modules/home/ui/components/theme/theme-toggle-buttons";
import { InteractiveHoverButton } from "../StudioUploadModal";

const StudioNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-transparent backdrop-blur-2xl flex items-center px-2 justify-between pr-5 z-50 border-b shadow-md dark:shadow-gray-400/5">
      {/* Menu & Logo */}
      <Item className="flex-nowrap shrink-0 p-1">
        <ItemActions>
          <SidebarTrigger />
        </ItemActions>
        <div className="flex items-center gap-1">
          <ItemMedia variant="image">
            <Link href="/studio">
              <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            </Link>
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="text-xl font-semibold tracking-tight hidden sm:block">
              Studio
            </ItemTitle>
          </ItemContent>
        </div>
      </Item>

      <div className="flex shrink-0 items-center gap-2 ml-2">
        <InteractiveHoverButton
          text="Create"
          className=" border-black dark:border-white"
        />
        <AuthButton />
        <ButtonGroupSeparator />
        <ThemeToggleButton className="size-9  " />
      </div>
    </nav>
  );
};

export default StudioNavbar;
