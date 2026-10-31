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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DemoDisclaimer } from "@/components/ui/demo-disclaimer";
import {
  getAllLearningModules,
  getAllQuizQuestions,
  getDrugById,
  getQuizQuestionById,
} from "@/lib/data-service";

export default function StudyProgressPage() {
  const { progress, resetChallengeDemo } = useAppState();
  const modules = getAllLearningModules();
  const allQuestions = getAllQuizQuestions();
  const answeredChallengeList = Object.values(progress.answeredChallenges);

  const realAnsweredCount = answeredChallengeList.length;
  const realCorrectCount = answeredChallengeList.filter(
    (entry) => entry.isCorrect
  ).length;
  const realIncorrectCount = realAnsweredCount - realCorrectCount;
  const realAccuracyPct =
    realAnsweredCount > 0
      ? Math.round((realCorrectCount / realAnsweredCount) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <MilestoneBanner
        sectionTitle="Прогресс и статистика"
        milestoneTarget="Реальные данные браузера + Demo"
        purposeDescription="Отслеживание пройденных тем, результатов тестирования, процента правильных ответов и истории учебных занятий."
        rightSlot={
          <Button variant="outline" size="sm" onClick={resetChallengeDemo}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Сбросить прогресс к исходному</span>
          </Button>
        }
      />

      {/* Сводные метрики обучения */}
      <StatsGrid />

      {/* Соотношение правильных и неправильных ответов + Динамика освоения модулей */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Разбор точности ответов в тестировании (5 колонок) */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Результаты тестирования</CardTitle>
            <Badge variant={realAnsweredCount > 0 ? "emerald" : "outline"}>
              {realAnsweredCount > 0 ? "Активная сессия" : "Ожидает ответов"}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  Точность ответов в текущей сессии ({realAnsweredCount} из{" "}
                  {allQuestions.length} задач)
                </span>
                <span className="font-mono font-semibold text-teal-700 dark:text-teal-400">
                  {realAnsweredCount > 0 ? `${realAccuracyPct}%` : "0%"}
                </span>
              </div>
              <ProgressBar
                value={realAccuracyPct}
                label="Точность ответов в текущей сессии"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/40 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Верно (в сессии)</span>
                </div>
                <p className="mt-1 font-mono text-xl font-semibold text-emerald-900 dark:text-emerald-200">
                  {realCorrectCount}
                </p>
              </div>

              <div className="rounded-xl border border-rose-200/70 bg-rose-50/40 p-3.5 dark:border-rose-900/50 dark:bg-rose-950/20">
                <div className="flex items-center gap-1.5 text-xs font-medium text-rose-800 dark:text-rose-300">
                  <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Ошибки (в сессии)</span>
                </div>
                <p className="mt-1 font-mono text-xl font-semibold text-rose-900 dark:text-rose-200">
                  {realIncorrectCount}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 text-[11px] leading-relaxed text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
              <strong className="font-semibold text-slate-700 dark:text-slate-300">
                Справка по данным:{" "}
              </strong>
              выше отображаются только ваши реальные ответы из текущей сессии.
              Суммарный демонстрационный ориентир курса (Demo baseline):{" "}
              <span className="font-mono font-medium">
                {progress.correctAnswersCount} из {progress.questionsAnswered}{" "}
                ({progress.accuracyPercentage}%)
              </span>
              .
            </div>
          </CardContent>
        </Card>

        {/* Динамика обучения по учебным модулям и темам (7 колонок) */}
        <Card className="lg:col-span-7 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Динамика освоения учебных модулей и тем</CardTitle>
            <Link
              href="/app/learning"
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline dark:text-teal-400"
            >
              <span>К учебным модулям</span>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </CardHeader>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {modules.map((mod) => {
              const completedTopics = mod.topics.filter((t) =>
                progress.completedTopicIds.includes(t.id)
              ).length;
              const pct =
                mod.topics.length > 0
                  ? Math.round((completedTopics / mod.topics.length) * 100)
                  : progress.moduleProgressMap[mod.id] ??
                    mod.defaultProgressPercent;

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

      {/* Результаты отдельных тестов и история занятий */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 flex flex-col justify-between overflow-hidden">
          <div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>
                Результаты отдельных тестовых задач (текущая сессия)
              </CardTitle>
              <span className="font-mono text-xs text-slate-400">
                Ответов: {answeredChallengeList.length} / {allQuestions.length}
              </span>
            </CardHeader>

            {answeredChallengeList.length === 0 ? (
              <div className="p-6 text-xs leading-relaxed text-slate-500 dark:text-slate-400 space-y-3">
                <p>
                  В текущей сессии вы ещё не отвечали на клинические задачи.
                  Перейдите в раздел «Тестирование», чтобы решить задачи и
                  увидеть подробную статистику ответов.
                </p>
                <Link
                  href="/app/quiz"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-teal-600 px-3 text-xs font-medium text-white hover:bg-teal-700"
                >
                  <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Перейти к тестированию</span>
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
                        <Link
                          href="/app/quiz"
                          className="font-semibold text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-300"
                        >
                          {question ? question.title : entry.questionId}
                        </Link>
                        <span
                          className={
                            entry.isCorrect
                              ? "font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"
                              : "font-mono text-[11px] font-semibold text-rose-700 dark:text-rose-400"
                          }
                        >
                          Выбран вариант {entry.selectedOptionId} •{" "}
                          {entry.isCorrect ? "Верно" : "Неверно"}
                        </span>
                      </div>
                      {relatedDrug && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <Pill
                            className="h-3 w-3 text-teal-600 dark:text-teal-400"
                            aria-hidden="true"
                          />
                          <span>Связанный препарат:</span>
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
