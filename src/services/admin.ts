import { api } from "@/lib/api";
import { asList } from "@/lib/utils";
import type { Row } from "@/types";

export type AdminResource =
  | "users"
  | "businesses"
  | "agencies"
  | "campaigns"
  | "approvals"
  | "publishers"
  | "inventory"
  | "pricing"
  | "payments"
  | "ai-logs"
  | "settings";

/** Frontend resource → real API path. The API returns plain (unpaginated) lists. */
const RESOURCE_PATHS: Record<AdminResource, string> = {
  users: "/admin/users",
  businesses: "/businesses",
  agencies: "/agencies",
  campaigns: "/admin/campaigns",
  approvals: "/admin/creatives/pending",
  publishers: "/admin/publishers",
  inventory: "/admin/inventory",
  pricing: "/admin/settings",
  payments: "/admin/payments",
  "ai-logs": "/admin/ai/logs",
  settings: "/admin/settings",
};

export interface AdminDashboardStats {
  users: number;
  businesses: number;
  agencies: number;
  campaigns: number;
  active_campaigns: number;
  payments: number;
  revenue: number;
  leads: number;
  ai_generations: number;
}

export const adminService = {
  dashboard: async () => (await api.get<AdminDashboardStats>("/admin/dashboard")).data,

  list: async (resource: AdminResource): Promise<Row[]> => {
    const rows = asList<Row>((await api.get<unknown>(RESOURCE_PATHS[resource])).data);
    if (resource === "pricing") {
      // Pricing parameters live in system settings.
      return rows.filter((r) => /pricing|cpm|fee|tax|rate/i.test(`${r.key ?? ""} ${r.category ?? ""}`));
    }
    return rows;
  },

  decideCreative: (id: string, approval_status: "approved" | "rejected", notes?: string) =>
    api.post<{ id: string; approval_status: string }>(`/admin/creatives/${id}/approval`, { approval_status, notes }),

  updateSetting: (key: string, value: string, description?: string) =>
    api.put<{ key: string; value: string }>(`/admin/settings/${encodeURIComponent(key)}`, { value, description }),
};
