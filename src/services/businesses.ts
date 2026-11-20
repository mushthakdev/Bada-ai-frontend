import { api } from "@/lib/api";
import { asList } from "@/lib/utils";
import type { Business, BusinessInput, OnboardingPayload } from "@/types";

export const businessService = {
  list: async () => asList<Business>((await api.get<unknown>("/businesses")).data),
  get: async (id: string) => (await api.get<Business>(`/businesses/${id}`)).data,
  create: async (input: BusinessInput) => (await api.post<Business>("/businesses", input)).data,
  update: async (id: string, input: Partial<Business>) =>
    (await api.patch<Business>(`/businesses/${id}`, input)).data,
  onboarding: async (payload: OnboardingPayload) =>
    (await api.post<{ business?: Business } | Business>("/onboarding", payload)).data,
};
