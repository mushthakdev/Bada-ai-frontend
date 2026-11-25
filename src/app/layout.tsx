import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Suspense } from "react";
import { Providers } from "@/components/providers";
import { APP_NAME } from "@/lib/constants";
import "./globals.css";

// Self-hosted variable fonts (DM Sans for UI/body, Instrument Sans for display headings).
const dmSans = localFont({
  src: "../fonts/dm-sans-latin-wght-normal.woff2",
  variable: "--font-dm-sans",
  weight: "100 1000",
  display: "swap",
});

const instrumentSans = localFont({
  src: "../fonts/instrument-sans-latin-wght-normal.woff2",
  variable: "--font-instrument-sans",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Omnichannel advertising for every Indian business`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Create AI-powered ads, plan across TV, social, publishers and local screens, and track every result — all from one platform.",
  applicationName: APP_NAME,
};

export const viewport: Viewport = {
  themeColor: "#0A1628",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${instrumentSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-navy-900">
        {/* Cloud Run entrypoint writes /bada-runtime.js with the live API URL. */}
        <Script src="/bada-runtime.js" strategy="beforeInteractive" />
        <Providers>
          <Suspense fallback={null}>{children}</Suspense>
        </Providers>
      </body>
    </html>
  );
}
