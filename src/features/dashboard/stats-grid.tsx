"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { useAppState } from "@/features/preferences/app-state-context";

export function StatsGrid() {
  const { progress } = useAppState();
  const answeredInSessionCount = Object.keys(progress.answeredChallenges).length;

  const stats = [
    {
      id: "questions-answered",
      label: "Отвечено вопросов",
      value: progress.questionsAnswered.toString(),
      meta:
        answeredInSessionCount > 0
          ? `+${answeredInSessionCount} в текущей сессии`
          : "демо-выборка",
    },
    {
      id: "accuracy-percentage",
      label: "Процент правильных ответов",
      value: `${progress.accuracyPercentage}%`,
      meta: `${progress.correctAnswersCount} из ${progress.questionsAnswered} верно`,
    },
    {
      id: "topics-completed",
      label: "Пройдено тем",
      value: progress.studyTopicsCompleted.toString(),
      meta: "ВНС, ССС и почки",
    },
    {
      id: "learning-streak",
      label: "Серия занятий",
      value: `${progress.currentStreakDays} дн.`,
      meta: "ежедневный практикум",
    },
  ] as const;

  return (
    <section
      aria-label="Статистика обучения (демонстрационные показатели)"
      className="rounded-lg border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2 dark:border-slate-800/80">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Сводка учебной активности
        </span>
        <Badge variant="amber" className="text-[10px]">
          Демо-статистика (пример)
        </Badge>
      </div>

      <div className="grid grid-cols-2 divide-y divide-slate-100 sm:grid-cols-4 sm:divide-x sm:divide-y-0 dark:divide-slate-800/80">
        {stats.map((stat) => (
          <div key={stat.id} className="px-3.5 py-2.5">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>
            <div className="mt-0.5 flex items-baseline justify-between gap-2">
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
