"use client";

import React, { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Clock,
  PlusCircle,
} from "lucide-react";
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
    <div className="space-y-6">
      {modules.map((mod) => {
        const percent =
          progress.moduleProgressMap[mod.id] ?? mod.defaultProgressPercent;
        const relatedGroup = getPharmacologicalGroupById(mod.relatedGroupId);
        const isHighlighted = selectedModuleId === mod.id;
        const isCompleted = percent >= 100;
        const completedTopicsCount = Math.min(
          mod.topics.length,
          Math.max(1, Math.round((percent / 100) * mod.topics.length))
        );

        return (
          <Card
            key={mod.id}
            id={mod.id}
            className={cn(
              "overflow-hidden transition-colors",
              isHighlighted &&
                "ring-2 ring-teal-500/40 dark:ring-teal-400/40"
            )}
          >
            {/* Шапка модуля */}
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:p-6 dark:border-slate-800/80">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="teal">{mod.organSystem}</Badge>
                  <Badge variant="outline">{mod.difficulty}</Badge>
                  {isHighlighted && (
                    <Badge variant="emerald">Активный модуль</Badge>
                  )}
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                  {mod.title}
                </h2>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {mod.subtitle}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Прогресс прохождения:
                  </span>
                  <span className="font-mono text-sm font-semibold text-teal-700 dark:text-teal-400">
                    {percent}%
                  </span>
                </div>
                <div className="w-44">
                  <ProgressBar
                    value={percent}
                    label={`Прогресс модуля «${mod.title}»`}
                  />
                </div>
                <span className="text-[11px] text-slate-400">
                  Темы: {completedTopicsCount} из {mod.topics.length} • ~
                  {mod.estimatedMinutes} мин
                </span>
              </div>
            </div>

            {/* Темы внутри модуля + Цели и действия */}
            <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-12 lg:divide-x lg:divide-y-0 dark:divide-slate-800/80">
              {/* Список тем модуля (7 колонок) */}
              <div className="p-5 sm:p-6 lg:col-span-7 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Темы внутри модуля ({mod.topics.length})
                </p>

                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-slate-50/40 dark:divide-slate-800/80 dark:border-slate-800 dark:bg-slate-900/40">
                  {mod.topics.map((topic, idx) => {
                    const topicDone = idx < completedTopicsCount;
                    return (
                      <div
                        key={topic.id}
                        className="flex items-start justify-between gap-3 px-4 py-3"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          {topicDone ? (
                            <CheckCircle2
                              className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400"
                              aria-label="Тема пройдена"
                            />
                          ) : (
                            <Circle
                              className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600"
                              aria-label="Тема ожидает изучения"
                            />
                          )}
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                              Тема {topic.number}. {topic.title}
                            </p>
                            <p className="text-[11px] leading-normal text-slate-500 dark:text-slate-400">
                              {topic.summary}
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] text-slate-400">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          <span>{topic.durationMinutes} мин</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Учебные цели и переход к изучению (5 колонок) */}
              <div className="flex flex-col justify-between p-5 sm:p-6 lg:col-span-5 space-y-4 bg-slate-50/30 dark:bg-slate-900/20">
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Ключевые компетенции модуля
                  </p>
                  <ul className="space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {mod.learningObjectives.map((obj) => (
                      <li key={obj} className="flex items-start gap-2">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600"
                          aria-hidden="true"
                        />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5 border-t border-slate-200/70 pt-4 dark:border-slate-800">
                  <Button
                    variant="primary"
                    size="md"
                    disabled={isCompleted}
                    onClick={() => advanceModuleProgress(mod.id, mod.title)}
                    className="w-full"
                  >
                    <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {isCompleted
                        ? "Модуль полностью освоен (100%)"
                        : "Изучить следующую тему (+15%)"}
                    </span>
                  </Button>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {relatedGroup && (
                      <Link
                        href={`/app/groups?group=${relatedGroup.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300"
                      >
                        <span>Профиль фармгруппы</span>
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    )}

                    <Link
                      href="/app/quiz"
                      className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline dark:text-teal-400"
                    >
                      <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Перейти к тестированию</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default function LearningPage() {
  return (
    <div className="space-y-6">
      <MilestoneBanner
        sectionTitle="Учебные модули"
        milestoneTarget="3 системных модуля • Demo"
        purposeDescription="Структурированные учебные курсы по механизмам действия, рецепторной трансдукции и клинической фармакологии."
        rightSlot={
          <Link
            href="/app/quiz"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-teal-600 px-3 text-xs font-medium text-white transition-colors hover:bg-teal-700"
          >
            <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Тестирование</span>
          </Link>
        }
      />

      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
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
