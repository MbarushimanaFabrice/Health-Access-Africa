import { apiClient } from "../api-client";
import type { ApiEnvelope, ApiNotification } from "./types";

export async function getMyNotifications(): Promise<ApiNotification[]> {
  const res = await apiClient.get<ApiEnvelope<ApiNotification[]>>("/notifications/me");
  return res.data.data!;
}

export async function markNotificationRead(id: string): Promise<ApiNotification> {
  const res = await apiClient.patch<ApiEnvelope<ApiNotification>>(`/notifications/${id}/read`);
  return res.data.data!;
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch("/notifications/read-all");
}
