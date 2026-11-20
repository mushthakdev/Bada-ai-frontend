import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = { robots: { index: false } };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell section="app" allowedRoles={["advertiser", "admin", "super_admin"]}>
      {children}
    </AppShell>
  );
}
