import { client, type AuthAxiosRequestConfig } from "./client";

const apiEndpoint = "/api";

export const buildApiPath = (url: string) => {
  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
  return `${apiEndpoint}${normalizedUrl}`;
};

export const get = async <T, P = any>(
  url: string,
  params?: P,
  config?: AuthAxiosRequestConfig
): Promise<T> => {
  return client.get<T>(buildApiPath(url), { ...config, params }).then(res => res.data);
};

export const post = async <T, B>(
  url: string,
  body: B,
  config?: AuthAxiosRequestConfig
): Promise<T> => {
  return client.post<T>(buildApiPath(url), body, config).then(res => res.data);
};

export const put = async <T, B>(
  url: string,
  body: B,
  config?: AuthAxiosRequestConfig
): Promise<T> => {
  return client.put<T>(buildApiPath(url), body, config).then(res => res.data);
};

export const del = async <T>(
  url: string,
  config?: AuthAxiosRequestConfig
): Promise<T> => {
  return client.delete<T>(buildApiPath(url), config).then(res => res.data);
};
