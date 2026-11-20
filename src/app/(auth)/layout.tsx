import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = { robots: { index: false } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="bg-grid-navy relative hidden flex-col justify-between overflow-hidden bg-navy-950 p-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 bottom-0 size-[28rem] rounded-full bg-brand-600/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-10 size-[20rem] rounded-full bg-brand-800/40 blur-3xl"
        />
        <Logo tone="dark" />
        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold leading-[1.1] text-white">
            Every screen.
            <span className="mt-1 block text-accent">Big results.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-navy-300">
            Plan, create and measure campaigns across CTV, YouTube, Meta, publishers and local screens with Bada AI.
          </p>
        </div>
        <p className="relative text-xs text-navy-400">Metrics shown in demo environments are labelled as simulated.</p>
      </aside>
      <main className="flex flex-col bg-white px-6 py-8 sm:px-12">
        <div className="mb-10 lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-6">{children}</div>
        <p className="text-center text-xs text-navy-400">
          <Link href="/" className="hover:text-navy-900">
            ← Back to bada.ai
          </Link>
        </p>
      </main>
    </div>
  );
}
