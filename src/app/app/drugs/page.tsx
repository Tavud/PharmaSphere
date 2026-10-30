"use client";

import React from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { getAllDrugs, getPharmacologicalGroupById } from "@/lib/data-service";
import { useAppState } from "@/features/preferences/app-state-context";
import { MilestoneBanner } from "@/components/ui/milestone-banner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoDisclaimer } from "@/components/ui/demo-disclaimer";
import { GlobalSearchInline } from "@/components/layout/global-search";
import { cn } from "@/lib/utils";

export default function DrugReferencePage() {
  const drugs = getAllDrugs();
  const { isFavorite, toggleFavorite, recordStudyActivity } = useAppState();

  return (
    <div className="space-y-4">
      <MilestoneBanner
        sectionTitle="Справочник препаратов"
        milestoneTarget="7 демо-монографий"
        purposeDescription="МНН, фармакологические группы, молекулярные мишени и параметры фармакокинетики."
        rightSlot={
          <div className="w-full sm:w-80">
            <GlobalSearchInline />
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2.5 px-4">
          <div className="flex items-center gap-2">
            <CardTitle>Реестр лекарственных средств</CardTitle>
            <Badge variant="amber" className="text-[10px]">
              Демо-каталог
            </Badge>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Всего записей: {drugs.length}
          </span>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                <th className="px-4 py-2 font-medium">Препарат (МНН)</th>
                <th className="px-4 py-2 font-medium">
                  Фармакологический класс и группа
                </th>
                <th className="hidden md:table-cell px-4 py-2 font-medium">
                  Молекулярная мишень
                </th>
                <th className="hidden lg:table-cell px-4 py-2 font-medium">
                  T½
                </th>
                <th className="hidden sm:table-cell px-4 py-2 font-medium">
                  Система органов
                </th>
                <th className="px-4 py-2 text-right font-medium">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {drugs.map((drug) => {
                const parentGroup = getPharmacologicalGroupById(drug.groupId);
                const saved = isFavorite(drug.id);
                const href = `/app/drugs/${drug.id}`;

                return (
                  <tr
                    key={drug.id}
                    className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-2.5 align-top">
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
                              "Открыто из «Справочника препаратов»",
                          })
                        }
                        className="font-semibold text-slate-900 hover:text-teal-700 hover:underline dark:text-slate-100 dark:hover:text-teal-300"
                      >
                        {drug.genericName}
                      </Link>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {drug.shortDescription}
                      </p>
                    </td>

                    <td className="px-4 py-2.5 align-top">
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {drug.pharmacologicalClass}
                      </p>
                      {parentGroup && (
                        <Link
                          href={`/app/groups?group=${parentGroup.id}`}
                          className="text-[11px] text-teal-700 hover:underline dark:text-teal-400"
                        >
                          {parentGroup.name}
                        </Link>
                      )}
                    </td>

                    <td className="hidden md:table-cell px-4 py-2.5 align-top font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {drug.primaryTarget}
                    </td>

                    <td className="hidden lg:table-cell px-4 py-2.5 align-top font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {drug.keyPharmacokinetics.halfLifeRange}
                    </td>

                    <td className="hidden sm:table-cell px-4 py-2.5 align-top">
                      <Badge variant="default" className="text-[10px]">
                        {drug.organSystem}
                      </Badge>
                    </td>

                    <td className="px-4 py-2.5 align-top text-right">
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
                          href={href}
                          onClick={() =>
                            recordStudyActivity({
                              entityId: drug.id,
                              itemType: "drug",
                              title: `${drug.genericName} — ${drug.pharmacologicalClass}`,
                              categoryLabel: "Карточка препарата",
                              href,
                              timestampLabel:
                                "Открыто из «Справочника препаратов»",
                            })
                          }
                          className="whitespace-nowrap font-medium text-teal-700 hover:underline dark:text-teal-400"
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
      </Card>

      <DemoDisclaimer />
    </div>
  );
}
