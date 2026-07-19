import { apiClient } from "../api-client";
import type { ApiAppointment, ApiEnvelope } from "./types";

export interface CreateAppointmentInput {
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
}

export type AppointmentStatusInput = "confirmed" | "cancelled" | "completed";

export async function createAppointment(input: CreateAppointmentInput): Promise<ApiAppointment> {
  const res = await apiClient.post<ApiEnvelope<ApiAppointment>>("/appointments", input);
  return res.data.data!;
}

export async function getMyAppointments(): Promise<ApiAppointment[]> {
  const res = await apiClient.get<ApiEnvelope<ApiAppointment[]>>("/appointments/me");
  return res.data.data!;
}

export async function getAllAppointments(status?: string): Promise<ApiAppointment[]> {
  const res = await apiClient.get<ApiEnvelope<ApiAppointment[]>>("/admin/appointments", {
    params: { status },
  });
  return res.data.data!;
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatusInput
): Promise<ApiAppointment> {
  const res = await apiClient.patch<ApiEnvelope<ApiAppointment>>(`/appointments/${id}/status`, {
    status,
  });
  return res.data.data!;
}

export async function deleteAppointment(id: string): Promise<void> {
  await apiClient.delete(`/appointments/${id}`);
}
