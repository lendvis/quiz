import { ChevronRight, CircleCheckBig, CircleX, Pencil } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useGetQuiz } from "../../hooks/useGetQuiz"

import { ServerBackground } from "../ServerBackground"
import { AutoFetchTab } from "./AutoFetchTab"
import type { Quiz } from "../../api/quiz/getQuiz"
import { AuthGuard } from "../common/Guards/AuthGuard"
import { useCreateQuizStats } from "../../hooks/useCreateQuizStats"
import { Button } from "../buttons/Button"
import { useGetLastQuizStats } from "../../hooks/useGetLastQuizStats"
import { useDialog } from "../../context/DialogContext"
import AssignQuizToGroupDialog from "../common/dialogs/AssignQuizToGroupDialog"
import { RoleGuard } from "../common/Guards/RoleGuard"
import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { useGetIsPassed } from "../../hooks/useGetIsPassed"

export const QuizDetailsTab = () => {
  const { id } = useParams();

  const { openDialog } = useDialog();

  const quizId: number = Number(id as string);
  const getQuizResponce = useGetQuiz(quizId);
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const [, createQuizStats] = useCreateQuizStats();

  const getLastQuizStatsResponce = useGetLastQuizStats(quizId);
  const lastQuizStatsId = getLastQuizStatsResponce.data?.last_quiz_stats_id;
  const hasStartedAttempt = typeof lastQuizStatsId === "number" && lastQuizStatsId !== -1;
  const getIsPassedResponse = useGetIsPassed(quizId, Boolean(auth?.isAuthorized && quizId));
  const isPassed = getIsPassedResponse.data?.passed;

  const startNewPassage = () => {
    if (quizId == undefined) return;

    createQuizStats(Number(id)).then((res) => navigate(`/quiz/${res.quiz_stats_id}`));
  }

  const continiuePassage = () => {
    if (quizId == undefined) return;

    const lastStatsId = getLastQuizStatsResponce.data?.last_quiz_stats_id;
    navigate(`/quiz/${lastStatsId}`);
  }
  

  return (
    <AutoFetchTab<Quiz> response={getQuizResponce}>
      {(quiz: Quiz) => (
        <>
          <div className="w-full h-100 relative">
            <ServerBackground imageId={`quiz/${quizId}`} className="absolute h-full w-full flex flex-col justify-end p-4 font-bold bg-cover bg-center text-white"
            >
              <div className="absolute inset-0 from-black/70 to-transparent" />
              <span className="relative text-6xl">
                {quiz.name}
              </span>
            </ServerBackground>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <AuthGuard fallback = {<h1 className="text-red-500">Чтобы пройти тест необходимо авторизоваться</h1>}>
              {hasStartedAttempt && typeof isPassed === "boolean" && (
                <div className={`rounded-lg px-3 py-2 text-sm font-medium w-fit flex items-center gap-2 ${isPassed ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/15 text-rose-300 border border-rose-500/30"}`}>
                  {isPassed ? <CircleCheckBig size={16} /> : <CircleX size={16} />}
                  {isPassed ? "Порог прохождения достигнут" : "Порог пока не достигнут"}
                </div>
              )}
              {(quiz.settings.allowRetake || !hasStartedAttempt) && (
                <Button onClick={startNewPassage}>
                  Начать новое прохождение <ChevronRight size={20} />
                </Button>
              )}
              {hasStartedAttempt &&
                <Button onClick={continiuePassage}>
                Продолжить прохождение <ChevronRight size={20} />
              </Button>
              }
              <RoleGuard roles={["teacher", "leadership"]}>
                <Button onClick={() => navigate(`/editor/${quizId}`)}>
                  Редактировать тест <Pencil size={18} />
                </Button>
                <Button onClick={() => openDialog(<AssignQuizToGroupDialog quizId={id as string}></AssignQuizToGroupDialog>)}>Назначить тест группе...</Button>
              </RoleGuard>
            </AuthGuard>
            <div className="text-slate-200">{quiz.description}</div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-900 text-white px-3 py-1 text-sm">
                Порог: {quiz.settings.passPercent}%
              </span>
              <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-sm">
                Лимит: {quiz.settings.timeLimitMinutes} мин
              </span>
              <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-sm">
                {quiz.settings.allowRetake ? "Повторное прохождение включено" : "Повторное прохождение выключено"}
              </span>
              <span className="rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-sm">
                {quiz.settings.showCorrectAnswers ? "Показывать ответы после теста" : "Не показывать ответы после теста"}
              </span>
            </div>
          </div>
        </>
      )}
    </AutoFetchTab>
  );
};
