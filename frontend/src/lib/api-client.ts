import axios, { type AxiosInstance } from "axios";

export const TOKEN_STORAGE_KEY = "haa.token";

const baseURL = "https://healthcare.iduka.store/api";
//  const baseURL = "http://localhost:4441/api"

export const apiClient: AxiosInstance = axios.create({ baseURL });

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Set by AuthProvider so the interceptor can react to session-ending errors
// without importing React state directly into this module.
type AuthEventHandler = (event: "unauthorized" | "password_change_required") => void;
let authEventHandler: AuthEventHandler | null = null;

export function setAuthEventHandler(handler: AuthEventHandler | null) {
  authEventHandler = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const code = error?.response?.data?.code;

    if (status === 401) {
      authEventHandler?.("unauthorized");
    } else if (status === 403 && code === "PASSWORD_CHANGE_REQUIRED") {
      authEventHandler?.("password_change_required");
    }

    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  }
);
