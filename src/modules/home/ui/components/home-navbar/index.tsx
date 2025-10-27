import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { SidebarTrigger } from "@/components/ui/sidebar";
import AuthButton from "@/modules/auth/ui/components/auth-button";
import { SearchIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ThemeToggleButton } from "../theme/theme-toggle-buttons";

const HomeNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-transparent backdrop-blur-2xl flex items-center px-2 pr-5 z-50">
      {/* Menu & Logo */}
      <Item className="flex-nowrap shrink-0 p-1">
        <ItemActions>
          <SidebarTrigger />
        </ItemActions>
        <div className="flex items-center gap-1">
          <ItemMedia variant="image">
            <Link href="/">
              <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            </Link>
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="text-xl font-semibold tracking-tight hidden sm:block">
              VibeTube
            </ItemTitle>
          </ItemContent>
        </div>
      </Item>
      {/* Search bar */}
      <ButtonGroup className="flex-1 flex justify-center mx-auto max-w-[720px] ">
        <InputGroup className=" rounded-full  ">
          <InputGroupInput type="search" placeholder="Search..." />
        </InputGroup>
        <Button
          type="submit"
          variant="outline"
          className="px-5 py-2.5 border border-l-0 rounded-r-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SearchIcon className="size-5" />
        </Button>
      </ButtonGroup>
      <div className="flex shrink-0 items-center gap-2 ml-2">
        <AuthButton />
        <ButtonGroupSeparator />
        <ThemeToggleButton className="size-9  " />
      </div>
    </nav>
  );
};

export default HomeNavbar;
