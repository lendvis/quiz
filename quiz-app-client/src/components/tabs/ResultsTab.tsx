import { useEffect, useState, type FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CircleProgressBar } from "../progressBars/CircleProgressBar";
import { Button } from "../buttons/Button";
import { PrimaryButton } from "../buttons/PrimaryButton";
import { AutoFetchTab } from "./AutoFetchTab";
import { useFetch, type FetchResponce } from "../../hooks/useFetch";
import {
  GetQuizStatsSummary,
  type QuizSummaryViewModel,
} from "../../api/quiz/getQuizStatsSummary";
import { useGetQuizSummaryList } from "../../hooks/useGetQuizSummaryList";
import { WithApi } from "../withApi";
import { createQuizStats } from "../../api/quiz/createQuizStats";

export const ResultsTab: FC = () => {
  const { quizId, quizStatsId } = useParams();
  const navigate = useNavigate();

  const getQuizSummaryListResponse = useGetQuizSummaryList(Number(quizId));
  const [getQuizStatsSummaryResponse, getQuizStatsSummary] = useFetch(GetQuizStatsSummary);

  const onAgainButtonClicked = () => {
    createQuizStats(Number(quizId)).then((res) => navigate(`/quiz/${res.quiz_stats_id}`));
  };

  const onExitButtonClicked = () => {
    navigate(`/`);
  };

  useEffect(() => {
    if (!quizStatsId) {
      return;
    }
    getQuizStatsSummary(Number(quizStatsId));
  }, [quizStatsId, getQuizStatsSummary]);

  return (
    <AutoFetchTab<number[]> response={getQuizSummaryListResponse as FetchResponce<number[]>}>
      {(summaryList: number[]) => {
        return (
          <div className="w-full flex flex-col gap-3 pb-6">
            <h1 className="text-slate-100 text-3xl font-bold">Результаты</h1>
            <QuizStatsTabButtonsHolder
              onSelect={(summaryNumber) => {
                navigate(`/results/${quizId}/${summaryNumber}`);
              }}
              quizStatsIds={summaryList}
              selectedId={Number(quizStatsId)}
            />
            <WithApi response={getQuizStatsSummaryResponse}>
              {(summary: QuizSummaryViewModel) => (
                <QuizSummaryPanel
                  summary={summary}
                  onAgainButtonClicked={onAgainButtonClicked}
                  onExitButtonClicked={onExitButtonClicked}
                />
              )}
            </WithApi>
          </div>
        );
      }}
    </AutoFetchTab>
  );
};

interface QuizSummaryProps {
  summary: QuizSummaryViewModel;
  onAgainButtonClicked: () => void;
  onExitButtonClicked: () => void;
}

const QuizSummaryPanel: FC<QuizSummaryProps> = ({
  summary,
  onAgainButtonClicked,
  onExitButtonClicked,
}) => {
  const totalQuestions = Math.max(summary.totalQuestions, 1);
  const passTitle = summary.isPassed ? "Тест пройден" : "Тест не пройден";
  const passColor = summary.isPassed ? "text-emerald-400" : "text-rose-400";

  return (
    <div className="flex flex-col xl:flex-row text-slate-100 justify-center items-center flex-1 rounded-3xl bg-slate-800/80 backdrop-blur border border-slate-700/50 p-8 gap-10 shadow-2xl">
      <CircleProgressBar
        segments={[
          {
            value: (summary.unanswered / totalQuestions) * 100,
            color: "text-slate-500",
          },
          {
            value: (summary.correctAnswers / totalQuestions) * 100,
            color: "text-emerald-500",
          },
          {
            value: (summary.wrongAnswers / totalQuestions) * 100,
            color: "text-rose-500",
          },
        ]}
      />

      <div className="flex flex-col w-full max-w-3xl gap-6">
        <div>
          <h2 className={`text-4xl font-bold tracking-tight ${passColor}`}>{passTitle}</h2>
          <p className="text-slate-300 mt-2 text-lg">
            Точность: <span className="font-semibold text-white">{summary.accuracy}%</span>
            <span className="mx-3 opacity-50">|</span> Порог прохождения:{" "}
            <span className="font-semibold text-white">{summary.passPercent}%</span>
          </p>
          {summary.completedAt && (
            <p className="text-sm text-slate-500 mt-2">
              Завершено: {new Date(summary.completedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Правильных" value={summary.correctAnswers} color="from-emerald-500 to-emerald-400" />
          <Stat label="Ошибок" value={summary.wrongAnswers} color="from-rose-500 to-rose-400" />
          <Stat label="Всего" value={summary.totalQuestions} color="from-indigo-500 to-indigo-400" />
          <Stat label="Без ответа" value={summary.unanswered} color="from-slate-500 to-slate-400" />
        </div>

        <div className="w-full flex flex-col md:flex-row justify-between mt-4 gap-4">
          {summary.allowRetake ? (
            <Button onClick={onAgainButtonClicked}>Пройти тест ещё раз</Button>
          ) : (
            <Button inactive>Повтор отключён настройками теста</Button>
          )}
          <PrimaryButton onClick={onExitButtonClicked}>Выйти</PrimaryButton>
        </div>
      </div>
    </div>
  );
};

interface StatProps {
  label: string;
  value: number;
  color: string;
}

const Stat: FC<StatProps> = ({ label, value, color }) => (
  <div className="flex flex-col items-center rounded-2xl bg-slate-900/50 border border-slate-700/50 p-4 transition-transform hover:-translate-y-1">
    <span className="mb-3 text-sm font-medium text-slate-400">{label}</span>
    <div className={`bg-gradient-to-br ${color} rounded-full h-14 w-14 flex justify-center items-center text-white text-2xl font-bold shadow-lg`}>
      {value}
    </div>
  </div>
);

interface QuizStatsTabButtonsHolderProps {
  quizStatsIds: number[];
  onSelect: (summaryNumber: number) => void;
  selectedId: number;
}

const QuizStatsTabButtonsHolder: FC<QuizStatsTabButtonsHolderProps> = ({
  quizStatsIds,
  onSelect,
  selectedId,
}) => {
  const [selectedButtonId, setSelectedButtonId] = useState<number>(selectedId);

  useEffect(() => {
    setSelectedButtonId(selectedId);
  }, [selectedId]);

  return (
    <div className="w-full h-10 flex flex-row gap-2 overflow-x-auto scale-y-[-1]">
      {quizStatsIds.map((quizStatsId_, index) => (
        <div key={quizStatsId_} className="scale-y-[-1]">
          <QuizStatsTabButton
            buttonNumber={index}
            onClick={(quizStatsId) => {
              onSelect(quizStatsId);
              setSelectedButtonId(quizStatsId);
            }}
            quizStatsId={quizStatsId_}
            selected={selectedButtonId === quizStatsId_}
          />
        </div>
      ))}
    </div>
  );
};

interface QuizStatsTabButtonProps {
  buttonNumber: number;
  quizStatsId: number;
  onClick: (quizStatsId: number) => void;
  selected: boolean;
}

const QuizStatsTabButton: FC<QuizStatsTabButtonProps> = ({
  buttonNumber,
  quizStatsId,
  onClick,
  selected,
}) => (
  <button
    className={`px-5 py-2 shrink-0 cursor-pointer rounded-t-xl flex items-center justify-start transition-all font-medium ${
      selected ? "bg-slate-800 text-indigo-400" : "bg-slate-900/50 text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
    }`}
    onClick={() => {
      onClick(quizStatsId);
    }}
  >
    <span className="text-left whitespace-nowrap">{`Прохождение ${buttonNumber + 1}`}</span>
  </button>
);
