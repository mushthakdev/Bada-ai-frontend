import Link from "next/link";
import {
  ArrowRight,
  Clapperboard,
  MonitorPlay,
  Newspaper,
  Radio,
  Share2,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CHANNELS = [
  { name: "Connected TV", icon: MonitorPlay, tone: "bg-brand-600/90" },
  { name: "YouTube", icon: Clapperboard, tone: "bg-red-500/90" },
  { name: "Meta", icon: Share2, tone: "bg-sky-500/90" },
  { name: "Publishers", icon: Newspaper, tone: "bg-violet-500/90" },
  { name: "Local screens", icon: Store, tone: "bg-emerald-500/90" },
  { name: "OTT & outdoor", icon: Radio, tone: "bg-amber-500/90" },
];

const MAP_TILES = Array.from({ length: 42 }, (_, i) => i);
const HIGHLIGHT = new Set([8, 9, 10, 15, 16, 17, 22, 23, 29, 30, 31]);

/** Omnichannel marketplace preview — platforms + local targeting. */
export function HeroVisual({ className }: { className?: string }) {
  return (
    <div className={cn("relative select-none", className)} aria-hidden>
      <div className="relative mx-auto w-full max-w-[640px]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-navy-400">One campaign</p>
              <p className="mt-0.5 text-sm font-semibold text-white">All platforms</p>
            </div>
            <span className="rounded-full border border-brand-400/40 bg-brand-600/20 px-2.5 py-1 text-[11px] font-medium text-brand-200">
              Omnichannel
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {CHANNELS.map((ch) => (
              <div
                key={ch.name}
                className="rounded-xl border border-white/10 bg-navy-950/50 p-3"
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg text-white",
                    ch.tone,
                  )}
                >
                  <ch.icon className="size-4" />
                </span>
                <p className="mt-2.5 text-xs font-semibold text-white">{ch.name}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[62%] rounded-full bg-brand-400/80" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-navy-200">Budget ₹20,000</span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-navy-200">Kochi · 682016</span>
            <span className="rounded-full bg-brand-600/30 px-2.5 py-1 text-[11px] text-brand-100">
              AI media plan
            </span>
          </div>
        </div>

        <div className="relative mx-auto mt-5 w-full max-w-[640px] [perspective:900px]">
          <div className="origin-top [transform:rotateX(52deg)] rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="grid grid-cols-7 gap-1.5">
              {MAP_TILES.map((i) => (
                <div
                  key={i}
                  className={cn(
                    "aspect-[4/3] rounded-[5px] border",
                    HIGHLIGHT.has(i)
                      ? "border-brand-400 bg-brand-600/70"
                      : "border-white/10 bg-white/[0.04]",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-navy-400">
          Illustrative preview — not live inventory or delivery data
        </p>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="bg-grid-navy relative overflow-hidden bg-navy-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-[-20%] size-[42rem] rounded-full bg-brand-600/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-30%] left-[-10%] size-[36rem] rounded-full bg-brand-800/40 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-navy-300">
            <span className="size-1.5 rounded-full bg-accent" />
            AI-powered omnichannel advertising
          </p>
          <h1 className="text-[40px] font-semibold leading-[1.05] text-white sm:text-5xl lg:text-[64px]">
            Every screen.
            <span className="mt-1 block text-accent">Big results.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-300 sm:text-xl">
            Create one campaign in Bada AI. Plan, buy and measure across Connected TV, OTT, YouTube, Meta,
            publishers, local screens and outdoor.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="default">
              <Link href="/register">
                Get started <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outlineDark">
              <Link href="/marketplace">Explore platforms</Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-xs text-navy-400 sm:text-sm">
            {["CTV & OTT", "YouTube", "Facebook & Instagram", "Publishers", "Local screens", "Outdoor"].map(
              (label) => (
                <li key={label} className="flex items-center gap-1.5">
                  <span className="size-1 rounded-full bg-brand-400" />
                  {label}
                </li>
              ),
            )}
          </ul>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}
