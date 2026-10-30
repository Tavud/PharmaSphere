"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllLearningModules } from "@/lib/data-service";
import { useAppState } from "@/features/preferences/app-state-context";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";

export function ContinueLearningCard() {
  const modules = getAllLearningModules();
  const { progress, recordStudyActivity } = useAppState();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2.5 px-4">
        <div className="flex items-center gap-2">
          <CardTitle>Продолжить обучение</CardTitle>
          <Badge variant="outline" className="text-[10px]">
            3 модуля
          </Badge>
        </div>
        <Link
          href="/app/learning"
          className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-400"
        >
          <span>Все модули</span>
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </CardHeader>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {modules.map((mod) => {
          const percent =
            progress.moduleProgressMap[mod.id] ?? mod.defaultProgressPercent;
          const moduleHref = `/app/learning?module=${mod.id}`;

          return (
            <div
              key={mod.id}
              className="group flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link
                      href={moduleHref}
                      onClick={() =>
                        recordStudyActivity({
                          entityId: mod.id,
                          itemType: "module",
                          title: mod.title,
                          categoryLabel: "Учебный модуль",
                          href: moduleHref,
                          timestampLabel: `Продолжен модуль (${percent}%)`,
                        })
                      }
                      className="text-[13px] font-semibold text-slate-900 group-hover:text-teal-700 focus-visible:outline-none focus-visible:underline dark:text-slate-100 dark:group-hover:text-teal-300"
                    >
                      {mod.title}
                    </Link>
                    <Badge variant="default" className="text-[10px]">
                      {mod.organSystem}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                    {mod.lastTopicTitle}
                  </p>
                </div>

                <span className="shrink-0 font-mono text-xs font-semibold text-teal-700 dark:text-teal-400">
                  {percent}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <ProgressBar
                    value={percent}
                    label={`Прогресс модуля «${mod.title}»`}
                  />
                </div>
                <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500">
                  {mod.completedUnitsDefault}/{mod.totalUnits} тем • ~
                  {mod.estimatedMinutes} мин
                </span>
                <Link
                  href={moduleHref}
                  onClick={() =>
                    recordStudyActivity({
                      entityId: mod.id,
                      itemType: "module",
                      title: mod.title,
                      categoryLabel: "Учебный модуль",
                      href: moduleHref,
                      timestampLabel: `Открыта ${mod.lastTopicTitle}`,
                    })
                  }
                  className="shrink-0 text-xs font-medium text-teal-700 hover:underline dark:text-teal-400"
                >
                  Открыть →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
