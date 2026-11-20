import { api } from "@/lib/api";
import { asList } from "@/lib/utils";
import type { Business } from "@/types";

export interface Agency {
  id: string;
  name: string;
  status: string;
  white_label_enabled?: boolean;
}

export interface AgencyClient {
  client_id: string;
  status: string;
  business: Business;
}

export interface AgencyInput {
  name: string;
  legal_name?: string;
  website?: string;
  email?: string;
  phone?: string;
  description?: string;
}

export const agencyService = {
  list: async () => asList<Agency>((await api.get<unknown>("/agencies")).data),
  create: async (input: AgencyInput) => (await api.post<Agency>("/agencies", input)).data,
  clients: async (agencyId: string) =>
    asList<AgencyClient>((await api.get<unknown>(`/agencies/${agencyId}/clients`)).data),
  assignClient: (agencyId: string, business_id: string) =>
    api.post<null>(`/agencies/${agencyId}/clients`, { business_id }),
};
