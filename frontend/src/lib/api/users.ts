import { apiClient } from "../api-client";
import type { ApiEnvelope, ApiUser } from "./types";

export interface UpdateMeInput {
  fullName?: string;
  email?: string;
  phone?: string;
  district?: string;
  specialty?: string;
  hospital?: string;
  bio?: string;
  yearsExperience?: number;
}

export async function listUsers(role?: "patient" | "doctor" | "admin"): Promise<ApiUser[]> {
  const res = await apiClient.get<ApiEnvelope<ApiUser[]>>("/users", { params: { role } });
  return res.data.data!;
}

export async function getUserById(id: string): Promise<ApiUser> {
  const res = await apiClient.get<ApiEnvelope<ApiUser>>(`/users/${id}`);
  return res.data.data!;
}

export async function updateMe(input: UpdateMeInput): Promise<ApiUser> {
  const res = await apiClient.patch<ApiEnvelope<ApiUser>>("/users/me", input);
  return res.data.data!;
}
