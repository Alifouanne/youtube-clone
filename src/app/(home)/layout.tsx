import { HomeLayout } from "@/modules/home/ui/layouts/home-layout";
import React, { ReactNode } from "react";

function Layout({ children }: { children: ReactNode }) {
  return <HomeLayout>{children}</HomeLayout>;
}

export default Layout;
