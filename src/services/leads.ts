import { api } from "@/lib/api";
import { asList } from "@/lib/utils";
import type { Lead } from "@/types";

export const leadService = {
  list: async (params: {
    status?: string;
    campaign_id?: string;
    business_id?: string;
    source?: string;
    search?: string;
  } = {}) => asList<Lead>((await api.get<unknown>("/leads", { ...params })).data),

  update: async (id: string, payload: { status?: string; notes?: string }) =>
    (await api.patch<Lead>(`/leads/${id}`, payload)).data,
};
