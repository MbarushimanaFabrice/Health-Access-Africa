import { apiClient } from "../api-client";
import type { ApiEnvelope, ApiHealthInfo } from "./types";

export interface CreateHealthInfoInput {
  title: string;
  content: string;
  category?: string;
  status?: "draft" | "published";
}

export interface UpdateHealthInfoInput {
  title?: string;
  content?: string;
  category?: string;
  status?: "draft" | "published";
}

export async function getAllHealthInfo(category?: string): Promise<ApiHealthInfo[]> {
  const res = await apiClient.get<ApiEnvelope<ApiHealthInfo[]>>("/health-info", {
    params: { category },
  });
  return res.data.data!;
}

export async function getHealthInfoById(id: string): Promise<ApiHealthInfo> {
  const res = await apiClient.get<ApiEnvelope<ApiHealthInfo>>(`/health-info/${id}`);
  return res.data.data!;
}

export async function createHealthInfo(input: CreateHealthInfoInput): Promise<ApiHealthInfo> {
  const res = await apiClient.post<ApiEnvelope<ApiHealthInfo>>("/health-info", input);
  return res.data.data!;
}

export async function updateHealthInfo(
  id: string,
  input: UpdateHealthInfoInput
): Promise<ApiHealthInfo> {
  const res = await apiClient.patch<ApiEnvelope<ApiHealthInfo>>(`/health-info/${id}`, input);
  return res.data.data!;
}

export async function deleteHealthInfo(id: string): Promise<void> {
  await apiClient.delete(`/health-info/${id}`);
}
