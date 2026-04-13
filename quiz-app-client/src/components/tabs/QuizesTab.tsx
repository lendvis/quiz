import { type FC, type HTMLAttributes, useContext } from "react"
import { Link } from "react-router-dom"
import { useGetQuizCards } from "../../hooks/useGetQuizesCards"
import { ServerBackground } from "../ServerBackground"
import { type QuizCard, type QuizCardsQuery } from "../../api/quiz/getQuizCards"
import { Tab, type TabProps } from "./Tab"
import { WithApi } from "../withApi"
import { TabHeader } from "../ui/TabHeader"
import { AuthContext } from "../../context/AuthContext"


export interface QuizCardsContentProps extends HTMLAttributes<HTMLDivElement> {
  query?: QuizCardsQuery
  cardLinkBuilder?: (quizCard: QuizCard) => string
  actionLabel?: string
}

export const QuizCardsContent: FC<QuizCardsContentProps> = ({
  query,
  cardLinkBuilder,
  actionLabel,
  ...props
}) => {
  const getQuizCardsState = useGetQuizCards(query);
  const auth = useContext(AuthContext);
  const shouldShowLearningStatus = auth?.role === "student";

  return (
    <WithApi response={getQuizCardsState}>
      {(quizCards: QuizCard[]) => (
        <div {...props as HTMLAttributes<HTMLDivElement>}>
          <div className="w-full gap-4 flex flex-row flex-wrap">
            {quizCards.map((quizCard, _) => (
              <QuizCardPanel
                key={quizCard.id}
                name={quizCard.name}
                quizId={quizCard.id}
                questionCount={quizCard.questionCount}
                image={quizCard.image}
                href={cardLinkBuilder ? cardLinkBuilder(quizCard) : `/details/${quizCard.id}`}
                actionLabel={actionLabel}
                learningStatus={shouldShowLearningStatus ? getQuizCardLearningStatus(quizCard) : null}
              />
            ))}
          </div>
        </div>
      )}
    </WithApi>
  )
}

export interface QuizesTabProps extends TabProps {
  query?: QuizCardsQuery
}

export const QuizesTab: FC<QuizesTabProps> = () => {
  return (
    <Tab>
      <TabHeader>Каталог тестов</TabHeader>
      <QuizCardsContent className="h-full w-full">

      </QuizCardsContent>
    </Tab>
  );
};


interface QuizCardPanelProps {
  name: string
  quizId: string
  questionCount: number
  image: string;
  href: string
  actionLabel?: string
  learningStatus?: QuizCardLearningStatus | null
}

type QuizCardLearningStatus = "passed" | "failed" | "not_assigned" | "not_started";

const getQuizCardLearningStatus = (quizCard: QuizCard): QuizCardLearningStatus | null => {
  if (quizCard.isPassed) {
    return "passed";
  }

  if (quizCard.hasAttempt) {
    return "failed";
  }

  if (quizCard.isAssigned === false) {
    return "not_assigned";
  }

  if (quizCard.isAssigned === true) {
    return "not_started";
  }

  return null;
};

const STATUS_LABELS: Record<QuizCardLearningStatus, string> = {
  passed: "Успешно пройден",
  failed: "Пробный результат: не пройден",
  not_assigned: "Не задан",
  not_started: "Назначен, не начат"
};

const STATUS_STYLES: Record<QuizCardLearningStatus, string> = {
  passed: "bg-emerald-500/20 border border-emerald-400/40 text-emerald-100",
  failed: "bg-rose-500/20 border border-rose-400/40 text-rose-100",
  not_assigned: "bg-slate-500/20 border border-slate-300/35 text-slate-100",
  not_started: "bg-indigo-500/20 border border-indigo-300/40 text-indigo-100"
};

export const QuizCardPanel: FC<QuizCardPanelProps> = ({
  name,
  quizId,
  questionCount,
  href,
  actionLabel,
  learningStatus,
}) => {
  const ctaText = actionLabel || "Пройти тест";

  return (
    <ServerBackground
      imageId={`quiz/${quizId}`}
      className="group relative h-48 w-80 overflow-hidden rounded-2xl bg-slate-900 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
    >
      <Link className="flex h-full w-full flex-col justify-between" to={href}>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent transition-opacity duration-500 group-hover:from-indigo-950/90 group-hover:via-indigo-900/40" />

        <div className="relative z-10 flex h-full flex-col justify-between p-5">
          <div className="flex justify-between items-start gap-2">
            <div>
              {learningStatus && (
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md shadow-sm ${STATUS_STYLES[learningStatus]}`}
                >
                  {STATUS_LABELS[learningStatus]}
                </span>
              )}
            </div>
            <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur-md shadow-sm">
              {questionCount} вопросов
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold leading-tight text-white line-clamp-2 mb-2 group-hover:text-indigo-200 transition-colors duration-300">
              {name}
            </h3>
            
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-400 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
              <span>{ctaText}</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </ServerBackground>
  );
};
