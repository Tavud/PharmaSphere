"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Pill,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useAppState } from "@/features/preferences/app-state-context";
import { MilestoneBanner } from "@/components/ui/milestone-banner";
import { StatsGrid } from "@/features/dashboard/stats-grid";
import { RecentlyStudiedCard } from "@/features/dashboard/recently-studied-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DemoDisclaimer } from "@/components/ui/demo-disclaimer";
import {
  getAllLearningModules,
  getDrugById,
  getQuizQuestionById,
} from "@/lib/data-service";

export default function StudyProgressPage() {
  const { progress, resetChallengeDemo } = useAppState();
  const modules = getAllLearningModules();
  const answeredChallengeList = Object.values(progress.answeredChallenges);

  const incorrectAnswersCount = Math.max(
    0,
    progress.questionsAnswered - progress.correctAnswersCount
  );

  return (
    <div className="space-y-6">
      <MilestoneBanner
        sectionTitle="Прогресс и статистика"
        milestoneTarget="Локальная аналитика • Demo"
        purposeDescription="Сводная статистика правильных и неправильных ответов, прогресс прохождения учебных модулей и история занятий."
        rightSlot={
          <Button variant="outline" size="sm" onClick={resetChallengeDemo}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Сбросить демо-прогресс</span>
          </Button>
        }
      />

      {/* Сводные метрики обучения */}
      <StatsGrid />

      {/* Соотношение правильных и неправильных ответов + Пройденные темы модулей */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Разбор точности ответов (5 колонок) */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Правильные и неправильные ответы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  Общая точность ответов (Demo + сессия)
                </span>
                <span className="font-mono font-semibold text-teal-700 dark:text-teal-400">
                  {progress.accuracyPercentage}%
                </span>
              </div>
              <ProgressBar
                value={progress.accuracyPercentage}
                label="Точность ответов"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/40 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Верные ответы</span>
                </div>
                <p className="mt-1 font-mono text-xl font-semibold text-emerald-900 dark:text-emerald-200">
                  {progress.correctAnswersCount}
                </p>
              </div>

              <div className="rounded-xl border border-rose-200/70 bg-rose-50/40 p-3.5 dark:border-rose-900/50 dark:bg-rose-950/20">
                <div className="flex items-center gap-1.5 text-xs font-medium text-rose-800 dark:text-rose-300">
                  <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Неверные ответы</span>
                </div>
                <p className="mt-1 font-mono text-xl font-semibold text-rose-900 dark:text-rose-200">
                  {incorrectAnswersCount}
                </p>
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Базовые показатели содержат демонстрационную выборку (142 ответа)
              и динамически обновляются при решении задач в разделе
              «Тестирование».
            </p>
          </CardContent>
        </Card>

        {/* Пройденные темы и освоение модулей (7 колонок) */}
        <Card className="lg:col-span-7 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Освоение учебных модулей и тем</CardTitle>
            <Link
              href="/app/learning"
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline dark:text-teal-400"
            >
              <span>К модулям</span>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </CardHeader>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {modules.map((mod) => {
              const pct =
                progress.moduleProgressMap[mod.id] ?? mod.defaultProgressPercent;
              const completedTopics = Math.min(
                mod.topics.length,
                Math.max(1, Math.round((pct / 100) * mod.topics.length))
              );

              return (
                <div key={mod.id} className="px-5 py-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <Link
                      href={`/app/learning?module=${mod.id}`}
                      className="text-[13.5px] font-semibold text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-300"
                    >
                      {mod.title}
                    </Link>
                    <span className="font-mono text-xs font-semibold text-teal-700 dark:text-teal-400">
                      {pct}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{mod.organSystem}</span>
                    <span>
                      Пройдено тем: {completedTopics} из {mod.topics.length}
                    </span>
                  </div>
                  <ProgressBar value={pct} label={mod.title} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* История занятий: Журнал тестовых ответов + Недавно изученные материалы */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 flex flex-col justify-between overflow-hidden">
          <div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Журнал решённых тестовых задач (текущая сессия)</CardTitle>
              <span className="font-mono text-xs text-slate-400">
                Ответов: {answeredChallengeList.length}
              </span>
            </CardHeader>

            {answeredChallengeList.length === 0 ? (
              <div className="p-6 text-xs leading-relaxed text-slate-500 dark:text-slate-400 space-y-3">
                <p>
                  В текущей сессии вы ещё не отвечали на клинические задачи.
                  Перейдите в раздел «Тестирование», чтобы проверить знания.
                </p>
                <Link
                  href="/app/quiz"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-teal-600 px-3 text-xs font-medium text-white hover:bg-teal-700"
                >
                  <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Открыть тестирование</span>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 text-xs dark:divide-slate-800/80">
                {answeredChallengeList.map((entry) => {
                  const question = getQuizQuestionById(entry.questionId);
                  const relatedDrug = question
                    ? getDrugById(question.relatedDrugId)
                    : undefined;

                  return (
                    <li key={entry.questionId} className="px-5 py-3.5 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {question ? question.title : entry.questionId}
                        </span>
                        <span
                          className={
                            entry.isCorrect
                              ? "font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"
                              : "font-mono text-[11px] font-semibold text-rose-700 dark:text-rose-400"
                          }
                        >
                          Вариант {entry.selectedOptionId} •{" "}
                          {entry.isCorrect ? "Верно" : "Неверно"}
                        </span>
                      </div>
                      {relatedDrug && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <Pill
                            className="h-3 w-3 text-teal-600 dark:text-teal-400"
                            aria-hidden="true"
                          />
                          <span>Препарат:</span>
                          <Link
                            href={`/app/drugs/${relatedDrug.id}`}
                            className="font-medium text-teal-700 hover:underline dark:text-teal-400"
                          >
                            {relatedDrug.genericName}
                          </Link>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>

        <div className="lg:col-span-5">
          <RecentlyStudiedCard />
        </div>
      </div>

      <DemoDisclaimer />
    </div>
  );
}
