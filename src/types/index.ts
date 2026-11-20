/* Shared API + domain types. Shapes follow the Bada FastAPI backend schemas. */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown> | null;
}

export interface PageMeta {
  page?: number;
  page_size?: number;
  total?: number;
  [key: string]: unknown;
}

export type UserRole = "advertiser" | "agency" | "agency_member" | "admin" | "super_admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: UserRole;
  is_verified: boolean;
  onboarding_completed: boolean;
  preferred_language: string;
  avatar_url?: string | null;
  created_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResult {
  user: User;
  tokens: TokenPair;
}

/* ---------- Business ---------- */
export interface Business {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country: string;
  logo_url?: string | null;
  brand_tagline?: string | null;
  brand_primary_color?: string | null;
  brand_secondary_color?: string | null;
  advertising_objective?: string | null;
  target_languages?: string | null;
  onboarding_step: number;
  onboarding_completed: boolean;
  is_verified: boolean;
  status: string;
  created_at: string;
}

export interface BusinessInput {
  name: string;
  category: string;
  description?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface OnboardingPayload {
  business: BusinessInput;
  brand?: {
    logo_url?: string;
    brand_tagline?: string;
    brand_primary_color?: string;
    brand_secondary_color?: string;
  };
  advertising_objective?: string;
  audience?: {
    target_city?: string;
    target_state?: string;
    target_pincodes: string[];
    demographics?: string;
    interests?: string;
    languages: string[];
  };
  budget?: {
    daily_budget: number;
    total_budget: number;
    duration_days: number;
  };
  step: number;
}

/* ---------- Campaign ---------- */
export type CampaignStatus =
  | "draft"
  | "creative_generating"
  | "ready_for_review"
  | "approved"
  | "payment_pending"
  | "scheduled"
  | "active"
  | "paused"
  | "completed"
  | "cancelled"
  | "rejected"
  | "failed"
  | (string & {});

export interface BudgetBreakdown {
  daily_budget: number;
  total_budget: number;
  estimated_cpm: number;
  estimated_impressions: number;
  estimated_reach: number;
  media_spend: number;
  platform_fee: number;
  tax_amount: number;
  total_payable: number;
  is_estimate: boolean;
  currency: string;
}

export interface Campaign {
  id: string;
  business_id: string;
  name: string;
  objective: string;
  description?: string | null;
  language: string;
  status: CampaignStatus;
  video_duration: number;
  brief_text?: string | null;
  is_simulated_delivery: boolean;
  created_at: string;
  budget?: BudgetBreakdown | null;
  location_count: number;
  start_date?: string | null;
  end_date?: string | null;
  // Optional expanded relations (returned by the detail endpoint when available)
  locations?: CampaignLocation[];
  audience?: CampaignAudience | null;
  schedule?: CampaignSchedule | null;
  business_name?: string | null;
}

export interface CampaignLocation {
  pincode: string;
  city?: string | null;
  state?: string | null;
  district?: string | null;
}

export interface CampaignAudience {
  demographics?: string | null;
  interests?: string | null;
  languages?: string[] | string | null;
  age_min?: number | null;
  age_max?: number | null;
  gender?: string | null;
}

export interface CampaignSchedule {
  start_date: string;
  end_date: string;
  preferred_slots?: string | null;
  prime_time?: boolean;
  daily_impression_cap?: number | null;
  frequency_cap?: number | null;
}

export interface CampaignInput {
  business_id: string;
  name: string;
  objective: string;
  description?: string;
  language: string;
  video_duration: number;
  brief_text?: string;
  locations: CampaignLocation[];
  audience?: {
    demographics?: string;
    interests?: string;
    languages: string[];
    age_min?: number;
    age_max?: number;
    gender?: string;
  };
  budget?: { daily_budget: number; total_budget: number; duration_days?: number };
  schedule?: {
    start_date: string;
    end_date: string;
    preferred_slots?: string;
    prime_time: boolean;
    daily_impression_cap?: number;
    frequency_cap?: number;
  };
}

/* ---------- Analytics ---------- */
export type DateRange = "today" | "7d" | "30d" | "90d";

export interface TimeseriesPoint {
  date: string;
  impressions?: number;
  leads?: number;
  qr_scans?: number;
  spend?: number;
}

export interface DataQuality {
  is_simulated: boolean;
  label: string;
}

export interface DashboardTotals {
  campaigns?: number;
  active_campaigns?: number;
  completed_campaigns?: number;
  spend?: number;
  impressions?: number;
  estimated_reach?: number;
  qr_scans?: number;
  whatsapp_inquiries?: number;
  phone_calls?: number;
  website_visits?: number;
  leads?: number;
  completed_views?: number;
}

export interface DashboardAnalytics {
  totals: DashboardTotals;
  timeseries: TimeseriesPoint[];
  top_pincodes: Array<{ pincode: string; leads: number }>;
  funnel: Record<string, number>;
  recent_campaigns: Array<{
    id: string;
    name: string;
    status: string;
    objective: string;
    is_simulated_delivery: boolean;
  }>;
  recent_leads: Array<{ id: string; name?: string | null; source?: string | null; status: string; created_at: string }>;
  data_quality: DataQuality;
  range: { start: string; end: string };
  insights?: string[];
}

export interface CampaignAnalytics {
  campaign_id: string;
  campaign_name: string;
  status: string;
  is_simulated_delivery: boolean;
  totals: DashboardTotals;
  video_completion_rate: number;
  cost_per_lead: number | null;
  timeseries: TimeseriesPoint[];
  funnel: Record<string, number>;
  data_quality: DataQuality;
}

/* ---------- Leads ---------- */
export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost" | (string & {});

export interface Lead {
  id: string;
  business_id?: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  inquiry?: string | null;
  source?: string | null;
  pincode?: string | null;
  campaign_id?: string | null;
  campaign_name?: string | null;
  status: LeadStatus;
  notes?: string | null;
  is_simulated?: boolean;
  created_at: string;
}

/* ---------- Payments ---------- */
export interface Payment {
  id: string;
  campaign_id?: string | null;
  campaign_name?: string | null;
  amount: number;
  currency: string;
  status: string;
  method?: string | null;
  provider?: string | null;
  is_mock: boolean;
  invoice_number?: string | null;
  created_at: string;
}

export interface CheckoutSession {
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
  is_mock: boolean;
  checkout_url?: string | null;
  provider_order_id?: string | null;
}

export interface BillingSummary {
  total_spend?: number;
  outstanding?: number;
  currency?: string;
  is_mock?: boolean;
  invoices: Payment[];
}

/* ---------- AI Studio ---------- */
export interface AiBriefInput {
  campaign_id: string;
  brief_text: string;
  offer?: string;
  call_to_action?: string;
  tone?: string;
  language?: string;
}

export interface AiBrief extends AiBriefInput {
  id: string;
  is_mock?: boolean;
}

export interface AiScene {
  order?: number;
  title?: string;
  visual?: string;
  voiceover?: string;
  duration_seconds?: number;
}

export interface AiPlan {
  id: string;
  campaign_id: string;
  concept?: string | null;
  headline?: string | null;
  call_to_action?: string | null;
  tone?: string | null;
  scenes: AiScene[];
  voiceover_script?: string | null;
  is_mock?: boolean;
}

export type GenerationStatus = "queued" | "processing" | "completed" | "failed" | (string & {});

export interface AiGeneration {
  id: string;
  campaign_id: string;
  plan_id?: string | null;
  status: GenerationStatus;
  progress?: number | null;
  error_message?: string | null;
  is_mock: boolean;
  creative_id?: string | null;
  video_url?: string | null;
  thumbnail_url?: string | null;
  created_at?: string;
}

export interface CreativeScene {
  id: string;
  order_index: number;
  title: string;
  description?: string | null;
  duration_seconds: number;
  text_overlay?: string | null;
  media_url?: string | null;
  media_type?: string;
  voiceover_text?: string | null;
}

export interface Creative {
  id: string;
  business_id?: string;
  campaign_id?: string | null;
  campaign_name?: string | null;
  title: string;
  language?: string;
  headline?: string | null;
  call_to_action?: string | null;
  cta_text?: string | null;
  script?: string | null;
  voiceover_script?: string | null;
  brand_color?: string | null;
  show_qr?: boolean;
  status: string;
  generation_mode?: string;
  approval_status?: string;
  music_track?: string | null;
  preview_url?: string | null;
  video_url?: string | null;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
  is_mock: boolean;
  scenes?: CreativeScene[];
  created_at?: string;
}

export interface AssistantReply {
  reply: string;
  is_mock?: boolean;
}

/* ---------- Misc ---------- */
export interface AppNotification {
  id: string;
  title: string;
  message?: string | null;
  type?: string | null;
  is_read: boolean;
  entity_type?: string | null;
  entity_id?: string | null;
  created_at: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  original_filename?: string;
  content_type?: string;
  file_size?: number;
  public_url: string;
  media_type?: string;
  category?: string | null;
}

export interface PricingPlan {
  id: string;
  name: string;
  description?: string | null;
  price_label?: string | null;
  price?: number | null;
  currency?: string;
  billing_period?: string | null;
  features: string[];
  highlighted?: boolean;
  cta_label?: string | null;
}

export interface PricingInfo {
  plans: PricingPlan[];
  notes?: string[];
  is_mock?: boolean;
}

export type Row = Record<string, unknown>;
