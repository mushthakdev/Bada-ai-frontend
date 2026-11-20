import Link from "next/link";
import { Logo } from "@/components/layout/logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/product" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Create account", href: "/register" },
      { label: "Sign in", href: "/login" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-navy-900 text-navy-300">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo tone="dark" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              AI-powered omnichannel advertising for every Indian business. Plan across TV, social, publishers and local screens — from one platform.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="font-sans text-sm font-semibold tracking-normal text-white">{col.title}</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-navy-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© Bada AI. All rights reserved.</p>
          <p>Delivery metrics in demo environments are simulated and labelled as such.</p>
        </div>
      </div>
    </footer>
  );
}
