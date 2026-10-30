"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { getAllLearningModules } from "@/lib/data-service";
import { useAppState } from "@/features/preferences/app-state-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";

export function ContinueLearningCard() {
  const modules = getAllLearningModules();
  const { progress, recordStudyActivity } = useAppState();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <GraduationCap
            className="h-4 w-4 text-teal-600 dark:text-teal-400"
            aria-hidden="true"
          />
          <CardTitle>Продолжить обучение</CardTitle>
        </div>
        <Link
          href="/app/learning"
          className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-400"
        >
          <span>Все модули</span>
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {modules.map((mod) => {
            const percent =
              progress.moduleProgressMap[mod.id] ?? mod.defaultProgressPercent;
            const moduleHref = `/app/learning?module=${mod.id}`;

            return (
              <div
                key={mod.id}
                className="flex flex-col gap-2.5 px-5 py-3.5 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
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
                        className="text-[13.5px] font-semibold text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-300"
                      >
                        {mod.title}
                      </Link>
                      <Badge variant="default" className="text-[10px]">
                        {mod.organSystem}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
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
                    Перейти →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
