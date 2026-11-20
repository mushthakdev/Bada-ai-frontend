"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { homeForUser } from "@/lib/auth";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/store/auth-store";
import type { UserRole } from "@/types";

export function FullScreenLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface" role="status" aria-label={label}>
      <Loader2 className="size-6 animate-spin text-brand-600" />
    </div>
  );
}

/** Keeps the stored user (role, onboarding flag) fresh. */
function SessionSync() {
  const setUser = useAuthStore((s) => s.setUser);
  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: authService.me,
    staleTime: 60_000,
    retry: false,
  });
  React.useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);
  return null;
}

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  /** Send advertisers who have not finished onboarding to /onboarding. */
  enforceOnboarding?: boolean;
  children: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, enforceOnboarding, children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const authed = Boolean(accessToken && user);
  const roleOk = !allowedRoles || (user ? allowedRoles.includes(user.role) : false);
  const needsOnboarding = Boolean(
    enforceOnboarding && user?.role === "advertiser" && !user.onboarding_completed && !pathname.startsWith("/onboarding"),
  );

  React.useEffect(() => {
    if (!hasHydrated) return;
    if (!authed) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (!roleOk && user) {
      router.replace(homeForUser(user));
    } else if (needsOnboarding) {
      router.replace("/onboarding");
    }
  }, [hasHydrated, authed, roleOk, needsOnboarding, user, pathname, router]);

  if (!hasHydrated || !authed || !roleOk || needsOnboarding) return <FullScreenLoader />;

  return (
    <>
      <SessionSync />
      {children}
    </>
  );
}
