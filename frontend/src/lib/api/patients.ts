import { apiClient } from "../api-client";
import type { ApiEnvelope, ApiUser } from "./types";

export interface UpdatePatientProfileInput {
  dateOfBirth?: string;
  gender?: string;
  allergies?: string;
  chronicConditions?: string;
  notes?: string;
  fullName?: string;
  phone?: string;
  district?: string;
}

export async function getPatientById(id: string): Promise<ApiUser> {
  const res = await apiClient.get<ApiEnvelope<ApiUser>>(`/patients/${id}`);
  return res.data.data!;
}

export async function updatePatientProfile(
  id: string,
  input: UpdatePatientProfileInput
): Promise<ApiUser> {
  const res = await apiClient.patch<ApiEnvelope<ApiUser>>(`/patients/${id}`, input);
  return res.data.data!;
}
