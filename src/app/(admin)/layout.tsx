import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell section="admin" allowedRoles={["admin", "super_admin"]}>
      {children}
    </AppShell>
  );
}
