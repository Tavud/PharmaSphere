"use client";

import React, { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, PlusCircle } from "lucide-react";
import {
  getAllLearningModules,
  getPharmacologicalGroupById,
} from "@/lib/data-service";
import { useAppState } from "@/features/preferences/app-state-context";
import { MilestoneBanner } from "@/components/ui/milestone-banner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DemoDisclaimer } from "@/components/ui/demo-disclaimer";
import { cn } from "@/lib/utils";

function LearningModulesContent() {
  const searchParams = useSearchParams();
  const selectedModuleId = searchParams.get("module");
  const modules = getAllLearningModules();
  const { progress, advanceModuleProgress } = useAppState();

  useEffect(() => {
    if (!selectedModuleId) return;
    const el = document.getElementById(selectedModuleId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedModuleId]);

  return (
    <Card className="divide-y divide-slate-100 dark:divide-slate-800">
      {modules.map((mod) => {
        const percent =
          progress.moduleProgressMap[mod.id] ?? mod.defaultProgressPercent;
        const relatedGroup = getPharmacologicalGroupById(mod.relatedGroupId);
        const isHighlighted = selectedModuleId === mod.id;
        const isCompleted = percent >= 100;

        return (
          <div
            key={mod.id}
            id={mod.id}
            className={cn(
              "p-4 space-y-3 transition-colors",
              isHighlighted && "bg-teal-50/40 dark:bg-teal-950/20"
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">
                    {mod.title}
                  </h2>
                  <Badge variant="teal">{mod.organSystem}</Badge>
                  <Badge variant="outline">{mod.difficulty}</Badge>
                  {isHighlighted && (
                    <Badge variant="emerald">Выбранный модуль</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {mod.subtitle}
                </p>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs font-semibold text-teal-700 dark:text-teal-400">
                  {percent}%
                </span>
                <p className="text-[11px] text-slate-400">
                  {mod.completedUnitsDefault}/{mod.totalUnits} тем • ~
                  {mod.estimatedMinutes} мин
                </p>
              </div>
            </div>

            <ProgressBar
              value={percent}
              label={`Прогресс модуля «${mod.title}»`}
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-12 pt-1">
              <div className="md:col-span-7 space-y-1">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Ключевые вопросы модуля:
                </p>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  {mod.learningObjectives.map((obj) => (
                    <li key={obj} className="flex items-start gap-1.5">
                      <CheckCircle2
                        className="mt-0.5 h-3 w-3 shrink-0 text-teal-600 dark:text-teal-400"
                        aria-hidden="true"
                      />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-5 flex flex-col justify-between gap-2 rounded-md border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="text-xs">
                  <span className="text-[11px] text-slate-400">
                    Текущая тема:
                  </span>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {mod.lastTopicTitle}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isCompleted}
                    onClick={() => advanceModuleProgress(mod.id, mod.title)}
                  >
                    <PlusCircle
                      className="h-3 w-3 text-teal-600 dark:text-teal-400"
                      aria-hidden="true"
                    />
                    <span>
                      {isCompleted ? "Завершен (100%)" : "Завершить тему (+15%)"}
                    </span>
                  </Button>

                  {relatedGroup && (
                    <Link
                      href={`/app/groups?group=${relatedGroup.id}`}
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <span>Фармгруппа</span>
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  )}

                  <Link
                    href="/app#daily-challenge"
                    className="inline-flex h-7 items-center gap-1 rounded-md bg-teal-600 px-2.5 text-xs font-medium text-white hover:bg-teal-700"
                  >
                    <span>Вопрос дня</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </Card>
  );
}

export default function LearningPage() {
  return (
    <div className="space-y-4">
      <MilestoneBanner
        sectionTitle="Обучение и практикум"
        milestoneTarget="3 демо-модуля"
        purposeDescription="Системные модули по фармакологии и клинические задачи для самопроверки."
      />

      <Suspense
        fallback={
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            Загрузка учебных модулей...
          </div>
        }
      >
        <LearningModulesContent />
      </Suspense>

      <DemoDisclaimer />
    </div>
  );
}
