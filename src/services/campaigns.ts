import { api } from "@/lib/api";
import { asList } from "@/lib/utils";
import type { Campaign, CampaignInput } from "@/types";

export interface CampaignListParams {
  status?: string;
  search?: string;
  business_id?: string;
}

export const campaignService = {
  list: async (params: CampaignListParams = {}) =>
    asList<Campaign>((await api.get<unknown>("/campaigns", { ...params })).data),
  get: async (id: string) => (await api.get<Campaign>(`/campaigns/${id}`)).data,
  create: async (input: CampaignInput) => (await api.post<Campaign>("/campaigns", input)).data,
  update: async (id: string, input: Partial<CampaignInput>) =>
    (await api.patch<Campaign>(`/campaigns/${id}`, input)).data,
  updateStatus: async (id: string, status: string, reason?: string) =>
    (await api.post<Campaign>(`/campaigns/${id}/status`, { status, reason })).data,
  duplicate: async (id: string) => (await api.post<Campaign>(`/campaigns/${id}/duplicate`)).data,
  estimate: async (payload: { daily_budget: number; total_budget: number; pincodes: string[] }) =>
    (await api.post<import("@/types").BudgetBreakdown>("/campaigns/estimate", payload)).data,
};
