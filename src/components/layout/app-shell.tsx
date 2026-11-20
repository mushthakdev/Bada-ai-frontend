"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { ShellSection } from "@/components/layout/nav-config";
import type { UserRole } from "@/types";

interface AppShellProps {
  section: ShellSection;
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function AppShell({ section, allowedRoles, children }: AppShellProps) {
  const pathname = usePathname();
  // Onboarding is a focused flow: no sidebar.
  const bare = section === "app" && pathname.startsWith("/onboarding");

  return (
    <ProtectedRoute allowedRoles={allowedRoles} enforceOnboarding={section === "app"}>
      {bare ? (
        <main className="min-h-screen bg-surface">{children}</main>
      ) : (
        <div className="flex min-h-screen bg-surface">
          <Sidebar section={section} />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar section={section} />
            <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
              <div className="mx-auto w-full max-w-[1200px] animate-fade-in">{children}</div>
            </main>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
