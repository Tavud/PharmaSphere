"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowUpDown,
  Bookmark,
  Pill,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import {
  getAllPharmacologicalGroups,
  getDrugsByGroupId,
  getPharmacologicalGroupById,
} from "@/lib/data-service";
import { useAppState } from "@/features/preferences/app-state-context";
import { MilestoneBanner } from "@/components/ui/milestone-banner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoDisclaimer } from "@/components/ui/demo-disclaimer";
import { cn } from "@/lib/utils";

type GroupSortMode = "alpha-asc" | "alpha-desc" | "system";

function GroupsDirectoryContent() {
  const searchParams = useSearchParams();
  const highlightedGroupId = searchParams.get("group");
  const groups = getAllPharmacologicalGroups();
  const { isFavorite, toggleFavorite, recordStudyActivity } = useAppState();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSystem, setSelectedSystem] = useState<string>("all");
  const [sortMode, setSortMode] = useState<GroupSortMode>("alpha-asc");

  const organSystems = useMemo(() => {
    const systems = new Set<string>();
    for (const grp of groups) {
      systems.add(grp.organSystem);
    }
    return Array.from(systems);
  }, [groups]);

  useEffect(() => {
    if (!highlightedGroupId) return;
    const matchedGroup = getPharmacologicalGroupById(highlightedGroupId);
    if (matchedGroup) {
      recordStudyActivity({
        entityId: matchedGroup.id,
        itemType: "group",
        title: matchedGroup.name,
        categoryLabel: "Фармакологическая группа",
        href: `/app/groups?group=${matchedGroup.id}`,
        timestampLabel: "Просмотрена фармакологическая группа",
      });
    }
    const el = document.getElementById(highlightedGroupId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedGroupId, recordStudyActivity]);

  const highlightedGroup = highlightedGroupId
    ? getPharmacologicalGroupById(highlightedGroupId)
    : undefined;

  const filteredAndSortedGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = groups.filter((group) => {
      if (selectedSystem !== "all" && group.organSystem !== selectedSystem) {
        return false;
      }

      if (!q) return true;

      const matchesName =
        group.name.toLowerCase().includes(q) ||
        group.shortName.toLowerCase().includes(q);
      const matchesTarget = group.primaryTarget.toLowerCase().includes(q);
      const matchesMech =
        group.mechanismSummary.toLowerCase().includes(q) ||
        group.clinicalOverview.toLowerCase().includes(q);
      const matchesClassification = group.classification.some((c) =>
        c.toLowerCase().includes(q)
      );
      const matchesRep = group.keyRepresentatives.some((r) =>
        r.toLowerCase().includes(q)
      );

      return (
        matchesName ||
        matchesTarget ||
        matchesMech ||
        matchesClassification ||
        matchesRep
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "alpha-asc") {
        return a.name.localeCompare(b.name, "ru");
      }
      if (sortMode === "alpha-desc") {
        return b.name.localeCompare(a.name, "ru");
      }
      const sysCmp = a.organSystem.localeCompare(b.organSystem, "ru");
      if (sysCmp !== 0) return sysCmp;
      return a.name.localeCompare(b.name, "ru");
    });
  }, [groups, searchQuery, selectedSystem, sortMode]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || selectedSystem !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedSystem("all");
    setSortMode("alpha-asc");
  };

  return (
    <div className="space-y-5">
      {highlightedGroup && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-teal-200 bg-teal-50/70 px-4 py-2.5 text-xs text-teal-900 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-200">
          <span>
            Выбрана группа: <strong>{highlightedGroup.name}</strong>
          </span>
          <Link
            href="/app/groups"
            className="inline-flex items-center gap-1 rounded-md border border-teal-300 bg-white px-2.5 py-1 text-[11px] font-medium text-teal-800 hover:bg-teal-50 dark:border-teal-700 dark:bg-slate-900 dark:text-teal-300"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            <span>Снять выделение</span>
          </Link>
        </div>
      )}

      {/* Панель поиска, сортировки и фильтрации по системам органов */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Поиск фармакологической группы"
              placeholder="Поиск группы по названию (иАПФ, бета-блокаторы), мишени (NKCC2, АПФ) или представителю..."
              className="h-9 w-full rounded-lg border border-slate-200/90 bg-slate-50/50 pl-9 pr-8 text-[13px] text-slate-900 placeholder:text-slate-400 transition-colors focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Очистить поиск"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-slate-50/70 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
              <ArrowUpDown
                className="h-3.5 w-3.5 text-slate-400"
                aria-hidden="true"
              />
              <label
                htmlFor="group-sort-select"
                className="text-[11px] font-medium"
              >
                Сортировка:
              </label>
              <select
                id="group-sort-select"
                value={sortMode}
                onChange={(e) =>
                  setSortMode(e.target.value as GroupSortMode)
                }
                className="bg-transparent font-medium text-slate-900 focus:outline-none dark:text-white"
              >
                <option value="alpha-asc" className="dark:bg-slate-900">
                  По названию (А → Я)
                </option>
                <option value="alpha-desc" className="dark:bg-slate-900">
                  По названию (Я → А)
                </option>
                <option value="system" className="dark:bg-slate-900">
                  По системе органов
                </option>
              </select>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                <span>Сбросить</span>
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Фильтр по системе органов:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedSystem("all")}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                selectedSystem === "all"
                  ? "border-teal-600 bg-teal-50/90 text-teal-900 dark:border-teal-500 dark:bg-teal-950/60 dark:text-teal-200"
                  : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              Все системы ({groups.length})
            </button>
            {organSystems.map((sys) => (
              <button
                key={sys}
                type="button"
                onClick={() =>
                  setSelectedSystem((prev) => (prev === sys ? "all" : sys))
                }
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                  selectedSystem === sys
                    ? "border-teal-600 bg-teal-50/90 text-teal-900 dark:border-teal-500 dark:bg-teal-950/60 dark:text-teal-200"
                    : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                )}
              >
                {sys}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {filteredAndSortedGroups.length === 0 ? (
        <Card className="p-8 text-center space-y-2.5">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Фармакологические группы не найдены
          </p>
          <p className="mx-auto max-w-md text-xs text-slate-500 dark:text-slate-400">
            Попробуйте изменить запрос или сбросить фильтр по системе органов.
          </p>
          <div className="pt-1">
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Показать все группы</span>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedGroups.map((group) => {
            const memberDrugs = getDrugsByGroupId(group.id);
            const isHighlighted = highlightedGroupId === group.id;
            const saved = isFavorite(group.id);
            const groupHref = `/app/groups?group=${group.id}`;

            return (
              <Card
                key={group.id}
                id={group.id}
                className={cn(
                  "overflow-hidden transition-colors",
                  isHighlighted &&
                    "ring-2 ring-teal-500/40 dark:ring-teal-400/40"
                )}
              >
                <div className="border-b border-slate-100 p-5 sm:p-6 dark:border-slate-800/80">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                          {group.name}
                        </h2>
                        <Badge variant="teal">{group.organSystem}</Badge>
                        {isHighlighted && (
                          <Badge variant="emerald">Выбрано</Badge>
                        )}
                      </div>
                      <p className="font-mono text-xs text-teal-700 dark:text-teal-400">
                        Первичная мишень: {group.primaryTarget}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/app/drugs?group=${group.id}`}
                        className="inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200/90 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:border-teal-500/40 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      >
                        <span>В каталоге ({memberDrugs.length})</span>
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          toggleFavorite({
                            entityId: group.id,
                            entityType: "group",
                            title: group.name,
                            subtitle: `${group.organSystem} • ${group.shortName}`,
                            href: groupHref,
                          })
                        }
                        aria-label={
                          saved
                            ? `Удалить группу «${group.name}» из избранного`
                            : `Добавить группу «${group.name}» в избранное`
                        }
                        className={cn(
                          "rounded-md p-1.5 transition-colors",
                          saved
                            ? "text-teal-600 dark:text-teal-400"
                            : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                        )}
                      >
                        <Bookmark
                          className={cn("h-4 w-4", saved && "fill-current")}
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Краткое описание и механизм действия */}
                  <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Механизм действия класса
                      </p>
                      <p className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
                        {group.mechanismSummary}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Клиническое описание
                      </p>
                      <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                        {group.clinicalOverview}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Нижняя часть: Классификация, Основные представители и Связанные препараты */}
                <div className="grid grid-cols-1 divide-y divide-slate-100 bg-slate-50/40 lg:grid-cols-12 lg:divide-x lg:divide-y-0 dark:divide-slate-800/80 dark:bg-slate-900/30">
                  <div className="p-4 sm:px-6 lg:col-span-7 space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Классификация внутри группы
                    </p>
                    <ul className="space-y-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {group.classification.map((cls) => (
                        <li key={cls} className="flex items-start gap-2">
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600"
                            aria-hidden="true"
                          />
                          <span>{cls}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 sm:px-6 lg:col-span-5 space-y-3">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Основные представители
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {group.keyRepresentatives.join(", ")}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Связанные препараты в справочнике ({memberDrugs.length})
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {memberDrugs.map((drug) => (
                          <Link
                            key={drug.id}
                            href={`/app/drugs/${drug.id}`}
                            onClick={() =>
                              recordStudyActivity({
                                entityId: drug.id,
                                itemType: "drug",
                                title: `${drug.genericName} — ${drug.pharmacologicalClass}`,
                                categoryLabel: "Карточка препарата",
                                href: `/app/drugs/${drug.id}`,
                                timestampLabel: `Открыто из группы «${group.name}»`,
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-teal-500/40 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-teal-300"
                          >
                            <Pill
                              className="h-3 w-3 text-teal-600 dark:text-teal-400"
                              aria-hidden="true"
                            />
                            <span>{drug.genericName}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PharmacologyGroupsPage() {
  return (
    <div className="space-y-6">
      <MilestoneBanner
        sectionTitle="Фармакологические группы"
        milestoneTarget="6 классов • Demo"
        purposeDescription="Системная классификация лекарственных средств: механизмы действия, подгруппы, основные представители и переход к монографиям."
      />

      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            Загрузка фармакологических групп...
          </div>
        }
      >
        <GroupsDirectoryContent />
      </Suspense>

      <DemoDisclaimer />
    </div>
  );
}
