"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { useAppState } from "@/features/preferences/app-state-context";
import {
  getAllLearningModules,
  getAllQuizQuestions,
} from "@/lib/data-service";

export function StatsGrid() {
  const { progress } = useAppState();
  const allModules = getAllLearningModules();
  const allQuestions = getAllQuizQuestions();

  const totalTopicsCount = allModules.reduce(
    (sum, mod) => sum + mod.topics.length,
    0
  );
  const completedTopicsCount = progress.completedTopicIds.length;

  const answeredRecords = Object.values(progress.answeredChallenges);
  const realAnsweredCount = answeredRecords.length;
  const realCorrectCount = answeredRecords.filter((r) => r.isCorrect).length;
  const realAccuracyPct =
    realAnsweredCount > 0
      ? Math.round((realCorrectCount / realAnsweredCount) * 100)
      : null;

  const stats = [
    {
      id: "topics-completed",
      label: "Пройдено учебных тем",
      value: `${completedTopicsCount} / ${totalTopicsCount}`,
      meta: `${Math.round(
        (completedTopicsCount / Math.max(1, totalTopicsCount)) * 100
      )}% курса освоено`,
    },
    {
      id: "quizzes-completed",
      label: "Решено тестовых задач",
      value: `${realAnsweredCount} / ${allQuestions.length}`,
      meta:
        progress.completedQuizzesCount > 0
          ? `Завершено тестов: ${progress.completedQuizzesCount}`
          : "текущая попытка",
    },
    {
      id: "accuracy-percentage",
      label: "Процент правильных ответов",
      value:
        realAccuracyPct !== null
          ? `${realAccuracyPct}%`
          : `${progress.accuracyPercentage}% (Demo)`,
      meta:
        realAnsweredCount > 0
          ? `${realCorrectCount} из ${realAnsweredCount} верно в сессии`
          : "демо-ориентир до прохождения теста",
    },
    {
      id: "learning-streak",
      label: "Серия занятий",
      value: `${progress.currentStreakDays} дн.`,
      meta: "активность в браузере",
    },
  ] as const;

  return (
    <section
      aria-label="Сводные показатели прогресса обучения"
      className="rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-slate-800/80 dark:bg-slate-900"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3 dark:border-slate-800/80">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Показатели обучения (из сохранённых данных браузера)
        </span>
        <Badge
          variant={realAnsweredCount > 0 ? "emerald" : "amber"}
          className="text-[10px]"
        >
          {realAnsweredCount > 0
            ? "Реальные данные сессии"
            : "Содержит начальные демо-значения"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0 dark:divide-slate-800/80">
        {stats.map((stat) => (
          <div key={stat.id} className="px-5 py-3.5">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="font-mono text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </span>
              <span className="truncate text-[11px] text-slate-400 dark:text-slate-500">
                {stat.meta}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
