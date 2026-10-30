"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, HelpCircle, Pill, RotateCcw } from "lucide-react";
import { useAppState } from "@/features/preferences/app-state-context";
import { MilestoneBanner } from "@/components/ui/milestone-banner";
import { StatsGrid } from "@/features/dashboard/stats-grid";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="space-y-4">
      <MilestoneBanner
        sectionTitle="Прогресс обучения"
        milestoneTarget="Демо-прогресс • localStorage"
        purposeDescription="Сводка точности ответов, освоения учебных модулей по системам органов и журнал решенных задач в текущей сессии."
        rightSlot={
          <Button variant="outline" size="sm" onClick={resetChallengeDemo}>
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>Сбросить демо-прогресс</span>
          </Button>
        }
      />

      <StatsGrid />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Освоение учебных модулей (Демо-показатели)</CardTitle>
          </CardHeader>
          <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
            {modules.map((mod) => {
              const pct =
                progress.moduleProgressMap[mod.id] ?? mod.defaultProgressPercent;
              return (
                <div key={mod.id} className="px-4 py-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <Link
                      href={`/app/learning?module=${mod.id}`}
                      className="font-semibold text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-300"
                    >
                      {mod.title}
                    </Link>
                    <span className="font-mono text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                      {pct}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{mod.organSystem}</span>
                    <span>
                      {mod.totalUnits} разделов • {mod.estimatedMinutes} мин
                    </span>
                  </div>
                  <ProgressBar value={pct} label={mod.title} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="flex flex-col justify-between overflow-hidden">
          <div>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Журнал ответов на «Вопрос дня»</CardTitle>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  Сессия: {answeredChallengeList.length}
                </span>
              </div>
            </CardHeader>

            {answeredChallengeList.length === 0 ? (
              <div className="p-4 text-xs text-slate-500 dark:text-slate-400">
                В текущей сессии вы еще не отвечали на «Вопрос дня по
                фармакологии». Решите клиническую задачу на странице «Обзор»,
                чтобы запись появилась в журнале.
              </div>
            ) : (
              <ul className="divide-y divide-slate-200/80 text-xs dark:divide-slate-800/80">
                {answeredChallengeList.map((entry) => {
                  const question = getQuizQuestionById(entry.questionId);
                  const relatedDrug = question
                    ? getDrugById(question.relatedDrugId)
                    : undefined;

                  return (
                    <li key={entry.questionId} className="px-4 py-3 space-y-1">
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

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 bg-slate-50/50 px-4 py-2.5 dark:border-slate-800/80 dark:bg-slate-900/40">
            <Link
              href="/app#daily-challenge"
              className="inline-flex h-7 items-center gap-1.5 rounded-md bg-teal-700 px-2.5 text-xs font-medium text-white hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>К вопросу дня</span>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>

            <Button variant="ghost" size="sm" onClick={resetChallengeDemo}>
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              <span>Сбросить</span>
            </Button>
          </div>
        </Card>
      </div>

      <DemoDisclaimer />
    </div>
  );
}
