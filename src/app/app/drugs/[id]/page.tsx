"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Bookmark } from "lucide-react";
import { getDrugById, getPharmacologicalGroupById } from "@/lib/data-service";
import { useAppState } from "@/features/preferences/app-state-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoDisclaimer } from "@/components/ui/demo-disclaimer";
import { cn } from "@/lib/utils";

export default function DrugDetailPage() {
  const params = useParams<{ id: string }>();
  const drugId = typeof params?.id === "string" ? params.id : "";
  const drug = getDrugById(drugId);
  const { isFavorite, toggleFavorite, recordStudyActivity } = useAppState();

  useEffect(() => {
    if (!drug) return;
    recordStudyActivity({
      entityId: drug.id,
      itemType: "drug",
      title: `${drug.genericName} — ${drug.pharmacologicalClass}`,
      categoryLabel: "Карточка препарата",
      href: `/app/drugs/${drug.id}`,
      timestampLabel: "Просмотрена карточка препарата",
    });
  }, [drug, recordStudyActivity]);

  if (!drug) {
    return (
      <Card className="p-6 text-center space-y-3">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
          Карточка препарата не найдена
        </h1>
        <p className="mx-auto max-w-md text-xs text-slate-500 dark:text-slate-400">
          Идентификатор «{drugId}» отсутствует в демонстрационном каталоге.
        </p>
        <div className="pt-1">
          <Link
            href="/app/drugs"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-teal-600 px-3 text-xs font-medium text-white hover:bg-teal-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Вернуться в справочник</span>
          </Link>
        </div>
      </Card>
    );
  }

  const parentGroup = getPharmacologicalGroupById(drug.groupId);
  const saved = isFavorite(drug.id);

  return (
    <div className="space-y-4">
      {/* Компактная навигационная полоса */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/app/drugs"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Справочник препаратов</span>
        </Link>

        <Badge variant="amber" className="text-[10px]">
          Демо-монография
        </Badge>
      </div>

      {/* Компактная шапка монографии + таблица базовых параметров */}
      <Card>
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-start dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="teal">{drug.organSystem}</Badge>
              <span className="font-mono text-[11px] text-slate-400">
                {drug.id}
              </span>
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-slate-900 dark:text-white">
              {drug.genericName}
            </h1>
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
              {drug.pharmacologicalClass}
            </p>
            {drug.commonReferenceAliases.length > 0 && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Формы и синонимы: {drug.commonReferenceAliases.join(", ")}
              </p>
            )}
          </div>

          <Button
            variant={saved ? "secondary" : "outline"}
            size="sm"
            onClick={() =>
              toggleFavorite({
                entityId: drug.id,
                entityType: "drug",
                title: drug.genericName,
                subtitle: drug.pharmacologicalClass,
                href: `/app/drugs/${drug.id}`,
              })
            }
          >
            <Bookmark
              className={cn(
                "h-3.5 w-3.5",
                saved && "fill-current text-teal-600 dark:text-teal-400"
              )}
              aria-hidden="true"
            />
            <span>{saved ? "В избранном" : "В избранное"}</span>
          </Button>
        </div>

        {/* Сводная таблица параметров (Мишень, Группа, Введение, T½) */}
        <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0 dark:divide-slate-800">
          <div className="px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Первичная мишень
            </p>
            <p className="mt-0.5 font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
              {drug.primaryTarget}
            </p>
          </div>

          <div className="px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Фармакологическая группа
            </p>
            {parentGroup ? (
              <Link
                href={`/app/groups?group=${parentGroup.id}`}
                className="mt-0.5 block text-xs font-medium text-teal-700 hover:underline dark:text-teal-400"
              >
                {parentGroup.name}
              </Link>
            ) : (
              <p className="mt-0.5 text-xs text-slate-700">—</p>
            )}
          </div>

          <div className="px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Пути введения
            </p>
            <p className="mt-0.5 text-xs text-slate-800 dark:text-slate-200">
              {drug.keyPharmacokinetics.routeSummary}
            </p>
          </div>

          <div className="px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Период полувыведения (T½)
            </p>
            <p className="mt-0.5 font-mono text-xs text-slate-800 dark:text-slate-200">
              {drug.keyPharmacokinetics.halfLifeRange}
            </p>
          </div>
        </div>
      </Card>

      {/* Механизм действия и клинико-фармакологические особенности */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Механизм действия и фармакодинамика</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
            <p>{drug.mechanismOfAction}</p>
            <div className="rounded-md border border-teal-200/70 bg-teal-50/40 p-3 text-xs text-slate-800 dark:border-teal-900/60 dark:bg-teal-950/30 dark:text-slate-200">
              <span className="font-semibold text-teal-900 dark:text-teal-300">
                Клинический акцент:{" "}
              </span>
              {drug.educationalSummary}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Элиминация и метаболизм</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <p className="leading-relaxed">
              {drug.keyPharmacokinetics.eliminationSummary}
            </p>
            <div className="border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Краткое резюме: {drug.shortDescription}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Показания, побочные эффекты и противопоказания */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Классические показания</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {drug.classicIndications.map((ind) => (
                <li key={ind} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-600"
                    aria-hidden="true"
                  />
                  <span>{ind}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Нежелательные реакции</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {drug.highYieldAdverseEffects.map((adv) => (
                <li key={adv} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500"
                    aria-hidden="true"
                  />
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Противопоказания</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {drug.contraindicationNotes.map((note) => (
                <li key={note} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-rose-500"
                    aria-hidden="true"
                  />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <DemoDisclaimer />
    </div>
  );
}
