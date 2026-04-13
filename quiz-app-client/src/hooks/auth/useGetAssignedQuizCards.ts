import { getAssignedGroups } from "../../api/auth/getAssignedGroups";
import { useAutoFetch } from "../useAutoFetch";

export function useGetAssignedQuizCards() {
  return useAutoFetch(getAssignedGroups);
}