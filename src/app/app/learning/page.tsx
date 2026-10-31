"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
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
  const {
    progress,
    preferences,
    isFavorite,
    toggleFavorite,
    advanceModuleProgress,
    toggleTopicCompletion,
  } = useAppState();

  // По умолчанию открываем первую незавершённую тему первого модуля для удобного чтения
  const [expandedTopicIds, setExpandedTopicIds] = useState<Record<string, boolean>>({
    "top-ans-3": true,
    "top-raas-2": true,
    "top-bb-1": true,
  });

  useEffect(() => {
    if (!selectedModuleId) return;
    const el = document.getElementById(selectedModuleId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedModuleId]);

  const toggleExpandTopic = (topicId: string) => {
    setExpandedTopicIds((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  return (
    <div className="space-y-6">
      {modules.map((mod) => {
        const completedInModule = mod.topics.filter((t) =>
          progress.completedTopicIds.includes(t.id)
        ).length;
        const percent =
          mod.topics.length > 0
            ? Math.round((completedInModule / mod.topics.length) * 100)
            : progress.moduleProgressMap[mod.id] ?? mod.defaultProgressPercent;

        const nextUnfinishedTopic = mod.topics.find(
          (t) => !progress.completedTopicIds.includes(t.id)
        );
        const relatedGroup = getPharmacologicalGroupById(mod.relatedGroupId);
        const isHighlighted = selectedModuleId === mod.id;
        const isCompleted = percent >= 100;
        const saved = isFavorite(mod.id);

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
                  {isCompleted && (
                    <Badge variant="emerald">Освоено (100%)</Badge>
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
                    Прогресс изучения:
                  </span>
                  <span className="font-mono text-sm font-semibold text-teal-700 dark:text-teal-400">
                    {percent}%
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      toggleFavorite({
                        entityId: mod.id,
                        entityType: "module",
                        title: mod.title,
                        subtitle: mod.subtitle,
                        href: `/app/learning?module=${mod.id}`,
                      })
                    }
                    aria-label={
                      saved
                        ? `Удалить модуль «${mod.title}» из избранного`
                        : `Добавить модуль «${mod.title}» в избранное`
                    }
                    className={cn(
                      "rounded-md p-1 transition-colors",
                      saved
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                    )}
                  >
                    <Bookmark
                      className={cn("h-4 w-4", saved && "fill-current")}
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <div className="w-44">
                  <ProgressBar
                    value={percent}
                    label={`Прогресс модуля «${mod.title}»`}
                  />
                </div>
                <span className="text-[11px] text-slate-400">
                  Изучено тем: {completedInModule} из {mod.topics.length} • ~
                  {mod.estimatedMinutes} мин
                </span>
              </div>
            </div>

            {/* Темы внутри модуля + Учебные цели и действия */}
            <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-12 lg:divide-x lg:divide-y-0 dark:divide-slate-800/80">
              {/* Список тем модуля с раскрываемым конспектом (7 колонок) */}
              <div className="p-5 sm:p-6 lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Темы и учебные конспекты ({mod.topics.length})
                  </p>
                  <span className="text-[11px] text-slate-400">
                    Нажмите на тему, чтобы открыть конспект
                  </span>
                </div>

                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white dark:divide-slate-800/80 dark:border-slate-800 dark:bg-slate-900">
                  {mod.topics.map((topic) => {
                    const topicDone = progress.completedTopicIds.includes(
                      topic.id
                    );
                    const isExpanded = Boolean(expandedTopicIds[topic.id]);

                    return (
                      <div key={topic.id} className="transition-colors">
                        <div className="flex items-start justify-between gap-3 px-4 py-3">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() =>
                                toggleTopicCompletion(
                                  mod.id,
                                  topic.id,
                                  topic.title,
                                  mod.title
                                )
                              }
                              aria-label={
                                topicDone
                                  ? `Снять отметку прохождения с темы «${topic.title}»`
                                  : `Отметить тему «${topic.title}» как изученную`
                              }
                              className="mt-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                            >
                              {topicDone ? (
                                <CheckCircle2
                                  className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400"
                                  aria-hidden="true"
                                />
                              ) : (
                                <Circle
                                  className="h-4 w-4 shrink-0 text-slate-300 hover:text-teal-500 dark:text-slate-600"
                                  aria-hidden="true"
                                />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleExpandTopic(topic.id)}
                              className="text-left space-y-0.5 min-w-0 flex-1 focus-visible:outline-none"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-xs font-semibold text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-300">
                                  Тема {topic.number}. {topic.title}
                                </p>
                                <Badge
                                  variant={topicDone ? "emerald" : "outline"}
                                  className="text-[10px]"
                                >
                                  {topicDone ? "Пройдено" : "К изучению"}
                                </Badge>
                              </div>
                              <p className="text-[11px] leading-normal text-slate-500 dark:text-slate-400">
                                {topic.summary}
                              </p>
                            </button>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-400">
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              <span>{topic.durationMinutes} мин</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => toggleExpandTopic(topic.id)}
                              aria-expanded={isExpanded}
                              aria-label={
                                isExpanded
                                  ? `Свернуть конспект темы ${topic.number}`
                                  : `Развернуть конспект темы ${topic.number}`
                              }
                              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Развернутый учебный материал темы */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3.5 pl-10 space-y-3 text-xs dark:border-slate-800/80 dark:bg-slate-950/50">
                            <div className="space-y-1.5 max-w-2xl">
                              <p className="font-semibold text-slate-800 dark:text-slate-200">
                                Основные положения темы:
                              </p>
                              <ul className="space-y-1.5 leading-relaxed text-slate-700 dark:text-slate-300">
                                {topic.keyPoints.map((pt) => (
                                  <li
                                    key={pt}
                                    className="flex items-start gap-2"
                                  >
                                    <span
                                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600"
                                      aria-hidden="true"
                                    />
                                    <span>{pt}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {preferences.showClinicalMnemonics &&
                              topic.clinicalNote && (
                                <div className="rounded-lg border border-teal-200/70 bg-teal-50/50 p-3 text-xs leading-relaxed text-slate-700 dark:border-teal-900/50 dark:bg-teal-950/30 dark:text-slate-300">
                                  <strong className="font-semibold text-teal-900 dark:text-teal-300">
                                    Клинический ориентир:{" "}
                                  </strong>
                                  {topic.clinicalNote}
                                </div>
                              )}

                            <div className="flex items-center justify-end pt-1">
                              <Button
                                variant={topicDone ? "outline" : "primary"}
                                size="sm"
                                onClick={() =>
                                  toggleTopicCompletion(
                                    mod.id,
                                    topic.id,
                                    topic.title,
                                    mod.title
                                  )
                                }
                              >
                                <CheckCircle2
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                <span>
                                  {topicDone
                                    ? "Отмечено как изученное"
                                    : "Отметить тему изученной"}
                                </span>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Учебные цели и продолжение с последнего места (5 колонок) */}
              <div className="flex flex-col justify-between p-5 sm:p-6 lg:col-span-5 space-y-4 bg-slate-50/30 dark:bg-slate-900/20">
                <div className="space-y-3">
                  {nextUnfinishedTopic && (
                    <div className="rounded-xl border border-teal-200/70 bg-teal-50/40 p-3.5 space-y-1.5 dark:border-teal-900/50 dark:bg-teal-950/25">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                        <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Продолжить с последнего места</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        Тема {nextUnfinishedTopic.number}.{" "}
                        {nextUnfinishedTopic.title}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedTopicIds((prev) => ({
                            ...prev,
                            [nextUnfinishedTopic.id]: true,
                          }))
                        }
                        className="text-[11px] font-medium text-teal-700 hover:underline dark:text-teal-400"
                      >
                        Открыть конспект темы →
                      </button>
                    </div>
                  )}

                  <div className="space-y-2 pt-1">
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
                        : nextUnfinishedTopic
                        ? `Завершить тему ${nextUnfinishedTopic.number} (+25%)`
                        : "Завершить следующую тему"}
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
        milestoneTarget="3 системных модуля • 12 тем • Demo"
        purposeDescription="Структурированные учебные курсы с конспектами тем, ключевыми механизмами и отслеживанием прогресса изучения."
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
