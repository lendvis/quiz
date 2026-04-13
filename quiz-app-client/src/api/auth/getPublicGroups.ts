import { get } from "../http";
import type { GroupListResponse } from "./types";

export function getPublicGroups() {
  return get<GroupListResponse>("auth/groups/public");
}
