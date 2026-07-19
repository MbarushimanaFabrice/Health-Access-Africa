import { apiClient } from "../api-client";
import type { ApiCreateDoctorResult, ApiEnvelope, ApiStats, ApiUser } from "./types";

export interface CreateDoctorInput {
  fullName: string;
  email: string;
  phone?: string;
  district?: string;
  specialty?: string;
  hospital?: string;
  yearsExperience?: number;
  temporaryPassword?: string;
}

export async function createDoctor(input: CreateDoctorInput): Promise<ApiCreateDoctorResult> {
  const res = await apiClient.post<ApiEnvelope<ApiCreateDoctorResult>>("/admin/doctors", input);
  return res.data.data!;
}

export async function getAllUsers(params?: {
  role?: "patient" | "doctor" | "admin";
  isActive?: boolean;
}): Promise<ApiUser[]> {
  const res = await apiClient.get<ApiEnvelope<ApiUser[]>>("/admin/users", { params });
  return res.data.data!;
}

export async function updateUserStatus(id: string, isActive: boolean): Promise<ApiUser> {
  const res = await apiClient.patch<ApiEnvelope<ApiUser>>(`/admin/users/${id}/status`, {
    isActive,
  });
  return res.data.data!;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}

export async function getStats(): Promise<ApiStats> {
  const res = await apiClient.get<ApiEnvelope<ApiStats>>("/admin/stats");
  return res.data.data!;
}
