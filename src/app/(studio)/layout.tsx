import { StudioLayout } from "@/modules/studio/ui/layouts/StudioLayout";
import React, { ReactNode } from "react";

function Layout({ children }: { children: ReactNode }) {
  return <StudioLayout>{children}</StudioLayout>;
}

export default Layout;
