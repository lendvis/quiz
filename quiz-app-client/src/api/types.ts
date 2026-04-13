import type { AxiosRequestConfig, AxiosRequestHeaders } from "axios";

export type AuthAxiosRequestConfig = AxiosRequestConfig & {
  requiresAuth?: boolean;
  headers: AxiosRequestHeaders;
};
