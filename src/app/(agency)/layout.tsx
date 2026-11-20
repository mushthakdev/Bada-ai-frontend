import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = { title: "Agency", robots: { index: false } };

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell section="agency" allowedRoles={["agency", "agency_member", "admin", "super_admin"]}>
      {children}
    </AppShell>
  );
}
