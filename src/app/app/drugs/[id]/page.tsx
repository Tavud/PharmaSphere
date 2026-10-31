"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Bookmark, Layers, Pill } from "lucide-react";
import {
  getDrugById,
  getDrugsByGroupId,
  getPharmacologicalGroupById,
} from "@/lib/data-service";
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

const MONOGRAPH_SECTIONS = [
  { id: "mechanism", label: "1. Механизм действия" },
  { id: "pharmacodynamics", label: "2. Фармакодинамика" },
  { id: "pharmacokinetics", label: "3. Фармакокинетика и дозирование" },
  { id: "indications", label: "4. Показания" },
  { id: "contraindications", label: "5. Противопоказания" },
  { id: "adverse-effects", label: "6. Побочные эффекты" },
  { id: "interactions", label: "7. Взаимодействия" },
  { id: "special-notes", label: "8. Особенности применения" },
] as const;

export default function DrugDetailPage() {
  const params = useParams<{ id: string }>();
  const drugId = typeof params?.id === "string" ? params.id : "";
  const drug = getDrugById(drugId);
  const { isFavorite, toggleFavorite, recordStudyActivity, preferences } =
    useAppState();

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
      <Card className="p-8 text-center space-y-3">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
          Карточка препарата не найдена
        </h1>
        <p className="mx-auto max-w-md text-xs text-slate-500 dark:text-slate-400">
          Идентификатор «{drugId}» отсутствует в демонстрационном каталоге.
        </p>
        <div className="pt-1">
          <Link
            href="/app/drugs"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-teal-600 px-3 text-xs font-medium text-white hover:bg-teal-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Вернуться в каталог препаратов</span>
          </Link>
        </div>
      </Card>
    );
  }

  const parentGroup = getPharmacologicalGroupById(drug.groupId);
  const peerDrugs = getDrugsByGroupId(drug.groupId).filter(
    (d) => d.id !== drug.id
  );
  const saved = isFavorite(drug.id);

  return (
    <div className="space-y-6">
      {/* Навигационная строка возврата */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/app/drugs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Каталог препаратов</span>
        </Link>

        <Badge variant="outline" className="text-[11px]">
          Клиническая монография • Demo
        </Badge>
      </div>

      {/* Верхняя часть: МНН, торговые названия, фармгруппа и краткая характеристика */}
      <Card className="overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:p-6 dark:border-slate-800/80">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="teal">{drug.organSystem}</Badge>
              {parentGroup && (
                <Link
                  href={`/app/groups?group=${parentGroup.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline dark:text-teal-400"
                >
                  <Layers className="h-3 w-3" aria-hidden="true" />
                  <span>{parentGroup.name}</span>
                </Link>
              )}
            </div>

            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
              {drug.genericName}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
              <span>
                <strong className="font-semibold text-slate-800 dark:text-slate-200">
                  Торговые названия:
                </strong>{" "}
                {drug.tradeNames.length > 0
                  ? drug.tradeNames.join(", ")
                  : "Не указаны"}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>
                <strong className="font-semibold text-slate-800 dark:text-slate-200">
                  Класс:
                </strong>{" "}
                {drug.pharmacologicalClass}
              </span>
            </div>

            <p className="pt-1 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
              {drug.shortDescription}
            </p>
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
            className="shrink-0"
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

        {/* Сводка ключевых молекулярных и ФК-параметров */}
        <div className="grid grid-cols-1 divide-y divide-slate-100 bg-slate-50/50 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-slate-800/80 dark:bg-slate-900/50">
          <div className="px-5 py-3">
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Первичная молекулярная мишень
            </p>
            <p className="mt-0.5 font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
              {drug.primaryTarget}
            </p>
          </div>

          <div className="px-5 py-3">
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Пути введения
            </p>
            <p className="mt-0.5 text-xs text-slate-800 dark:text-slate-200">
              {drug.keyPharmacokinetics.routeSummary}
            </p>
          </div>

          <div className="px-5 py-3">
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Период полувыведения (T½)
            </p>
            <p className="mt-0.5 font-mono text-xs text-slate-800 dark:text-slate-200">
              {drug.keyPharmacokinetics.halfLifeRange}
            </p>
          </div>
        </div>
      </Card>

      {/* Быстрая навигация по 8 разделам монографии */}
      <nav
        aria-label="Оглавление монографии препарата"
        className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white p-2.5 dark:border-slate-800/80 dark:bg-slate-900"
      >
        {MONOGRAPH_SECTIONS.map((sec) => (
          <a
            key={sec.id}
            href={`#${sec.id}`}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-800 dark:text-slate-400 dark:hover:bg-teal-950/50 dark:hover:text-teal-300"
          >
            {sec.label}
          </a>
        ))}
      </nav>

      {/* Разделы 1 и 2: Механизм действия и Фармакодинамика */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card id="mechanism" className="scroll-mt-20">
          <CardHeader>
            <CardTitle>1. Механизм действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
            <p>{drug.mechanismOfAction || "Раздел пока не заполнен."}</p>
            {preferences.showClinicalMnemonics && drug.educationalSummary && (
              <div className="rounded-lg border border-teal-200/70 bg-teal-50/40 p-3 text-xs text-slate-700 dark:border-teal-900/50 dark:bg-teal-950/30 dark:text-slate-300">
                <strong className="font-semibold text-teal-900 dark:text-teal-300">
                  Клинический акцент:{" "}
                </strong>
                {drug.educationalSummary}
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="pharmacodynamics" className="scroll-mt-20">
          <CardHeader>
            <CardTitle>2. Фармакодинамика</CardTitle>
          </CardHeader>
          <CardContent className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
            <p>{drug.pharmacodynamics || "Раздел пока не заполнен."}</p>
          </CardContent>
        </Card>
      </div>

      {/* Раздел 3: Фармакокинетика, метаболизм, выведение и ориентировочные дозировки */}
      <Card id="pharmacokinetics" className="scroll-mt-20 overflow-hidden">
        <CardHeader>
          <CardTitle>
            3. Фармакокинетика (ADME) и учебный режим дозирования
          </CardTitle>
        </CardHeader>
        <div className="divide-y divide-slate-100 text-xs dark:divide-slate-800/80">
          <div className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-12 sm:gap-4">
            <span className="font-semibold text-slate-700 sm:col-span-4 dark:text-slate-300">
              Пути введения
            </span>
            <span className="text-slate-600 sm:col-span-8 dark:text-slate-300">
              {drug.keyPharmacokinetics.routeSummary ||
                "Раздел пока не заполнен."}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-12 sm:gap-4">
            <span className="font-semibold text-slate-700 sm:col-span-4 dark:text-slate-300">
              Всасывание и распределение
            </span>
            <span className="leading-relaxed text-slate-600 sm:col-span-8 dark:text-slate-300">
              {drug.keyPharmacokinetics.absorptionAndDistribution ||
                "Раздел пока не заполнен."}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-12 sm:gap-4">
            <span className="font-semibold text-slate-700 sm:col-span-4 dark:text-slate-300">
              Метаболизм и выведение
            </span>
            <span className="leading-relaxed text-slate-600 sm:col-span-8 dark:text-slate-300">
              {drug.keyPharmacokinetics.eliminationSummary ||
                "Раздел пока не заполнен."}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-12 sm:gap-4">
            <span className="font-semibold text-slate-700 sm:col-span-4 dark:text-slate-300">
              Период полувыведения (T½)
            </span>
            <span className="font-mono text-slate-800 sm:col-span-8 dark:text-slate-200">
              {drug.keyPharmacokinetics.halfLifeRange ||
                "Раздел пока не заполнен."}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1 bg-slate-50/40 px-5 py-3 sm:grid-cols-12 sm:gap-4 dark:bg-slate-900/40">
            <span className="font-semibold text-slate-700 sm:col-span-4 dark:text-slate-300">
              Ориентировочный режим дозирования (учебный справочник)
            </span>
            <span className="leading-relaxed text-slate-600 sm:col-span-8 dark:text-slate-300">
              {drug.dosingSummary || "Раздел пока не заполнен."}
            </span>
          </div>
        </div>
      </Card>

      {/* Разделы 4, 5 и 6: Показания, Противопоказания, Побочные эффекты */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card id="indications" className="scroll-mt-20">
          <CardHeader>
            <CardTitle>4. Показания к применению</CardTitle>
          </CardHeader>
          <CardContent>
            {drug.classicIndications.length === 0 ? (
              <p className="text-xs text-slate-400">Раздел пока не заполнен.</p>
            ) : (
              <ul className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {drug.classicIndications.map((ind) => (
                  <li key={ind} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600"
                      aria-hidden="true"
                    />
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card id="contraindications" className="scroll-mt-20">
          <CardHeader>
            <CardTitle>5. Противопоказания</CardTitle>
          </CardHeader>
          <CardContent>
            {drug.contraindicationNotes.length === 0 ? (
              <p className="text-xs text-slate-400">Раздел пока не заполнен.</p>
            ) : (
              <ul className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {drug.contraindicationNotes.map((note) => (
                  <li key={note} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500"
                      aria-hidden="true"
                    />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card id="adverse-effects" className="scroll-mt-20">
          <CardHeader>
            <CardTitle>6. Побочные эффекты</CardTitle>
          </CardHeader>
          <CardContent>
            {drug.highYieldAdverseEffects.length === 0 ? (
              <p className="text-xs text-slate-400">Раздел пока не заполнен.</p>
            ) : (
              <ul className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {drug.highYieldAdverseEffects.map((adv) => (
                  <li key={adv} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
                      aria-hidden="true"
                    />
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Разделы 7 и 8: Лекарственные взаимодействия и Особенности применения */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card id="interactions" className="scroll-mt-20">
          <CardHeader>
            <CardTitle>7. Лекарственные взаимодействия</CardTitle>
          </CardHeader>
          <CardContent>
            {drug.drugInteractions.length === 0 ? (
              <p className="text-xs text-slate-400">Раздел пока не заполнен.</p>
            ) : (
              <ul className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {drug.drugInteractions.map((inter) => (
                  <li key={inter} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"
                      aria-hidden="true"
                    />
                    <span>{inter}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card id="special-notes" className="scroll-mt-20">
          <CardHeader>
            <CardTitle>
              8. Особенности применения и мониторинг безопасности
            </CardTitle>
          </CardHeader>
          <CardContent>
            {drug.specialConsiderations.length === 0 ? (
              <p className="text-xs text-slate-400">Раздел пока не заполнен.</p>
            ) : (
              <ul className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {drug.specialConsiderations.map((spec) => (
                  <li key={spec} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600"
                      aria-hidden="true"
                    />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Связанные препараты той же фармакологической группы */}
      {parentGroup && (
        <Card className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Фармакологическая группа:
            </span>
            <Link
              href={`/app/groups?group=${parentGroup.id}`}
              className="font-semibold text-teal-700 hover:underline dark:text-teal-400"
            >
              {parentGroup.name}
            </Link>

            {peerDrugs.length > 0 && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-slate-500 dark:text-slate-400">
                  Другие препараты группы:
                </span>
                {peerDrugs.map((peer) => (
                  <Link
                    key={peer.id}
                    href={`/app/drugs/${peer.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-teal-500/40 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <Pill
                      className="h-3 w-3 text-teal-600 dark:text-teal-400"
                      aria-hidden="true"
                    />
                    <span>{peer.genericName}</span>
                  </Link>
                ))}
              </>
            )}
          </div>
        </Card>
      )}

      <DemoDisclaimer />
    </div>
  );
}
