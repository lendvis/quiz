import { client } from "../client";

export interface checkUsernameBody {
  username: string
}

export function checkUsername(body: checkUsernameBody) {
  return client.get(`/api/check_username/`, {params: body});
}
