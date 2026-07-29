import { apiClient } from "../api-client";
import type { ApiConsultation, ApiEnvelope } from "./types";

export interface SaveConsultationInput {
  notes?: string;
  /** false keeps the notes a private draft; true sends them to the patient. */
  share?: boolean;
}

export async function saveConsultationForAppointment(
  appointmentId: string,
  input: SaveConsultationInput
): Promise<ApiConsultation> {
  const res = await apiClient.put<ApiEnvelope<ApiConsultation>>(
    `/consultations/appointment/${appointmentId}`,
    input
  );
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
