import axios, { type AxiosRequestConfig, type AxiosRequestHeaders, type InternalAxiosRequestConfig } from "axios";
import { getToken } from "../auth/auth.store";

const normalizeApiBaseUrl = (value: string | undefined) => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return undefined;
  }

  return trimmedValue.endsWith("/") ? trimmedValue.slice(0, -1) : trimmedValue;
};

const API_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

export type AuthAxiosRequestConfig = AxiosRequestConfig & {
  requiresAuth?: boolean;
};

export const client = axios.create({
  baseURL: API_URL || undefined,
});

client.interceptors.request.use((config: InternalAxiosRequestConfig & { requiresAuth?: boolean }) => {
  if (!config.headers) {
    config.headers = {} as AxiosRequestHeaders;
  }

  const headers = config.headers as AxiosRequestHeaders & Record<string, unknown>;

  // Let browser set multipart boundary automatically for file uploads.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete headers["Content-Type"];
    delete headers["content-type"];
  }

  if (config.requiresAuth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});
