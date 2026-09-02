import { type FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tab } from "./Tab";
import { WithApi } from "../withApi";
import { AuthGuard } from "../common/Guards/AuthGuard";
import { RoleGuard } from "../common/Guards/RoleGuard";
import { Button } from "../buttons/Button";
import { useGetQuizAnalytics } from "../../hooks/useGetQuizAnalytics";
import type {
  AnalyticsQuestion,
  AnalyticsStudent,
  QuizAnalytics,
} from "../../api/quiz/getQuizAnalytics";

const DIST_LABELS = ["0–20", "20–40", "40–60", "60–80", "80–100"];

/** Вопрос, который решают почти все, ничего не проверяет; вопрос, где ошибается
 *  большинство, обычно сформулирован неудачно. Пороги — общепринятые в item analysis. */
function questionVerdict(pct: number) {
  if (pct >= 85) return { label: "лёгкий", tone: "muted" as const };
  if (pct <= 40) return { label: "сложный", tone: "bad" as const };
  return { label: "норма", tone: "ok" as const };
}

const toneColor = {
  muted: "var(--theme-text-muted)",
  ok: "var(--theme-ok)",
  bad: "var(--theme-bad)",
};

const Metric: FC<{ label: string; value: string; hint?: string; accent?: boolean }> = ({
  label,
  value,
  hint,
  accent,
}) => (
  <div className="theme-panel rounded-xl px-4 py-3.5">
    <div
      className="num text-2xl leading-none mb-1.5"
      style={{ color: accent ? "var(--theme-accent)" : "var(--theme-text-primary)" }}
    >
      {value}
      {hint && (
        <span className="text-sm ml-1" style={{ color: "var(--theme-text-muted)" }}>
          {hint}
        </span>
      )}
    </div>
    <div className="eyebrow">{label}</div>
  </div>
);

const QuestionRow: FC<{ q: AnalyticsQuestion }> = ({ q }) => {
  const verdict = questionVerdict(q.pct);
  const barColor =
    q.pct <= 40 ? "var(--theme-bad)" : q.pct >= 85 ? "var(--theme-ok)" : "var(--theme-accent)";

  return (
    <tr style={{ borderTop: "1px solid var(--theme-border)" }}>
      <td className="num px-3 py-3 align-top" style={{ color: "var(--theme-text-muted)" }}>
        {q.n}
      </td>
      <td className="px-3 py-3 align-top min-w-[220px]">
        <div style={{ color: "var(--theme-text-primary)" }}>{q.text}</div>
        <div className="mt-2 flex items-center gap-2">
          <span
            className="eyebrow px-2 py-0.5 rounded-full"
            style={{ color: toneColor[verdict.tone], border: `1px solid ${toneColor[verdict.tone]}` }}
          >
            {verdict.label}
          </span>
        </div>
        <div
          className="mt-2 h-1.5 rounded-full overflow-hidden"
          style={{ background: "var(--theme-progress-track)" }}
        >
          <div style={{ width: `${q.pct}%`, height: "100%", background: barColor }} />
        </div>
      </td>
      <td className="num px-3 py-3 text-right align-top">{q.pct}%</td>
      <td className="num px-3 py-3 text-right align-top" style={{ color: "var(--theme-text-secondary)" }}>
        {q.sec} с
      </td>
      <td className="num px-3 py-3 align-top text-sm" style={{ color: "var(--theme-bad)" }}>
        {q.topWrong ? `${q.topWrong.text} ×${q.topWrong.n}` : "—"}
      </td>
    </tr>
  );
};

const StudentRow: FC<{ s: AnalyticsStudent }> = ({ s }) => {
  const color =
    s.pct >= 80 ? "var(--theme-ok)" : s.pct < 60 ? "var(--theme-bad)" : "var(--theme-text-primary)";
  return (
    <tr style={{ borderTop: "1px solid var(--theme-border)" }}>
      <td className="px-3 py-2.5">
        <div style={{ color: "var(--theme-text-primary)" }}>{s.name}</div>
        <div className="eyebrow mt-0.5">{s.grp ?? "без группы"}</div>
      </td>
      <td className="num px-3 py-2.5 text-right" style={{ color }}>
        {s.pct}%
      </td>
      <td className="num px-3 py-2.5 text-right" style={{ color: "var(--theme-text-secondary)" }}>
        {s.min}
      </td>
    </tr>
  );
};

const AnalyticsView: FC<{ data: QuizAnalytics }> = ({ data }) => {
  const navigate = useNavigate();
  const { summary, questions, students, groups, dist } = data;

  if (!summary || summary.attempts === 0) {
    return (
      <div className="theme-panel rounded-2xl p-6">
        <h1 className="text-xl font-semibold">{data.quiz.name}</h1>
        <p className="mt-2" style={{ color: "var(--theme-text-secondary)" }}>
          Тест ещё никто не проходил — считать нечего. Аналитика появится после первой завершённой попытки.
        </p>
        <div className="mt-4">
          <Button onClick={() => navigate("/teacher-tools")}>Назад</Button>
        </div>
      </div>
    );
  }

  const buckets = DIST_LABELS.map((_, i) => dist.find((d) => d.bucket === i + 1)?.n ?? 0);
  const maxBucket = Math.max(...buckets, 1);
  const hardest = questions.reduce((a, b) => (b.pct < a.pct ? b : a), questions[0]);

  return (
    <div className="w-full flex flex-col gap-4">
      <header className="flex flex-wrap items-end gap-3">
        <div>
          <div className="eyebrow mb-1">Аналитика теста</div>
          <h1 className="text-2xl font-bold">{data.quiz.name}</h1>
        </div>
        <div className="ml-auto flex gap-2">
          <Button onClick={() => navigate("/teacher-tools")}>К тестам</Button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <Metric label="Попыток" value={String(summary.attempts)} />
        <Metric label="Средний балл" value={`${summary.avg}%`} accent />
        <Metric label="Медиана" value={`${summary.median}%`} />
        <Metric label="Сдали ≥60" value={String(summary.passed)} hint={`из ${summary.attempts}`} />
        <Metric label="Среднее время" value={String(summary.avgMin)} hint="мин" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-4">
        <section className="theme-panel rounded-2xl overflow-hidden min-w-0">
          <h2 className="eyebrow px-5 py-3.5" style={{ borderBottom: "1px solid var(--theme-border)" }}>
            Разбор вопросов · item analysis
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 620 }}>
              <thead>
                <tr>
                  {["№", "Вопрос", "Верных", "Время", "Частая ошибка"].map((h, i) => (
                    <th
                      key={h}
                      className={`eyebrow px-3 py-2.5 ${i > 1 ? "text-right" : "text-left"} ${i === 4 ? "text-left" : ""}`}
                      style={{ borderBottom: "1px solid var(--theme-border)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <QuestionRow key={q.n} q={q} />
                ))}
              </tbody>
            </table>
          </div>
          {hardest && (
            <div
              className="m-5 mt-4 rounded-lg px-4 py-3 text-sm"
              style={{ background: "var(--theme-panel-muted)", borderLeft: "3px solid var(--theme-bad)" }}
            >
              <b>Вопрос {hardest.n} — узкое место.</b>{" "}
              <span style={{ color: "var(--theme-text-secondary)" }}>
                Верных {hardest.pct}%, среднее время {hardest.sec} с.
                {hardest.topWrong &&
                  ` Вариант «${hardest.topWrong.text}» выбрали ${hardest.topWrong.n} чел. — столько людей не ошибаются случайно.`}
              </span>
            </div>
          )}
        </section>

        <div className="flex flex-col gap-4 min-w-0">
          <section className="theme-panel rounded-2xl overflow-hidden">
            <h2 className="eyebrow px-5 py-3.5" style={{ borderBottom: "1px solid var(--theme-border)" }}>
              Распределение баллов
            </h2>
            <div className="px-5 py-4 flex flex-col gap-2">
              {buckets.map((n, i) => (
                <div key={DIST_LABELS[i]} className="grid grid-cols-[54px_1fr_24px] items-center gap-2.5">
                  <span className="eyebrow">{DIST_LABELS[i]}</span>
                  <span
                    className="h-4 rounded"
                    style={{
                      width: `${Math.max(4, Math.round((n / maxBucket) * 100))}%`,
                      background: i < 2 ? "var(--theme-bad)" : "var(--theme-accent)",
                    }}
                  />
                  <span className="num text-xs text-right" style={{ color: "var(--theme-text-secondary)" }}>
                    {n}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="theme-panel rounded-2xl overflow-hidden">
            <h2 className="eyebrow px-5 py-3.5" style={{ borderBottom: "1px solid var(--theme-border)" }}>
              Группы
            </h2>
            <div className="px-5 py-4 flex flex-col gap-3">
              {groups.map((g) => (
                <div key={g.name} className="flex items-center gap-3 text-sm">
                  <div>
                    <div style={{ color: "var(--theme-text-primary)" }}>{g.name}</div>
                    <div className="eyebrow mt-0.5">
                      {g.done} из {g.students} прошли
                    </div>
                  </div>
                  <b className="num ml-auto">{g.avg == null ? "—" : `${g.avg}%`}</b>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="theme-panel rounded-2xl overflow-hidden">
        <h2 className="eyebrow px-5 py-3.5" style={{ borderBottom: "1px solid var(--theme-border)" }}>
          Ученики · {students.length}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 420 }}>
            <thead>
              <tr>
                {["Ученик", "Балл", "Время, мин"].map((h, i) => (
                  <th
                    key={h}
                    className={`eyebrow px-3 py-2.5 ${i ? "text-right" : "text-left"}`}
                    style={{ borderBottom: "1px solid var(--theme-border)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <StudentRow key={`${s.name}-${i}`} s={s} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export const AnalyticsTab: FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const response = useGetQuizAnalytics(quizId ?? "");

  return (
    <Tab>
      <AuthGuard fallback={<h2 className="text-red-500">Чтобы смотреть аналитику, нужно войти в систему</h2>}>
        <RoleGuard
          roles={["teacher", "leadership"]}
          fallback={<h2 className="text-red-500">Аналитика доступна преподавателю и руководству</h2>}
        >
          <WithApi
            response={response}
            fallback={<h2 className="text-red-500">Не удалось загрузить аналитику</h2>}
          >
            {(data: QuizAnalytics) => <AnalyticsView data={data} />}
          </WithApi>
        </RoleGuard>
      </AuthGuard>
    </Tab>
  );
};
