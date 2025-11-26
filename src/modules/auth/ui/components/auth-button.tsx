"use client";

/**
 * AuthButton component
 *
 * Conditionally renders authentication-related buttons based on user's authentication state.
 * - If the user is signed in:
 *   - Shows a user menu button with options (link to Studio, Manage Account).
 * - If the user is signed out:
 *   - Shows a styled "Sign In" button that opens a modal on click.
 */

import { Button } from "@/components/ui/button";
import { ClapperboardIcon, UserCircleIcon } from "lucide-react";
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";

/**
 * AuthButton functional component
 * Uses Clerk for authentication conditionally rendering user menu or sign-in button.
 */
const AuthButton = () => {
  return (
    <>
      {/* Show this menu if user is signed in */}
      <SignedIn>
        {/* UserButton is the Clerk user menu button; appearance can be themed */}
        <UserButton appearance={{ baseTheme: [shadcn] }}>
          <UserButton.MenuItems>
            {/* Link to Studio dashboard */}
            <UserButton.Link
              href="/studio"
              label="Studio"
              labelIcon={<ClapperboardIcon className="size-4" />}
            />
            {/* Manage Account action */}
            <UserButton.Action label="manageAccount" />
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn>
      {/* Show sign-in button if user is signed out */}
      <SignedOut>
        {/* SignInButton triggers Clerk's sign-in modal */}
        <SignInButton
          mode="modal"
          appearance={{ baseTheme: [shadcn], theme: shadcn }}
        >
          <Button
            size="sm"
            variant="outline"
            className="group relative overflow-hidden rounded-full border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-blue-600/15 px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm transition-all duration-300 hover:border-blue-500/50 hover:from-blue-500/20 hover:to-blue-600/25 hover:shadow-md hover:shadow-blue-500/10 active:scale-95 dark:border-blue-400/40 dark:from-blue-400/15 dark:to-blue-500/20 dark:text-blue-300 dark:shadow-blue-400/5 dark:hover:border-blue-400/60 dark:hover:from-blue-400/25 dark:hover:to-blue-500/30 dark:hover:shadow-blue-400/20 sm:px-5 sm:py-2.5"
          >
            {/* User icon, grows slightly on hover */}
            <UserCircleIcon className="size-4 transition-transform duration-300 group-hover:scale-110 sm:size-5" />
            {/* Show "Sign In" text only at small breakpoint and above */}
            <span className="hidden sm:inline">Sign In</span>
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  );
};

export default AuthButton;
