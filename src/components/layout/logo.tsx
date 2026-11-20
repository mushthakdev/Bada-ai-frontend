import Link from "next/link";
import { APP_NAME, BRAND_WORDMARK } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-brand-600 font-display text-[17px] font-bold leading-none text-white",
        className,
      )}
    >
      b
    </span>
  );
}

export function Logo({
  href = "/",
  tone = "light",
  suffix,
  className,
}: {
  href?: string;
  tone?: "light" | "dark";
  suffix?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label={`${APP_NAME} home`}
    >
      <LogoMark />
      <span
        className={cn(
          "font-display text-xl font-bold tracking-tight",
          tone === "light" ? "text-navy-900" : "text-white",
        )}
      >
        {BRAND_WORDMARK}
      </span>
      {suffix && (
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            tone === "light" ? "bg-brand-50 text-brand-700" : "bg-white/10 text-white/80",
          )}
        >
          {suffix}
        </span>
      )}
    </Link>
  );
}
