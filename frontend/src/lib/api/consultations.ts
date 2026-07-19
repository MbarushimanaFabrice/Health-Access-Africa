import { apiClient } from "../api-client";
import type { ApiConsultation, ApiEnvelope } from "./types";

export interface CreateConsultationInput {
  appointmentId: string;
  notes?: string;
  status?: "not_started" | "in_progress" | "completed";
}

export interface UpdateConsultationInput {
  notes?: string;
  status?: "not_started" | "in_progress" | "completed";
}

export async function createConsultation(input: CreateConsultationInput): Promise<ApiConsultation> {
  const res = await apiClient.post<ApiEnvelope<ApiConsultation>>("/consultations", input);
  return res.data.data!;
}

export async function updateConsultation(
  id: string,
  input: UpdateConsultationInput
): Promise<ApiConsultation> {
  const res = await apiClient.patch<ApiEnvelope<ApiConsultation>>(`/consultations/${id}`, input);
  return res.data.data!;
}

export async function getMyConsultations(): Promise<ApiConsultation[]> {
  const res = await apiClient.get<ApiEnvelope<ApiConsultation[]>>("/consultations/me");
  return res.data.data!;
}

export async function getConsultationByAppointment(appointmentId: string): Promise<ApiConsultation> {
  const res = await apiClient.get<ApiEnvelope<ApiConsultation>>(`/consultations/${appointmentId}`);
  return res.data.data!;
}

export async function getOrCreateVideoRoom(appointmentId: string): Promise<ApiConsultation> {
  const res = await apiClient.post<ApiEnvelope<ApiConsultation>>(
    `/consultations/${appointmentId}/video`
  );
  return res.data.data!;
}
