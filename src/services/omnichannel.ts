import { api } from "@/lib/api";
import { asList } from "@/lib/utils";

export interface MarketplaceChannel {
  code: string;
  name: string;
  category: string;
  description?: string;
  logo_key?: string;
  ad_formats: string[];
  campaign_types: string[];
  targeting_options: string[];
  pricing_model: string;
  estimated_cpm?: number | null;
  minimum_budget: number;
  integration_mode: string;
  integration_status: string;
  is_estimate_pricing: boolean;
  notes?: string | null;
  connection: {
    status: string;
    account_name?: string | null;
    account_id?: string | null;
    last_synced_at?: string | null;
    last_error?: string | null;
  };
  disclaimer?: string;
  capabilities?: {
    objectives: string[];
    ad_formats: string[];
    targeting: string[];
    metrics: string[];
    supports_oauth: boolean;
    supports_auto_launch: boolean;
    min_daily_budget: number;
  } | null;
}

export interface MediaPlanAllocation {
  channel_code: string;
  channel_name: string;
  category?: string;
  allocation_percent: number;
  budget: number;
  estimated_cpm?: number | null;
  estimated_impressions?: number | null;
  integration_mode?: string;
  is_estimate: boolean;
  reason?: string;
}

export interface MediaPlan {
  business_type: string;
  product: string;
  objective: string;
  location: string;
  budget: number;
  duration_days: number;
  allocations: MediaPlanAllocation[];
  strategy_summary: string;
  data_quality: { is_estimate: boolean; label: string };
}

export interface LocalListing {
  id: string;
  title: string;
  inventory_type: string;
  city: string;
  state: string;
  pincode: string;
  price: number;
  estimated_impressions?: number | null;
  status: string;
  is_estimate: boolean;
  disclaimer?: string;
}

export const omnichannelService = {
  channels: async (params: { category?: string; business_id?: string } = {}) =>
    asList<MarketplaceChannel>((await api.get<unknown>("/marketplace/channels", params)).data),

  localListings: async (params: { city?: string; state?: string; pincode?: string } = {}) =>
    asList<LocalListing>((await api.get<unknown>("/marketplace/local", params)).data),

  integrations: async (business_id: string) =>
    asList<MarketplaceChannel>((await api.get<unknown>("/integrations", { business_id })).data),

  connect: async (payload: { business_id: string; channel_code: string; account_name?: string }) =>
    (await api.post<MarketplaceChannel>("/integrations/connect", payload)).data,

  disconnect: async (payload: { business_id: string; channel_code: string }) =>
    (await api.post<MarketplaceChannel>("/integrations/disconnect", payload)).data,

  mediaPlan: async (payload: Record<string, unknown>) =>
    (await api.post<MediaPlan>("/omnichannel/media-plan", payload)).data,

  equalAlloc: async (channel_codes: string[], budget: number) =>
    (
      await api.post<MediaPlanAllocation[]>("/omnichannel/allocations/equal", {
        channel_codes,
        budget,
      })
    ).data,

  createCampaign: async (payload: Record<string, unknown>) =>
    (await api.post<Record<string, unknown>>("/omnichannel/campaigns", payload)).data,

  getCampaign: async (id: string) =>
    (await api.get<Record<string, unknown>>(`/omnichannel/campaigns/${id}`)).data,

  launch: async (id: string) =>
    (await api.post<Record<string, unknown>>(`/omnichannel/campaigns/${id}/launch`)).data,

  control: async (id: string, action: string, channel_code?: string) =>
    (
      await api.post<Record<string, unknown>>(`/omnichannel/campaigns/${id}/control`, {
        action,
        channel_code,
      })
    ).data,

  analytics: async (id: string) =>
    (await api.get<Record<string, unknown>>(`/omnichannel/campaigns/${id}/analytics`)).data,

  creativeFormats: async (creative_id: string, channel_codes?: string[]) =>
    (
      await api.post<{ variants: Array<Record<string, unknown>>; is_mock: boolean; note: string }>(
        "/omnichannel/creatives/formats",
        { creative_id, channel_codes },
      )
    ).data,
};
