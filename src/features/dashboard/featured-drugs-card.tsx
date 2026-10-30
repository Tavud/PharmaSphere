"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Bookmark, BookOpen } from "lucide-react";
import { getFeaturedDrugs } from "@/lib/data-service";
import { useAppState } from "@/features/preferences/app-state-context";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Компактный блок «Рекомендованные учебные материалы» для рабочего пространства `/app`.
 */
export function FeaturedDrugsCard() {
  const featuredDrugs = getFeaturedDrugs();
  const { isFavorite, toggleFavorite, recordStudyActivity } = useAppState();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <BookOpen
            className="h-4 w-4 text-teal-600 dark:text-teal-400"
            aria-hidden="true"
          />
          <CardTitle>Рекомендованные учебные материалы</CardTitle>
          <Badge variant="outline" className="text-[10px]">
            Базовые монографии
          </Badge>
        </div>

        <Link
          href="/app/drugs"
          className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-400"
        >
          <span>Каталог препаратов</span>
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </CardHeader>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {featuredDrugs.map((drug) => {
          const saved = isFavorite(drug.id);
          const drugHref = `/app/drugs/${drug.id}`;

          return (
            <div
              key={drug.id}
              className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={drugHref}
                    onClick={() =>
                      recordStudyActivity({
                        entityId: drug.id,
                        itemType: "drug",
                        title: `${drug.genericName} — ${drug.pharmacologicalClass}`,
                        categoryLabel: "Карточка препарата",
                        href: drugHref,
                        timestampLabel:
                          "Открыто из рекомендованных материалов",
                      })
                    }
                    className="text-[13.5px] font-semibold text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-300"
                  >
                    {drug.genericName}
                  </Link>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {drug.tradeNames.join(", ")}
                  </span>
                </div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {drug.pharmacologicalClass} • Мишень:{" "}
                  <span className="font-mono text-[11px]">
                    {drug.primaryTarget}
                  </span>
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    toggleFavorite({
                      entityId: drug.id,
                      entityType: "drug",
                      title: drug.genericName,
                      subtitle: drug.pharmacologicalClass,
                      href: drugHref,
                    })
                  }
                  aria-label={
                    saved
                      ? `Удалить «${drug.genericName}» из избранного`
                      : `Добавить «${drug.genericName}» в избранное`
                  }
                  className={cn(
                    "rounded-md p-1.5 transition-colors",
                    saved
                      ? "text-teal-600 dark:text-teal-400"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                  )}
                >
                  <Bookmark
                    className={cn("h-3.5 w-3.5", saved && "fill-current")}
                    aria-hidden="true"
                  />
                </button>

                <Link
                  href={drugHref}
                  onClick={() =>
                    recordStudyActivity({
                      entityId: drug.id,
                      itemType: "drug",
                      title: `${drug.genericName} — ${drug.pharmacologicalClass}`,
                      categoryLabel: "Карточка препарата",
                      href: drugHref,
                      timestampLabel:
                        "Открыто из рекомендованных материалов",
                    })
                  }
                  className="text-xs font-medium text-teal-700 hover:underline dark:text-teal-400"
                >
                  Изучить →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
