"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bell, LogOut, Settings, Sparkles, User as UserIcon, X } from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { ShellSection } from "@/components/layout/nav-config";
import { Avatar } from "@/components/ui/misc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { isAgency } from "@/lib/auth";
import { AGENT_NAME } from "@/lib/constants";
import { cn, humanize } from "@/lib/utils";
import { notificationService } from "@/services/notifications";

export function Topbar({ section }: { section: ShellSection }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.list,
    refetchInterval: 60_000,
    retry: false,
  });
  const unread = data?.filter((n) => !n.is_read).length ?? 0;
  const agency = isAgency(user?.role);
  const profileHref = agency ? "/agency/settings" : "/profile";
  const settingsHref = agency ? "/agency/settings" : section === "admin" ? "/admin/settings" : "/settings";
  const agentOpen = section === "app" && pathname.startsWith("/assistant");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <MobileNav section={section} />
      <div className="flex-1" />

      {section === "app" && (
        <>
          <Link
            href="/notifications"
            className="relative rounded-full p-2 text-navy-500 transition-colors hover:bg-surface hover:text-navy-900"
            aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          >
            <Bell className="size-5" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>

          <Link
            href={agentOpen ? "/dashboard" : "/assistant"}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors",
              agentOpen
                ? "bg-brand-600 text-white shadow-soft"
                : "border border-line-strong bg-white text-navy-800 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700",
            )}
            aria-label={agentOpen ? `Close ${AGENT_NAME}` : `Ask ${AGENT_NAME}`}
            aria-current={agentOpen ? "page" : undefined}
          >
            {agentOpen ? <X className="size-3.5" /> : <Sparkles className="size-3.5 text-brand-600" />}
            Ask {AGENT_NAME}
          </Link>
        </>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2.5 rounded-full p-1 pr-2 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            aria-label="Account menu"
          >
            <Avatar name={user?.full_name} src={user?.avatar_url} />
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight text-navy-900">{user?.full_name}</span>
              <span className="block text-xs leading-tight text-navy-400">{humanize(user?.role)}</span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel>
            <span className="block truncate font-medium text-navy-900">{user?.email}</span>
            <Badge variant="brand" className="mt-1.5">
              {humanize(user?.role)}
            </Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={profileHref}>
              <UserIcon /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={settingsHref}>
              <Settings /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void logout()}>
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
