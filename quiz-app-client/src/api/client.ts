import axios, { type AxiosRequestConfig, type AxiosRequestHeaders, type InternalAxiosRequestConfig } from "axios";
import { getToken } from "../auth/auth.store";
import { demoAdapter, setDemoUser, type DemoUser } from "../demo/demoAdapter";

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

/** Публичное демо собирается с VITE_DEMO=1 и работает без бекенда. */
export const IS_DEMO = import.meta.env.VITE_DEMO === "1";

export const client = axios.create({
  baseURL: API_URL || undefined,
  ...(IS_DEMO ? { adapter: demoAdapter } : {}),
});

if (IS_DEMO) {
  // после перезагрузки страницы роль восстанавливается из сохранённой сессии
  try {
    const raw = localStorage.getItem("auth_data");
    const username = raw ? JSON.parse(raw)?.user?.username : null;
    if (username) setDemoUser(username as DemoUser);
  } catch {
    // приватный режим браузера — останется роль по умолчанию
  }
}

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
