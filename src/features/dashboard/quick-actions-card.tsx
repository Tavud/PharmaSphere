"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ClipboardCheck,
  GraduationCap,
  Layers,
  Pill,
} from "lucide-react";

const QUICK_ACTIONS = [
  {
    id: "qa-find-drug",
    title: "Найти препарат",
    description: "Поиск по МНН, торговым названиям и мишеням",
    href: "/app/drugs",
    icon: Pill,
  },
  {
    id: "qa-open-groups",
    title: "Открыть фармакологические группы",
    description: "Системная классификация и механизмы",
    href: "/app/groups",
    icon: Layers,
  },
  {
    id: "qa-continue-learning",
    title: "Продолжить обучение",
    description: "Тематические модули и конспекты",
    href: "/app/learning",
    icon: GraduationCap,
  },
  {
    id: "qa-take-quiz",
    title: "Пройти тест",
    description: "Клинические задачи с разбором ответов",
    href: "/app/quiz",
    icon: ClipboardCheck,
  },
] as const;

export function QuickActionsCard() {
  return (
    <section aria-label="Быстрые действия">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className="group flex flex-col justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all hover:border-teal-500/40 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-800/80 dark:bg-slate-900 dark:hover:border-teal-500/40"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700 transition-colors group-hover:bg-teal-600 group-hover:text-white dark:bg-teal-950/60 dark:text-teal-300 dark:group-hover:bg-teal-600 dark:group-hover:text-white">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <ArrowUpRight
                  className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-teal-600 dark:text-slate-600 dark:group-hover:text-teal-400"
                  aria-hidden="true"
                />
              </div>

              <div className="space-y-0.5">
                <h2 className="text-[13.5px] font-semibold text-slate-900 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-300">
                  {action.title}
                </h2>
                <p className="text-xs leading-snug text-slate-500 dark:text-slate-400">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
