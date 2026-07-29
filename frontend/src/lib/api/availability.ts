import { apiClient } from "../api-client";
import type { ApiAvailabilitySlot, ApiCreateSlotsResult, ApiEnvelope } from "./types";

export interface CreateSlotsInput {
  dates: string[];
  times: string[];
}

export async function createSlots(input: CreateSlotsInput): Promise<ApiCreateSlotsResult> {
  const res = await apiClient.post<ApiEnvelope<ApiCreateSlotsResult>>("/availability", input);
  return res.data.data!;
}

export async function getMySlots(): Promise<ApiAvailabilitySlot[]> {
  const res = await apiClient.get<ApiEnvelope<ApiAvailabilitySlot[]>>("/availability/me");
  return res.data.data!;
}

export async function getDoctorSlots(doctorId: string): Promise<ApiAvailabilitySlot[]> {
  const res = await apiClient.get<ApiEnvelope<ApiAvailabilitySlot[]>>(
    `/availability/doctor/${doctorId}`
  );
  return res.data.data!;
}

export async function deleteSlot(id: string): Promise<void> {
  await apiClient.delete(`/availability/${id}`);
}
