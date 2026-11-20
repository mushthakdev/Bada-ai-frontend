import { api } from "@/lib/api";
import { asList } from "@/lib/utils";
import type { AppNotification } from "@/types";

export const notificationService = {
  list: async () => asList<AppNotification>((await api.get<unknown>("/notifications")).data),
  markRead: (id: string) => api.post<null>(`/notifications/${id}/read`),
  markAllRead: () => api.post<null>("/notifications/read-all"),
};
