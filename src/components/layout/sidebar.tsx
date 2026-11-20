"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NAV_BY_SECTION, type ShellSection } from "@/components/layout/nav-config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarContent({
  section,
  onNavigate,
}: {
  section: ShellSection;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { groups, suffix } = NAV_BY_SECTION[section];
  const homeHref = section === "app" ? "/dashboard" : `/${section}/dashboard`;

  return (
    <div className="flex h-full flex-col border-r border-line bg-white text-navy-900">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo href={homeHref} tone="light" suffix={suffix} />
      </div>

      {section === "app" && (
        <div className="px-4 pb-3 pt-1">
          <Button asChild variant="default" className="w-full justify-center rounded-full">
            <Link href="/campaigns/new" onClick={onNavigate}>
              <Plus /> New campaign
            </Link>
          </Button>
        </div>
      )}

      <nav aria-label="Primary" className="flex-1 space-y-6 overflow-y-auto px-3 py-3">
        {groups.map((group, i) => (
          <div key={group.title ?? i}>
            {group.title && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-navy-400">
                {group.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-brand-50 text-brand-700"
                          : "text-navy-500 hover:bg-surface hover:text-navy-900",
                      )}
                    >
                      <item.icon
                        className={cn("size-[18px] shrink-0", active ? "text-brand-600" : "text-navy-400")}
                        aria-hidden
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <p className="border-t border-line px-5 py-4 text-[11px] leading-relaxed text-navy-400">
        Metrics labelled &ldquo;Simulated&rdquo; are demo data, not live TV delivery.
      </p>
    </div>
  );
}

export function Sidebar({ section }: { section: ShellSection }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 lg:block">
      <SidebarContent section={section} />
    </aside>
  );
}
