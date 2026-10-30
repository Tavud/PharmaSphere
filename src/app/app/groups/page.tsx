"use client";

import React, { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Bookmark, X } from "lucide-react";
import {
  getAllPharmacologicalGroups,
  getDrugsByGroupId,
  getPharmacologicalGroupById,
} from "@/lib/data-service";
import { useAppState } from "@/features/preferences/app-state-context";
import { MilestoneBanner } from "@/components/ui/milestone-banner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoDisclaimer } from "@/components/ui/demo-disclaimer";
import { cn } from "@/lib/utils";

function GroupsDirectoryContent() {
  const searchParams = useSearchParams();
  const highlightedGroupId = searchParams.get("group");
  const groups = getAllPharmacologicalGroups();
  const { isFavorite, toggleFavorite, recordStudyActivity } = useAppState();

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

  return (
    <div className="space-y-3">
      {highlightedGroup && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-teal-200 bg-teal-50/70 px-3.5 py-2 text-xs text-teal-900 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-200">
          <span>
            Выбрана группа: <strong>{highlightedGroup.name}</strong>
          </span>
          <Link
            href="/app/groups"
            className="inline-flex items-center gap-1 rounded border border-teal-300 bg-white px-2 py-0.5 text-[11px] font-medium text-teal-800 hover:bg-teal-50 dark:border-teal-700 dark:bg-slate-900 dark:text-teal-300"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            <span>Снять выделение</span>
          </Link>
        </div>
      )}

      <Card className="divide-y divide-slate-100 dark:divide-slate-800">
        {groups.map((group) => {
          const memberDrugs = getDrugsByGroupId(group.id);
          const isHighlighted = highlightedGroupId === group.id;
          const saved = isFavorite(group.id);
          const groupHref = `/app/groups?group=${group.id}`;

          return (
            <div
              key={group.id}
              id={group.id}
              className={cn(
                "p-4 transition-colors",
                isHighlighted
                  ? "bg-teal-50/40 dark:bg-teal-950/20"
                  : "hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">
                      {group.name}
                    </h2>
                    <Badge variant="teal">{group.organSystem}</Badge>
                    {isHighlighted && (
                      <Badge variant="emerald">Выделено</Badge>
                    )}
                  </div>
                  <p className="font-mono text-[11px] text-teal-700 dark:text-teal-400">
                    Мишень: {group.primaryTarget}
                  </p>
                </div>

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
                    "rounded p-1 transition-colors",
                    saved
                      ? "text-teal-700 dark:text-teal-300"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                  )}
                >
                  <Bookmark
                    className={cn("h-4 w-4", saved && "fill-current")}
                    aria-hidden="true"
                  />
                </button>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {group.mechanismSummary}
              </p>

              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Препараты в демо-каталоге:
                </span>
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
                    className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-800 hover:border-teal-400 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-600"
                  >
                    {drug.genericName}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

export default function PharmacologyGroupsPage() {
  return (
    <div className="space-y-4">
      <MilestoneBanner
        sectionTitle="Фармакологические группы"
        milestoneTarget="6 демо-классов"
        purposeDescription="Классификация по системам органов, рецепторным мишеням и механизмам действия."
      />

      <Suspense
        fallback={
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
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
