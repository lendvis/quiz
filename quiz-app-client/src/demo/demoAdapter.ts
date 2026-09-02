/**
 * Демо-режим: приложение работает без бекенда, отвечая записанными ответами API.
 * Включается сборкой с VITE_DEMO=1 — так живёт публичное демо на GitHub Pages.
 * Данные настоящие: сняты с работающего стенда, а не выдуманы.
 */
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import fixtures from "./fixtures.json";

type Fixtures = Record<string, unknown>;
const data = fixtures as Fixtures;

export const DEMO_PASSWORD = "P@ssw0rd";
export const DEMO_USERS = ["teacher", "student", "admin"] as const;
export type DemoUser = (typeof DEMO_USERS)[number];

/** Роль текущего пользователя нужна, чтобы отдать «его» вариант ответа. */
let currentUser: DemoUser = "teacher";

export function setDemoUser(user: DemoUser) {
  currentUser = user;
}

const stripApi = (url: string) =>
  url.replace(/^https?:\/\/[^/]+/, "").replace(/^\/?api\//, "").replace(/^\//, "");

function lookup(path: string): unknown {
  // сначала ищем ответ, записанный именно для этой роли
  const scoped = data[`GET ${path}::${currentUser}`];
  if (scoped !== undefined) return scoped;

  const plain = data[`GET ${path}`];
  if (plain !== undefined) return plain;

  // запрос с параметрами — пробуем без них
  const withoutQuery = path.split("?")[0];
  const scopedBase = data[`GET ${withoutQuery}::${currentUser}`];
  if (scopedBase !== undefined) return scopedBase;

  return data[`GET ${withoutQuery}`];
}

/** Прозрачный PNG 1×1: заглушка вместо картинок, которых в демо нет. */
const TRANSPARENT_PIXEL = () => {
  const base64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: "image/png" });
};

const ok = (config: InternalAxiosRequestConfig, body: unknown): AxiosResponse => ({
  data: body,
  status: 200,
  statusText: "OK",
  headers: {},
  config,
});

const fail = (config: InternalAxiosRequestConfig, status: number, message: string) =>
  Promise.reject(
    Object.assign(new Error(message), {
      isAxiosError: true,
      config,
      response: { data: { message }, status, statusText: "Error", headers: {}, config },
    })
  );

export const demoAdapter: AxiosAdapter = async (config) => {
  const method = (config.method || "get").toLowerCase();
  const path = stripApi(config.url || "");

  // вход: пароль общий, роль выбирается логином
  if (method === "post" && path === "auth/login") {
    const body = typeof config.data === "string" ? JSON.parse(config.data) : config.data ?? {};
    const username = String(body.username || "").trim();
    const known = (DEMO_USERS as readonly string[]).includes(username);

    if (!known || body.password !== DEMO_PASSWORD) {
      return fail(config, 400, "В демо-режиме доступны логины teacher, student и admin с паролем P@ssw0rd");
    }

    setDemoUser(username as DemoUser);
    const saved = data[`POST auth/login::${username}`];
    return ok(config, saved);
  }

  // Картинки приложение запрашивает как blob и сразу зовёт URL.createObjectURL:
  // вернуть сюда JSON нельзя — интерфейс упадёт. В демо картинок нет,
  // поэтому отдаём прозрачный пиксель.
  if (method === "get" && path.startsWith("image/")) {
    return ok(config, TRANSPARENT_PIXEL());
  }

  if (method === "get") {
    const body = lookup(path);
    if (body !== undefined) return ok(config, body);
    // неизвестный справочник: пустой список честнее, чем падение интерфейса
    return ok(config, []);
  }

  // демо статическое: любые изменения не сохраняются, и об этом лучше сказать прямо
  return fail(config, 405, "Демо-режим только для просмотра: изменения не сохраняются");
};
