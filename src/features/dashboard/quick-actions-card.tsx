"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  GraduationCap,
  Layers,
  Pill,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const QUICK_ACTIONS = [
  {
    id: "qa-drug-reference",
    title: "Справочник препаратов",
    meta: "7 демо-монографий",
    href: "/app/drugs",
    icon: Pill,
  },
  {
    id: "qa-pharmacology-groups",
    title: "Фармакологические группы",
    meta: "6 классов и мишеней",
    href: "/app/groups",
    icon: Layers,
  },
  {
    id: "qa-start-quiz",
    title: "Учебные модули и тесты",
    meta: "3 темы практикума",
    href: "/app/learning",
    icon: GraduationCap,
  },
  {
    id: "qa-review-favorites",
    title: "Избранные материалы",
    meta: "Быстрое повторение",
    href: "/app/favorites",
    icon: Bookmark,
  },
] as const;

export function QuickActionsCard() {
  return (
    <Card>
      <CardHeader className="py-2.5 px-4">
        <CardTitle>Быстрые действия</CardTitle>
      </CardHeader>

      <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-slate-800/80">
        {QUICK_ACTIONS.slice(0, 2).map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className="group flex items-center justify-between gap-2.5 px-3.5 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-300">
                    {action.title}
                  </p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {action.meta}
                  </p>
                </div>
              </div>
              <ArrowRight
                className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-teal-600"
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 divide-y divide-slate-100 border-t border-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:border-slate-800/80 dark:divide-slate-800/80">
        {QUICK_ACTIONS.slice(2, 4).map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className="group flex items-center justify-between gap-2.5 px-3.5 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-300">
                    {action.title}
                  </p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {action.meta}
                  </p>
                </div>
              </div>
              <ArrowRight
                className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-teal-600"
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
