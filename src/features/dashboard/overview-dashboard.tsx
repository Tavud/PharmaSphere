"use client";

import React from "react";
import { useAppState } from "@/features/preferences/app-state-context";
import { GlobalSearchInline } from "@/components/layout/global-search";
import { ContinueLearningCard } from "@/features/dashboard/continue-learning-card";
import { DailyChallengeCard } from "@/features/dashboard/daily-challenge-card";
import { FeaturedDrugsCard } from "@/features/dashboard/featured-drugs-card";
import { RecentlyStudiedCard } from "@/features/dashboard/recently-studied-card";
import { QuickActionsCard } from "@/features/dashboard/quick-actions-card";
import { DemoDisclaimer } from "@/components/ui/demo-disclaimer";

export function OverviewDashboard() {
  const { preferences } = useAppState();
  const customName = preferences.displayName.trim();

  return (
    <div className="space-y-6">
      {/* 1. Верхняя часть: приветствие, заголовок «Рабочее пространство», пояснение и единый поиск */}
      <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6 dark:border-slate-800/80 dark:bg-slate-900">
        <div className="max-w-2xl space-y-1.5">
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            {customName
              ? `Добро пожаловать, ${customName} • ${preferences.studyTrackLabel}`
              : `Добро пожаловать в PharmaSphere • ${preferences.studyTrackLabel}`}
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            Рабочее пространство
          </h1>
          <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
            Клинический справочник препаратов, систематизированные учебные
            модули и тренажёр задач по фармакологии.
          </p>
        </div>

        <div className="mt-4 max-w-2xl">
          <GlobalSearchInline />
        </div>
      </section>

      {/* 2. Быстрые действия (4 основных сценария) */}
      <QuickActionsCard />

      {/* 3. Основной контент: логичные секции с визуальным приоритетом */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Левая колонка (7/12): Продолжить обучение + Рекомендованные учебные материалы */}
        <div className="space-y-6 lg:col-span-7">
          <ContinueLearningCard />
          <FeaturedDrugsCard />
        </div>

        {/* Правая колонка (5/12): Вопрос дня + Недавно изученные препараты */}
        <div className="space-y-6 lg:col-span-5">
          <DailyChallengeCard />
          <RecentlyStudiedCard />
        </div>
      </div>

      {/* 4. Сдержанное уведомление о демонстрационном режиме */}
      <DemoDisclaimer />
    </div>
  );
}
