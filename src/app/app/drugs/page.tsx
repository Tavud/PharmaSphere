"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Bookmark,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import {
  getAllDrugs,
  getAllPharmacologicalGroups,
  getPharmacologicalGroupById,
} from "@/lib/data-service";
import { useAppState } from "@/features/preferences/app-state-context";
import { MilestoneBanner } from "@/components/ui/milestone-banner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoDisclaimer } from "@/components/ui/demo-disclaimer";
import { cn } from "@/lib/utils";

type SortMode = "alpha-asc" | "alpha-desc" | "group";

function DrugCatalogContent() {
  const searchParams = useSearchParams();
  const initialGroupParam = searchParams.get("group");

  const allDrugs = getAllDrugs();
  const allGroups = getAllPharmacologicalGroups();
  const { isFavorite, toggleFavorite, recordStudyActivity, preferences } =
    useAppState();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [selectedLetter, setSelectedLetter] = useState<string>("all");
  const [sortMode, setSortMode] = useState<SortMode>("alpha-asc");
  const [pageSize, setPageSize] = useState<number>(6);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    if (
      initialGroupParam &&
      allGroups.some((g) => g.id === initialGroupParam)
    ) {
      setSelectedGroupId(initialGroupParam);
      setCurrentPage(1);
    }
  }, [initialGroupParam, allGroups]);

  // Доступные первые буквы МНН для алфавитного указателя
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    for (const drug of allDrugs) {
      const firstChar = drug.genericName.trim().charAt(0).toUpperCase();
      if (firstChar) {
        letters.add(firstChar);
      }
    }
    return Array.from(letters).sort((a, b) => a.localeCompare(b, "ru"));
  }, [allDrugs]);

  const filteredAndSortedDrugs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = allDrugs.filter((drug) => {
      if (selectedGroupId !== "all" && drug.groupId !== selectedGroupId) {
        return false;
      }

      if (selectedLetter !== "all") {
        const firstChar = drug.genericName.trim().charAt(0).toUpperCase();
        if (firstChar !== selectedLetter) {
          return false;
        }
      }

      if (!normalizedQuery) {
        return true;
      }

      const parentGroup = getPharmacologicalGroupById(drug.groupId);
      const matchesGeneric = drug.genericName
        .toLowerCase()
        .includes(normalizedQuery);
      const matchesTrade = drug.tradeNames.some((tn) =>
        tn.toLowerCase().includes(normalizedQuery)
      );
      const matchesAliases = drug.commonReferenceAliases.some((al) =>
        al.toLowerCase().includes(normalizedQuery)
      );
      const matchesClass = drug.pharmacologicalClass
        .toLowerCase()
        .includes(normalizedQuery);
      const matchesTarget = drug.primaryTarget
        .toLowerCase()
        .includes(normalizedQuery);
      const matchesMechanism =
        drug.mechanismOfAction.toLowerCase().includes(normalizedQuery) ||
        drug.pharmacodynamics.toLowerCase().includes(normalizedQuery);
      const matchesIndications = drug.classicIndications.some((ind) =>
        ind.toLowerCase().includes(normalizedQuery)
      );
      const matchesGroup = parentGroup
        ? parentGroup.name.toLowerCase().includes(normalizedQuery) ||
          parentGroup.shortName.toLowerCase().includes(normalizedQuery)
        : false;

      return (
        matchesGeneric ||
        matchesTrade ||
        matchesAliases ||
        matchesClass ||
        matchesTarget ||
        matchesMechanism ||
        matchesIndications ||
        matchesGroup
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "alpha-asc") {
        return a.genericName.localeCompare(b.genericName, "ru");
      }
      if (sortMode === "alpha-desc") {
        return b.genericName.localeCompare(a.genericName, "ru");
      }
      const groupCompare = a.pharmacologicalClass.localeCompare(
        b.pharmacologicalClass,
        "ru"
      );
      if (groupCompare !== 0) return groupCompare;
      return a.genericName.localeCompare(b.genericName, "ru");
    });
  }, [allDrugs, searchQuery, selectedGroupId, selectedLetter, sortMode]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedDrugs.length / pageSize)
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedDrugs = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredAndSortedDrugs.slice(start, start + pageSize);
  }, [filteredAndSortedDrugs, safePage, pageSize]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedGroupId !== "all" ||
    selectedLetter !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedGroupId("all");
    setSelectedLetter("all");
    setSortMode("alpha-asc");
    setCurrentPage(1);
  };

  const cellPad = preferences.compactCards ? "px-4 py-2.5" : "px-5 py-3.5";

  return (
    <div className="space-y-6">
      {/* Панель поиска, фильтрации по фармгруппам и сортировки */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Единая поисковая строка по базе препаратов */}
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Поиск препарата по МНН, торговому названию, мишени или механизму"
              placeholder="Поиск по МНН (Метопролол), торговому названию (Конкор, Лазикс), мишени или механизму..."
              className="h-9 w-full rounded-lg border border-slate-200/90 bg-slate-50/50 pl-9 pr-8 text-[13px] text-slate-900 placeholder:text-slate-400 transition-colors focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                aria-label="Очистить поиск"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Управление сортировкой и пагинацией */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-slate-50/70 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
              <ArrowUpDown
                className="h-3.5 w-3.5 text-slate-400"
                aria-hidden="true"
              />
              <label htmlFor="drug-sort-select" className="text-[11px] font-medium">
                Сортировка:
              </label>
              <select
                id="drug-sort-select"
                value={sortMode}
                onChange={(e) => {
                  setSortMode(e.target.value as SortMode);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-medium text-slate-900 focus:outline-none dark:text-white"
              >
                <option value="alpha-asc" className="dark:bg-slate-900">
                  По алфавиту (А → Я)
                </option>
                <option value="alpha-desc" className="dark:bg-slate-900">
                  По алфавиту (Я → А)
                </option>
                <option value="group" className="dark:bg-slate-900">
                  По фармгруппе
                </option>
              </select>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-slate-50/70 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
              <label htmlFor="drug-pagesize-select" className="text-[11px] font-medium">
                Показывать:
              </label>
              <select
                id="drug-pagesize-select"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent font-medium text-slate-900 focus:outline-none dark:text-white"
              >
                <option value={6} className="dark:bg-slate-900">
                  По 6 на стр.
                </option>
                <option value={20} className="dark:bg-slate-900">
                  Все ({allDrugs.length})
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

        {/* Фильтр по фармакологическим группам */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Фармакологическая группа:
            </span>

            {/* Алфавитный фильтр */}
            <div
              role="group"
              aria-label="Алфавитный указатель"
              className="flex flex-wrap items-center gap-1"
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedLetter("all");
                  setCurrentPage(1);
                }}
                className={cn(
                  "rounded px-1.5 py-0.5 font-mono text-[11px] font-medium transition-colors",
                  selectedLetter === "all"
                    ? "bg-teal-600 text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                )}
              >
                Все
              </button>
              {availableLetters.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => {
                    setSelectedLetter((prev) =>
                      prev === letter ? "all" : letter
                    );
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "rounded px-1.5 py-0.5 font-mono text-[11px] font-medium transition-colors",
                    selectedLetter === letter
                      ? "bg-teal-600 text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  )}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setSelectedGroupId("all");
                setCurrentPage(1);
              }}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                selectedGroupId === "all"
                  ? "border-teal-600 bg-teal-50/90 text-teal-900 dark:border-teal-500 dark:bg-teal-950/60 dark:text-teal-200"
                  : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              Все группы ({allDrugs.length})
            </button>

            {allGroups.map((group) => {
              const active = selectedGroupId === group.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => {
                    setSelectedGroupId((prev) =>
                      prev === group.id ? "all" : group.id
                    );
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-teal-600 bg-teal-50/90 text-teal-900 dark:border-teal-500 dark:bg-teal-950/60 dark:text-teal-200"
                      : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  )}
                >
                  {group.name}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Компактная профессиональная таблица препаратов */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
          <span>
            Найдено препаратов:{" "}
            <strong className="font-semibold text-slate-900 dark:text-white">
              {filteredAndSortedDrugs.length}
            </strong>{" "}
            из {allDrugs.length}
            {totalPages > 1 && (
              <span className="ml-2 text-slate-400">
                (страница {safePage} из {totalPages})
              </span>
            )}
          </span>
          <Badge variant="outline" className="text-[10px]">
            МНН • Торговые названия • Мишени
          </Badge>
        </div>

        {filteredAndSortedDrugs.length === 0 ? (
          <div className="p-8 text-center space-y-2.5">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              По заданным параметрам препараты не найдены
            </p>
            <p className="mx-auto max-w-md text-xs text-slate-500 dark:text-slate-400">
              Попробуйте изменить поисковый запрос, выбрать другую букву
              алфавита или сбросить фильтр фармакологических групп.
            </p>
            <div className="pt-1">
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Показать все препараты</span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-500">
                    <th className="px-5 py-3 font-medium">
                      МНН и торговые названия
                    </th>
                    <th className="px-5 py-3 font-medium">
                      Фармакологическая группа
                    </th>
                    <th className="hidden md:table-cell px-5 py-3 font-medium">
                      Первичная мишень
                    </th>
                    <th className="hidden lg:table-cell px-5 py-3 font-medium">
                      T½
                    </th>
                    <th className="px-5 py-3 text-right font-medium">
                      Профиль
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {paginatedDrugs.map((drug) => {
                    const parentGroup = getPharmacologicalGroupById(
                      drug.groupId
                    );
                    const saved = isFavorite(drug.id);
                    const href = `/app/drugs/${drug.id}`;

                    return (
                      <tr
                        key={drug.id}
                        className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                      >
                        <td className={cn(cellPad, "align-top")}>
                          <div className="space-y-0.5">
                            <Link
                              href={href}
                              onClick={() =>
                                recordStudyActivity({
                                  entityId: drug.id,
                                  itemType: "drug",
                                  title: `${drug.genericName} — ${drug.pharmacologicalClass}`,
                                  categoryLabel: "Карточка препарата",
                                  href,
                                  timestampLabel:
                                    "Открыто из каталога препаратов",
                                })
                              }
                              className="text-[13.5px] font-semibold text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-300"
                            >
                              {drug.genericName}
                            </Link>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="font-medium text-slate-600 dark:text-slate-300">
                                Торговые названия:
                              </span>{" "}
                              {drug.tradeNames.join(", ")}
                            </p>
                          </div>
                        </td>

                        <td className={cn(cellPad, "align-top")}>
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {drug.pharmacologicalClass}
                          </p>
                          {parentGroup && (
                            <Link
                              href={`/app/groups?group=${parentGroup.id}`}
                              className="mt-0.5 inline-block text-[11px] text-teal-700 hover:underline dark:text-teal-400"
                            >
                              {parentGroup.name}
                            </Link>
                          )}
                        </td>

                        <td
                          className={cn(
                            cellPad,
                            "hidden md:table-cell align-top font-mono text-[11px] text-slate-600 dark:text-slate-400"
                          )}
                        >
                          {drug.primaryTarget}
                        </td>

                        <td
                          className={cn(
                            cellPad,
                            "hidden lg:table-cell align-top font-mono text-[11px] text-slate-500 dark:text-slate-400"
                          )}
                        >
                          {drug.keyPharmacokinetics.halfLifeRange}
                        </td>

                        <td className={cn(cellPad, "align-top text-right")}>
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                toggleFavorite({
                                  entityId: drug.id,
                                  entityType: "drug",
                                  title: drug.genericName,
                                  subtitle: drug.pharmacologicalClass,
                                  href,
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
                                className={cn(
                                  "h-3.5 w-3.5",
                                  saved && "fill-current"
                                )}
                                aria-hidden="true"
                              />
                            </button>

                            <Link
                              href={href}
                              onClick={() =>
                                recordStudyActivity({
                                  entityId: drug.id,
                                  itemType: "drug",
                                  title: `${drug.genericName} — ${drug.pharmacologicalClass}`,
                                  categoryLabel: "Карточка препарата",
                                  href,
                                  timestampLabel:
                                    "Открыто из каталога препаратов",
                                })
                              }
                              className="inline-flex h-7 items-center rounded-lg border border-slate-200/90 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:border-teal-500/40 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-teal-300"
                            >
                              Открыть →
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Пагинация при превышении размера страницы */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/40 px-5 py-3 text-xs dark:border-slate-800/80 dark:bg-slate-900/40">
                <span className="text-slate-500 dark:text-slate-400">
                  Показаны записи {(safePage - 1) * pageSize + 1}–
                  {Math.min(
                    safePage * pageSize,
                    filteredAndSortedDrugs.length
                  )}{" "}
                  из {filteredAndSortedDrugs.length}
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Назад</span>
                  </Button>

                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "h-7 min-w-7 rounded-md border px-2 font-mono text-xs font-medium transition-colors",
                          pageNum === safePage
                            ? "border-teal-600 bg-teal-600 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        )}
                      >
                        {pageNum}
                      </button>
                    )
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage >= totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    <span>Далее</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default function DrugReferencePage() {
  const allDrugs = getAllDrugs();

  return (
    <div className="space-y-6">
      <MilestoneBanner
        sectionTitle="Каталог препаратов"
        milestoneTarget={`Записей: ${allDrugs.length} • Demo`}
        purposeDescription="Структурированная фармакологическая база данных: международные непатентованные наименования (МНН), торговые названия, молекулярные мишени и монографии."
      />

      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            Загрузка каталога препаратов...
          </div>
        }
      >
        <DrugCatalogContent />
      </Suspense>

      <DemoDisclaimer />
    </div>
  );
}
