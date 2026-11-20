"use client";

import { useQuery } from "@tanstack/react-query";
import { businessService } from "@/services/businesses";
import { campaignService, type CampaignListParams } from "@/services/campaigns";
import { analyticsService } from "@/services/analytics";
import type { DateRange } from "@/types";

export const queryKeys = {
  businesses: ["businesses"] as const,
  business: (id: string) => ["businesses", id] as const,
  campaigns: (params?: CampaignListParams) => ["campaigns", params ?? {}] as const,
  campaign: (id: string) => ["campaign", id] as const,
  dashboard: (range: DateRange) => ["analytics", "dashboard", range] as const,
  campaignAnalytics: (id: string) => ["analytics", "campaign", id] as const,
  leads: (params: object) => ["leads", params] as const,
  payments: ["payments"] as const,
  billing: ["billing"] as const,
  creatives: (campaignId?: string) => ["creatives", campaignId ?? "all"] as const,
  creative: (id: string) => ["creative", id] as const,
  notifications: ["notifications"] as const,
};

export const useBusinesses = () =>
  useQuery({ queryKey: queryKeys.businesses, queryFn: () => businessService.list() });

export const useBusiness = (id: string) =>
  useQuery({ queryKey: queryKeys.business(id), queryFn: () => businessService.get(id), enabled: Boolean(id) });

export const useCampaigns = (params: CampaignListParams = {}) =>
  useQuery({ queryKey: queryKeys.campaigns(params), queryFn: () => campaignService.list(params) });

export const useCampaign = (id: string) =>
  useQuery({ queryKey: queryKeys.campaign(id), queryFn: () => campaignService.get(id), enabled: Boolean(id) });

export const useDashboard = (range: DateRange) =>
  useQuery({ queryKey: queryKeys.dashboard(range), queryFn: () => analyticsService.dashboard(range) });

export const useCampaignAnalytics = (id: string) =>
  useQuery({
    queryKey: queryKeys.campaignAnalytics(id),
    queryFn: () => analyticsService.campaign(id),
    enabled: Boolean(id),
  });
