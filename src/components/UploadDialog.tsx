"use client";

/**
 * UploadDialog component
 *
 * This component provides a modal/dialog UI for uploads.
 * It renders differently on mobile vs. desktop:
 * - On mobile devices, it shows a bottom drawer
 * - On desktop, it displays a modal dialog
 *
 * Props:
 * - children: The content (form/UI) shown inside the dialog/drawer
 * - open: Whether the dialog/drawer is currently open
 * - title: The title text displayed at the top
 * - onOpenChange: Callback triggered when the dialog is opened/closed
 */

import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface UploadDialogProps {
  children: React.ReactNode; // Content to render inside
  open: boolean; // Controls open/close state
  title: string; // Title displayed at top
  onOpenChange: (open: boolean) => void; // Open state change callback
}

const UploadDialog = ({
  children,
  onOpenChange,
  open,
  title,
}: UploadDialogProps) => {
  // Detect if the user is on a mobile device
  const isMobile = useIsMobile();

  if (isMobile) {
    // Mobile: Show the drawer (bottom sheet style)
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          {children}
        </DrawerContent>
      </Drawer>
    );
  }
  // Desktop: Show the dialog modal
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;
