import { get } from "../http";
import type { UserGroup } from "./types";

interface GetUserGroupResponse {
  group?: UserGroup;
  id?: number;
  name?: string;
}

export function getUserGroup() {
  return get<GetUserGroupResponse>(`auth/getUserGroup`, {}, { requiresAuth: true }).then((response) => {
    if (response.group) {
      return response.group;
    }

    if (typeof response.id === "number" && typeof response.name === "string") {
      return { id: response.id, name: response.name };
    }

    throw new Error("Не удалось получить группу пользователя");
  });
}
