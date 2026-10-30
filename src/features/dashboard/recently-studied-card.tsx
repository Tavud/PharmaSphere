"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Clock, Trash2 } from "lucide-react";
import { useAppState } from "@/features/preferences/app-state-context";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeSessionTime } from "@/lib/utils";

export function RecentlyStudiedCard() {
  const { recentItems, hasUserSessionHistory, clearSessionHistory } =
    useAppState();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Clock
            className="h-4 w-4 text-teal-600 dark:text-teal-400"
            aria-hidden="true"
          />
          <CardTitle>Недавно изученные препараты</CardTitle>
          {!hasUserSessionHistory && (
            <Badge variant="outline" className="text-[10px]">
              Demo
            </Badge>
          )}
        </div>

        {hasUserSessionHistory && (
          <button
            type="button"
            onClick={clearSessionHistory}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-600 dark:text-slate-500"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
            <span>Очистить</span>
          </button>
        )}
      </CardHeader>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {recentItems.slice(0, 4).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-slate-900 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-300">
                {item.title}
              </p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {item.categoryLabel} •{" "}
                {item.isSeededDemoEntry
                  ? item.timestampLabel
                  : formatRelativeSessionTime(item.recordedAtIso)}
              </p>
            </div>

            <ArrowUpRight
              className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-teal-600 dark:text-slate-600 dark:group-hover:text-teal-400"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </Card>
  );
}
