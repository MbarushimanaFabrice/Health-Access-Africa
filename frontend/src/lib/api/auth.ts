import { apiClient } from "../api-client";
import type { ApiEnvelope, ApiLoginResult, ApiRegisterResult, ApiUser } from "./types";

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  district?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export async function register(input: RegisterInput): Promise<ApiRegisterResult> {
  const res = await apiClient.post<ApiEnvelope<ApiRegisterResult>>("/auth/register", input);
  return res.data.data!;
}

export async function login(input: LoginInput): Promise<ApiLoginResult> {
  const res = await apiClient.post<ApiEnvelope<ApiLoginResult>>("/auth/login", input);
  return res.data.data!;
}

export async function changePassword(input: ChangePasswordInput): Promise<{ token: string }> {
  const res = await apiClient.post<ApiEnvelope<{ token: string }>>("/auth/change-password", input);
  return res.data.data!;
}

export async function getMe(): Promise<ApiUser> {
  const res = await apiClient.get<ApiEnvelope<ApiUser>>("/auth/me");
  return res.data.data!;
}
