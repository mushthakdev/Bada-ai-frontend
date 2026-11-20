import type { User, UserRole } from "@/types";

export const ADMIN_ROLES: UserRole[] = ["admin", "super_admin"];
export const AGENCY_ROLES: UserRole[] = ["agency", "agency_member"];

export function isAdmin(role?: string | null) {
  return role === "admin" || role === "super_admin";
}

export function isAgency(role?: string | null) {
  return role === "agency" || role === "agency_member";
}

/** Where a user lands after login / when they hit a section they cannot access. */
export function homeForUser(user: Pick<User, "role" | "onboarding_completed">): string {
  if (isAdmin(user.role)) return "/admin/dashboard";
  if (isAgency(user.role)) return "/agency/dashboard";
  return user.onboarding_completed ? "/dashboard" : "/onboarding";
}

/** Only allow same-origin relative redirects. */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}
