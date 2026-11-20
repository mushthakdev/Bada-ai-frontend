import { api } from "@/lib/api";
import type { PricingInfo } from "@/types";

export const marketingService = {
  pricing: async () => (await api.get<PricingInfo>("/pricing", undefined, { auth: false })).data,
  contact: (input: { name: string; email: string; phone?: string; message: string }) =>
    api.post<null>("/contact", input, { auth: false }),
};
