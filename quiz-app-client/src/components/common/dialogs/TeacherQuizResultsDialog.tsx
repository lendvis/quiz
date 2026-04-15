import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ApiError } from "../../../api/api-error";
import {
  getStudentQuizResults,
  type StudentQuizResultItem,
} from "../../../api/quiz/getStudentQuizResults";
import { AuthContext } from "../../../context/AuthContext";
import { useDialog } from "../../../context/DialogContext";

type TeacherQuizResultsDialogProps = {
  quizId: string;
};

const getApiErrorMessage = (error: unknown) => {
  const maybeApiError = error as ApiError | undefined;
  if (maybeApiError?.message) {
    return maybeApiError.message;
  }

  return "Не удалось получить результаты учеников";
};

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "Дата неизвестна";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Дата неизвестна";
  }

  return date.toLocaleString();
};

const TeacherQuizResultsDialog = ({ quizId }: TeacherQuizResultsDialogProps) => {
  const navigate = useNavigate();
  const { closeDialog } = useDialog();
  const auth = useContext(AuthContext);

  const [results, setResults] = useState<StudentQuizResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getStudentQuizResults(Number(quizId));
        if (!cancelled) {
          setResults(response);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadResults();

    return () => {
      cancelled = true;
    };
  }, [quizId]);

  const filteredResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return results;
    }

    return results.filter((item) => {
      const groupName = item.group?.name || "";
      const combined = `${item.student.displayName} ${item.student.username} ${groupName}`.toLowerCase();
      return combined.includes(query);
    });
  }, [results, search]);

  const openStudentResult = (result: StudentQuizResultItem) => {
    closeDialog();
    navigate(`/results/${quizId}/${result.quizStatsId}?studentId=${result.student.id}`);
  };

  return (
    <div className="flex h-full flex-col text-slate-900">
      <h2 className="text-2xl font-semibold mb-3">Результаты учеников</h2>
      <p className="text-sm text-slate-600 mb-4">
        {auth?.role === "leadership"
          ? "Здесь доступны попытки учеников из всех групп."
          : "Здесь доступны попытки только ваших учеников."}
      </p>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Поиск по ученику или группе"
        className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      />

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200">
        {isLoading && (
          <div className="p-4 text-sm text-slate-500">Загрузка результатов...</div>
        )}

        {!isLoading && error && (
          <div className="p-4 text-sm text-rose-600">{error}</div>
        )}

        {!isLoading && !error && filteredResults.length === 0 && (
          <div className="p-4 text-sm text-slate-500">
            Пока нет попыток по этому тесту.
          </div>
        )}

        {!isLoading && !error && filteredResults.length > 0 && (
          <div className="divide-y divide-slate-200">
            {filteredResults.map((item) => (
              <div
                key={item.quizStatsId}
                className="p-4 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3"
              >
                <div className="space-y-1">
                  <div className="font-medium text-slate-900">
                    {item.student.displayName}{" "}
                    <span className="text-sm font-normal text-slate-500">
                      @{item.student.username}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    Группа: {item.group?.name || "не указана"}
                  </div>
                  <div className="text-sm text-slate-600">
                    Точность: {item.accuracy}% • Правильных: {item.correctAnswers}/{item.totalQuestions} •
                    Статус: {item.isPassed ? " пройден" : " не пройден"}
                  </div>
                  <div className="text-xs text-slate-500">
                    Завершено: {formatDateTime(item.completedAt)}
                  </div>
                </div>

                <div className="flex items-center">
                  <button
                    onClick={() => openStudentResult(item)}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                  >
                    Открыть
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={closeDialog}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default TeacherQuizResultsDialog;
