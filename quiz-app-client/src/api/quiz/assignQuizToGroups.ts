import { post } from "../http";

export interface AssignQuizToGroupsResponce {
    
}

export interface AssignQuizToGroupsBody {
    quizId: number,
    groupIds: number[]
}

export function assignQuizToGroups(body: AssignQuizToGroupsBody) {
  return post<AssignQuizToGroupsResponce, AssignQuizToGroupsBody>("quizzes/assignQuizToGroups", body, { requiresAuth: true });
}