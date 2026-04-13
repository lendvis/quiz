import { getUserGroup } from "../../api/auth/getUserGroup";
import { useAutoFetch } from "../useAutoFetch";

export function useGetUserGroup() {
  return useAutoFetch(getUserGroup);
}