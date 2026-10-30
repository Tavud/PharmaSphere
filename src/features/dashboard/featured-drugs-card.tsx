"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Bookmark } from "lucide-react";
import { getFeaturedDrugs } from "@/lib/data-service";
import { useAppState } from "@/features/preferences/app-state-context";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function FeaturedDrugsCard() {
  const featuredDrugs = getFeaturedDrugs();
  const { isFavorite, toggleFavorite, recordStudyActivity } = useAppState();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2.5 px-4">
        <div className="flex items-center gap-2">
          <CardTitle>Популярные препараты</CardTitle>
          <Badge variant="outline" className="text-[10px]">
            Эталонные профили (Демо)
          </Badge>
        </div>

        <Link
          href="/app/drugs"
          className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 dark:text-teal-400"
        >
          <span>Весь каталог (7)</span>
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
              <th className="px-4 py-2 font-medium">Препарат (МНН)</th>
              <th className="px-4 py-2 font-medium">Фармакологический класс</th>
              <th className="hidden md:table-cell px-4 py-2 font-medium">
                Первичная мишень
              </th>
              <th className="hidden lg:table-cell px-4 py-2 font-medium">
                Система органов
              </th>
              <th className="px-4 py-2 text-right font-medium">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {featuredDrugs.map((drug) => {
              const saved = isFavorite(drug.id);
              const drugHref = `/app/drugs/${drug.id}`;

              return (
                <tr
                  key={drug.id}
                  className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-slate-100">
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
                            "Открыто из таблицы «Популярные препараты»",
                        })
                      }
                      className="hover:text-teal-700 hover:underline dark:hover:text-teal-300"
                    >
                      {drug.genericName}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                    {drug.pharmacologicalClass}
                  </td>
                  <td className="hidden md:table-cell px-4 py-2.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {drug.primaryTarget}
                  </td>
                  <td className="hidden lg:table-cell px-4 py-2.5">
                    <Badge variant="default" className="text-[10px]">
                      {drug.organSystem}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
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
                          "rounded p-1 transition-colors",
                          saved
                            ? "text-teal-700 dark:text-teal-300"
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
                              "Открыто из таблицы «Популярные препараты»",
                          })
                        }
                        className="font-medium text-teal-700 hover:underline dark:text-teal-400"
                      >
                        Профиль →
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
