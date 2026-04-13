
import { assignQuizToGroups } from "../api/quiz/assignQuizToGroups";
import { useFetch } from "./useFetch";

export function useAssignQuizToGroups() {
  return useFetch(assignQuizToGroups);
}