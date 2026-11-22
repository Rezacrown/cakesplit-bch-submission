import type { ReactNode } from "react";
import { BlazeTopBanner } from "./BlazeTopBanner";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <BlazeTopBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
