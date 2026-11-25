declare global {
  interface Window {
    __BADA_API_URL?: string;
  }
}

/** Resolve API origin: browser runtime config (Cloud Run) → env → localhost. */
export function getApiUrl(): string {
  if (typeof window !== "undefined" && window.__BADA_API_URL) {
    return window.__BADA_API_URL.replace(/\/+$/, "");
  }
  const fromEnv =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://localhost:8000";
  return fromEnv.replace(/\/+$/, "");
}

export function getApiBase(): string {
  return `${getApiUrl()}/api/v1`;
}

/** @deprecated Prefer getApiUrl() — kept for display/fallback after hydration. */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
/** @deprecated Prefer getApiBase() */
export const API_BASE = `${API_URL}/api/v1`;

/** Product name shown in UI copy and document titles */
export const APP_NAME = "Bada AI";
/** Logo wordmark */
export const BRAND_WORDMARK = "Bada AI";
/** In-product AI assistant display name */
export const AGENT_NAME = "Bada Agent";
export const AGENT_VERSION_LABEL = "v1.3 Beta";

export const AUTH_STORAGE_KEY = "bada-auth";

export const DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
] as const;

export const ADVERTISING_OBJECTIVES = [
  { value: "brand_awareness", label: "Build brand awareness" },
  { value: "store_footfall", label: "Drive store footfall" },
  { value: "lead_generation", label: "Generate leads" },
  { value: "product_launch", label: "Launch a product or offer" },
  { value: "event_promotion", label: "Promote an event" },
] as const;

export const BUSINESS_CATEGORIES = [
  "Retail & Kirana",
  "Restaurant & Food",
  "Education & Coaching",
  "Healthcare & Clinics",
  "Real Estate",
  "Jewellery & Fashion",
  "Automobile",
  "Electronics & Appliances",
  "Financial Services",
  "Services & Local Business",
  "Other",
] as const;

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "kn", label: "Kannada" },
  { value: "ml", label: "Malayalam" },
  { value: "mr", label: "Marathi" },
  { value: "bn", label: "Bengali" },
  { value: "gu", label: "Gujarati" },
  { value: "pa", label: "Punjabi" },
] as const;

export const VIDEO_DURATIONS = [15, 30, 45, 60] as const;

export const LEAD_STATUSES = ["new", "contacted", "qualified", "converted", "lost"] as const;

export const CAMPAIGN_STATUSES = [
  "draft",
  "creative_generating",
  "ready_for_review",
  "approved",
  "payment_pending",
  "scheduled",
  "active",
  "paused",
  "completed",
  "rejected",
  "cancelled",
  "failed",
] as const;

export const DEMO_CREDENTIALS = [
  { label: "Admin", email: "admin@bada.ai", password: "Admin@12345" },
  { label: "Advertiser", email: "advertiser@demo.bada.ai", password: "Demo@12345" },
] as const;

export const SUPPORT_EMAIL = "hello@bada.ai";

/** Mirrors the API's request validation (daily/total budget `ge=1000`). Pricing itself always comes from the API. */
export const MIN_BUDGET_INR = 1000;
