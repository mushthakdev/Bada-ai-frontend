"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { homeForUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const MARKETING_LINKS = [
  { label: "Product", href: "/product" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
] as const;

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);
  const loggedIn = Boolean(user && token);

  // Close the mobile menu after navigation.
  const [lastPath, setLastPath] = React.useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {MARKETING_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-brand-700",
                pathname === l.href ? "text-brand-700" : "text-navy-600",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loggedIn && user ? (
            <Button asChild>
              <Link href={homeForUser(user)}>Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Create your first ad</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-navy-700 hover:bg-surface md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-white px-5 pb-5 pt-3 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {MARKETING_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-md px-2 py-3 text-base font-medium text-navy-800 hover:bg-surface">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 grid gap-2">
            {loggedIn && user ? (
              <Button asChild>
                <Link href={homeForUser(user)}>Open dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild>
                  <Link href="/register">Create your first ad</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/login">Sign in</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
