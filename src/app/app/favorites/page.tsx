"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Layers,
  Pill,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useAppState } from "@/features/preferences/app-state-context";
import { MilestoneBanner } from "@/components/ui/milestone-banner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoDisclaimer } from "@/components/ui/demo-disclaimer";

export default function FavoritesPage() {
  const {
    favorites,
    toggleFavorite,
    restoreDefaultFavorites,
    recordStudyActivity,
  } = useAppState();

  return (
    <div className="space-y-4">
      <MilestoneBanner
        sectionTitle="Избранное"
        milestoneTarget={`Сохранено: ${favorites.length}`}
        purposeDescription="Отмеченные закладками препараты и фармакологические группы для быстрого повторения перед занятием или коллоквиумом."
        rightSlot={
          <Button variant="outline" size="sm" onClick={restoreDefaultFavorites}>
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>Восстановить демо-список</span>
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Bookmark
                className="h-4 w-4 text-teal-700 dark:text-teal-400"
                aria-hidden="true"
              />
              <CardTitle>Сохраненные материалы ({favorites.length})</CardTitle>
            </div>
            <Badge variant="outline">Локальное хранилище браузера</Badge>
          </div>
        </CardHeader>

        {favorites.length === 0 ? (
          <div className="p-6 text-center space-y-2.5">
            <Bookmark
              className="mx-auto h-6 w-6 text-slate-400"
              aria-hidden="true"
            />
            <p className="text-[13px] font-semibold text-slate-900 dark:text-white">
              Список избранного пуст
            </p>
            <p className="mx-auto max-w-md text-xs text-slate-500 dark:text-slate-400">
              Нажмите на значок закладки на любой карточке препарата или группы,
              чтобы сохранить материал здесь, либо восстановите начальную
              демо-подборку.
            </p>
            <div className="pt-1 flex flex-wrap justify-center gap-2">
              <Link
                href="/app/drugs"
                className="inline-flex h-7 items-center gap-1.5 rounded-md bg-teal-700 px-3 text-xs font-medium text-white hover:bg-teal-800"
              >
                <span>Открыть справочник препаратов</span>
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={restoreDefaultFavorites}
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                <span>Вернуть демо-избранное</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
            {favorites.map((item) => {
              const isDrug = item.entityType === "drug";
              const handleOpenFavorite = () => {
                recordStudyActivity({
                  entityId: item.entityId,
                  itemType: isDrug ? "drug" : "group",
                  title: item.title,
                  categoryLabel: isDrug
                    ? "Карточка препарата"
                    : "Фармакологическая группа",
                  href: item.href,
                  timestampLabel: "Открыто из «Избранного»",
                });
              };

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-50 text-teal-700 dark:border-slate-800 dark:bg-slate-800 dark:text-teal-400">
                      {isDrug ? (
                        <Pill className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Link
                          href={item.href}
                          onClick={handleOpenFavorite}
                          className="text-[13px] font-semibold text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-300"
                        >
                          {item.title}
                        </Link>
                        <Badge variant="default">
                          {isDrug ? "Препарат" : "Фармгруппа"}
                        </Badge>
                        {item.isDefaultDemo && (
                          <Badge variant="outline">Демо-пример</Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Link
                      href={item.href}
                      onClick={handleOpenFavorite}
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:border-teal-500/40 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-teal-300"
                    >
                      <span>Открыть</span>
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        toggleFavorite({
                          entityId: item.entityId,
                          entityType: item.entityType,
                          title: item.title,
                          subtitle: item.subtitle,
                          href: item.href,
                        })
                      }
                      aria-label={`Удалить «${item.title}» из избранного`}
                      className="h-7 w-7 px-0 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <DemoDisclaimer />
    </div>
  );
}
