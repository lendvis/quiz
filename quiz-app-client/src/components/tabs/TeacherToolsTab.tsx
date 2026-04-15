import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useGetQuizCards } from "../../hooks/useGetQuizesCards";
import { Tab } from "./Tab";
import { WithApi } from "../withApi";
import type { QuizCard } from "../../api/quiz/getQuizCards";
import { AuthGuard } from "../common/Guards/AuthGuard";
import { RoleGuard } from "../common/Guards/RoleGuard";
import { useDialog } from "../../context/DialogContext";
import { Button } from "../buttons/Button";
import AssignQuizToGroupDialog from "../common/dialogs/AssignQuizToGroupDialog";
import TeacherQuizResultsDialog from "../common/dialogs/TeacherQuizResultsDialog";

export const TeacherToolsTab: FC = () => {
  const navigate = useNavigate();
  const { openDialog } = useDialog();
  const getQuizCardsResponse = useGetQuizCards();

  return (
    <Tab>
      <AuthGuard fallback={<h2 className="text-red-500">Чтобы работать с тестами, нужно войти в систему</h2>}>
        <RoleGuard
          roles={["teacher", "leadership"]}
          fallback={<h2 className="text-red-500">Раздел доступен только преподавателям и руководству</h2>}
        >
          <div className="w-full flex flex-col gap-4">
            <header className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
              <h1 className="text-2xl font-bold text-slate-100">Работа с результатами и назначениями</h1>
              <p className="text-sm text-slate-300 mt-2">
                Для каждого теста доступны две ключевые операции: просмотр результатов учеников и назначение теста
                группам.
              </p>
            </header>

            <WithApi response={getQuizCardsResponse}>
              {(quizCards: QuizCard[]) => (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {quizCards.map((quizCard) => (
                    <article
                      key={quizCard.id}
                      className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 flex flex-col gap-4"
                    >
                      <div>
                        <h3 className="text-xl font-semibold text-slate-100">{quizCard.name}</h3>
                        <p className="text-sm text-slate-400 mt-1">{quizCard.questionCount} вопросов</p>
                      </div>

                      <div className="flex flex-col md:flex-row gap-2">
                        <Button onClick={() => openDialog(<TeacherQuizResultsDialog quizId={quizCard.id} />)}>
                          Результаты учеников
                        </Button>
                        <Button onClick={() => openDialog(<AssignQuizToGroupDialog quizId={quizCard.id} />)}>
                          Назначить группам
                        </Button>
                        <Button onClick={() => navigate(`/details/${quizCard.id}`)}>Открыть тест</Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </WithApi>
          </div>
        </RoleGuard>
      </AuthGuard>
    </Tab>
  );
};

