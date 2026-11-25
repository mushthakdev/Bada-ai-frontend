import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  logoKey?: string | null;
  code?: string;
  className?: string;
  size?: number;
};

/** Recognisable brand marks for marketplace / integration channel cards. */
export function ChannelBrandIcon({ logoKey, code, className, size = 40 }: Props) {
  const key = (logoKey || code || "default").toLowerCase();
  const meta = BRANDS[key] ?? BRANDS[ALIAS[key] ?? ""] ?? BRANDS.default;
  const s = size;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-black/5",
        className,
      )}
      style={{ width: s, height: s, background: meta.bg }}
      aria-hidden
      title={meta.label}
    >
      <svg viewBox="0 0 40 40" width={s * 0.62} height={s * 0.62} fill="none">
        {meta.svg}
      </svg>
    </span>
  );
}

const ALIAS: Record<string, string> = {
  facebook: "meta",
  instagram: "meta",
  hotstar: "jiohotstar",
  disney_hotstar: "jiohotstar",
  jio_cinema: "jiohotstar",
  jiocinema: "jiohotstar",
  sony_liv: "sonyliv",
  "sony-liv": "sonyliv",
  prime: "amazon_prime",
  prime_video: "amazon_prime",
  amazon: "amazon_prime",
  mxplayer: "mx_player",
  "mx-player": "mx_player",
  local: "local_screens",
};

type BrandMeta = {
  label: string;
  bg: string;
  svg: ReactNode;
};

const BRANDS: Record<string, BrandMeta> = {
  meta: {
    label: "Meta",
    bg: "linear-gradient(145deg, #0668E1 0%, #0695FF 100%)",
    svg: (
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M8.2 20c0-3.2 2.1-5.8 5.4-5.8 1.6 0 2.9.6 4.1 2.1L20 19l2.3-2.7c1.2-1.5 2.5-2.1 4.1-2.1 3.3 0 5.4 2.6 5.4 5.8s-2.1 5.8-5.4 5.8c-1.6 0-2.9-.6-4.1-2.1L20 21l-2.3 2.7c-1.2 1.5-2.5 2.1-4.1 2.1-3.3 0-5.4-2.6-5.4-5.8Zm5.4-3.5c-1.9 0-3.1 1.5-3.1 3.5s1.2 3.5 3.1 3.5c.8 0 1.5-.3 2.3-1.2L18.2 20l-2.3-2.7c-.8-.9-1.5-1.2-2.3-1.2Zm13 0c-.8 0-1.5.3-2.3 1.2L21.8 20l2.3 2.7c.8.9 1.5 1.2 2.3 1.2 1.9 0 3.1-1.5 3.1-3.5s-1.2-3.5-3.1-3.5Z"
      />
    ),
  },
  youtube: {
    label: "YouTube",
    bg: "#FF0000",
    svg: (
      <>
        <rect x="4" y="10" width="32" height="20" rx="6" fill="#fff" fillOpacity="0.15" />
        <path fill="#fff" d="M16.5 14.5v11l10-5.5-10-5.5Z" />
      </>
    ),
  },
  ctv: {
    label: "Connected TV",
    bg: "linear-gradient(145deg, #1e293b 0%, #334155 100%)",
    svg: (
      <>
        <rect x="6" y="9" width="28" height="18" rx="2.5" stroke="#fff" strokeWidth="2" />
        <path stroke="#fff" strokeWidth="2" strokeLinecap="round" d="M14 31h12M20 27v4" />
        <circle cx="20" cy="18" r="3" fill="#38bdf8" />
      </>
    ),
  },
  ott: {
    label: "OTT Streaming",
    bg: "linear-gradient(145deg, #7c3aed 0%, #a855f7 100%)",
    svg: (
      <>
        <rect x="5" y="11" width="30" height="18" rx="3" fill="#fff" fillOpacity="0.2" />
        <path fill="#fff" d="M16 16.5v9l9-4.5-9-4.5Z" />
      </>
    ),
  },
  jiohotstar: {
    label: "JioHotstar",
    bg: "linear-gradient(145deg, #0b1d4a 0%, #1a3a8f 55%, #e85d04 100%)",
    svg: (
      <>
        <path
          fill="#fff"
          d="M10 12h4.2c3.4 0 5.5 1.9 5.5 4.8 0 3-2.1 4.9-5.5 4.9H12.6V28H10V12Zm2.6 2.3v5.1h1.5c1.9 0 3-.9 3-2.55s-1.1-2.55-3-2.55h-1.5Z"
        />
        <path fill="#ff6b00" d="M22.5 12h2.5l5.5 16h-2.7l-1.1-3.3h-5.9L19.7 28h-2.7l5.5-16Zm1.2 4.1-2.1 6.3h4.2l-2.1-6.3Z" />
      </>
    ),
  },
  sonyliv: {
    label: "Sony LIV",
    bg: "linear-gradient(145deg, #000000 0%, #1a1a2e 100%)",
    svg: (
      <>
        <rect x="6" y="10" width="28" height="20" rx="4" fill="#0054A6" />
        <text
          x="20"
          y="24"
          textAnchor="middle"
          fill="#fff"
          fontSize="9"
          fontWeight="700"
          fontFamily="system-ui,sans-serif"
        >
          LIV
        </text>
      </>
    ),
  },
  zee5: {
    label: "ZEE5",
    bg: "linear-gradient(145deg, #8230c6 0%, #a855f7 100%)",
    svg: (
      <text
        x="20"
        y="25"
        textAnchor="middle"
        fill="#fff"
        fontSize="11"
        fontWeight="800"
        fontFamily="system-ui,sans-serif"
        letterSpacing="-0.5"
      >
        ZEE5
      </text>
    ),
  },
  amazon_prime: {
    label: "Amazon Prime Video",
    bg: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
    svg: (
      <>
        <path
          fill="#00A8E1"
          d="M8 22c4 3.2 10.5 5 16.5 5 4.2 0 7.5-.9 9.5-2.1-.4.1-.8.2-1.3.2-5.8 0-10.7-2.1-14.2-5.1-.5-.4-.2-1 .4-.7 3.7 2.5 8.2 4 12.9 4 2.1 0 4-.4 5.4-1.1.6-.3 1.2.3.7.8-2 2-5.5 3.1-9.5 3.1C19 25.1 12 23 8 20.2c-.5-.4-.1-1 .4-.7.1 0 .2.1.3.1"
        />
        <path fill="#fff" d="M14 12h2.2l2.4 6.2L21 12h2.2l-3.6 9h-2.3L14 12Zm10.5 0H30c1.8 0 3 1 3 2.6 0 1.3-.7 2.2-1.9 2.5L33 21h-2.4l-1.7-3.6h-1.9V21h-2.5V12Zm2.5 2v2.2H29c.8 0 1.2-.4 1.2-1.1S29.8 14 29 14h-2Z" />
      </>
    ),
  },
  mx_player: {
    label: "MX Player",
    bg: "linear-gradient(145deg, #1d4ed8 0%, #2563eb 100%)",
    svg: (
      <>
        <path fill="#fff" d="M8 12h3.2l3.3 8.5L18 12h3.2v16H18.5V16.8L15.4 28h-2.3l-3.1-11.2V28H8V12Z" />
        <path fill="#F97316" d="M24 14.5v11l9-5.5-9-5.5Z" />
      </>
    ),
  },
  netflix: {
    label: "Netflix",
    bg: "#141414",
    svg: (
      <path
        fill="#E50914"
        d="M12 8h4.2l5.6 16.2V8H26v24h-4.2L16.2 15.8V32H12V8Z"
      />
    ),
  },
  aha: {
    label: "aha",
    bg: "linear-gradient(145deg, #ea580c 0%, #f97316 100%)",
    svg: (
      <text
        x="20"
        y="25"
        textAnchor="middle"
        fill="#fff"
        fontSize="14"
        fontWeight="800"
        fontFamily="system-ui,sans-serif"
      >
        aha
      </text>
    ),
  },
  sunnxt: {
    label: "Sun NXT",
    bg: "linear-gradient(145deg, #b45309 0%, #f59e0b 100%)",
    svg: (
      <>
        <circle cx="20" cy="18" r="8" fill="#fff" fillOpacity="0.2" />
        <path fill="#fff" d="M14 22c2.5 3 9.5 3 12 0-1.5 4-10.5 4-12 0Z" />
        <circle cx="20" cy="16" r="3.5" fill="#fff" />
      </>
    ),
  },
  publishers: {
    label: "Digital Publishers",
    bg: "linear-gradient(145deg, #0f766e 0%, #14b8a6 100%)",
    svg: (
      <>
        <rect x="9" y="8" width="22" height="24" rx="2" stroke="#fff" strokeWidth="2" />
        <path stroke="#fff" strokeWidth="2" strokeLinecap="round" d="M14 14h12M14 19h12M14 24h8" />
      </>
    ),
  },
  local_screens: {
    label: "Local Digital Screens",
    bg: "linear-gradient(145deg, #0369a1 0%, #0ea5e9 100%)",
    svg: (
      <>
        <rect x="7" y="10" width="26" height="16" rx="2" stroke="#fff" strokeWidth="2" />
        <path stroke="#fff" strokeWidth="2" strokeLinecap="round" d="M15 30h10M20 26v4" />
        <rect x="11" y="14" width="8" height="5" rx="0.5" fill="#fff" fillOpacity="0.5" />
      </>
    ),
  },
  outdoor: {
    label: "Outdoor & Transit",
    bg: "linear-gradient(145deg, #b45309 0%, #d97706 100%)",
    svg: (
      <>
        <rect x="8" y="8" width="24" height="14" rx="1.5" stroke="#fff" strokeWidth="2" />
        <path stroke="#fff" strokeWidth="2" strokeLinecap="round" d="M20 22v8M14 30h12" />
        <path fill="#fff" fillOpacity="0.4" d="M11 11h18v8H11z" />
      </>
    ),
  },
  default: {
    label: "Channel",
    bg: "linear-gradient(145deg, #5b5cf2 0%, #4a45d4 100%)",
    svg: (
      <path
        fill="#fff"
        d="M20 10a8 8 0 0 1 8 8c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 8-8Zm0 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"
      />
    ),
  },
};
