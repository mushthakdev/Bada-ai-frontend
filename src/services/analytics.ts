import { api } from "@/lib/api";
import type { CampaignAnalytics, DashboardAnalytics, DateRange } from "@/types";

export const analyticsService = {
  dashboard: async (range: DateRange, business_id?: string) =>
    (await api.get<DashboardAnalytics>("/analytics/dashboard", { range, business_id })).data,
  campaign: async (id: string) => (await api.get<CampaignAnalytics>(`/analytics/campaigns/${id}`)).data,
};
