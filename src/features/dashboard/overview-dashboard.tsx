"use client";

import React from "react";
import { useAppState } from "@/features/preferences/app-state-context";
import { GlobalSearchInline } from "@/components/layout/global-search";
import { StatsGrid } from "@/features/dashboard/stats-grid";
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
    <div className="space-y-4">
      {/* 1. Компактная шапка страницы «Обзор» + встроенный глобальный поиск */}
      <header className="flex flex-col justify-between gap-3 border-b border-slate-200/80 pb-3.5 lg:flex-row lg:items-center dark:border-slate-800">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-900 dark:text-white">
            Обзор
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {customName
              ? `${customName} • ${preferences.studyTrackLabel}`
              : preferences.studyTrackLabel}
          </p>
        </div>

        <div className="w-full lg:max-w-md">
          <GlobalSearchInline />
        </div>
      </header>

      {/* 2. Компактная сводная полоса учебной активности */}
      <StatsGrid />

      {/* 3. Основная двухколоночная рабочая сетка */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Левая колонка: Продолжить обучение + Недавно изученные */}
        <div className="space-y-4 lg:col-span-7">
          <ContinueLearningCard />
          <RecentlyStudiedCard />
        </div>

        {/* Правая колонка: Вопрос дня по фармакологии + Быстрые действия */}
        <div className="space-y-4 lg:col-span-5">
          <DailyChallengeCard />
          <QuickActionsCard />
        </div>
      </div>

      {/* 4. Компактная таблица эталонных препаратов */}
      <FeaturedDrugsCard />

      {/* 5. Компактное медицинское уведомление о демо-режиме */}
      <DemoDisclaimer />
    </div>
  );
}
