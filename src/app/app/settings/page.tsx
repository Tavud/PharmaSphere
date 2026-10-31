"use client";

import React, { useEffect, useState } from "react";
import { Moon, RotateCcw, Save, Settings, Sun, UserCheck } from "lucide-react";
import { useAppState } from "@/features/preferences/app-state-context";
import { MilestoneBanner } from "@/components/ui/milestone-banner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoDisclaimer } from "@/components/ui/demo-disclaimer";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const {
    preferences,
    updatePreferences,
    resetAllPrototypeData,
    notify,
  } = useAppState();

  const [displayNameInput, setDisplayNameInput] = useState(
    preferences.displayName
  );
  const [studyTrackInput, setStudyTrackInput] = useState(
    preferences.studyTrackLabel
  );

  useEffect(() => {
    setDisplayNameInput(preferences.displayName);
    setStudyTrackInput(preferences.studyTrackLabel);
  }, [preferences.displayName, preferences.studyTrackLabel]);

  const handleSaveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    updatePreferences({
      displayName: displayNameInput.trim(),
      studyTrackLabel:
        studyTrackInput.trim() ||
        "Базовая и клиническая фармакология (3 курс • Демо-профиль)",
    });
    notify("Настройки учебного профиля сохранены в браузере", "success");
  };

  return (
    <div className="space-y-6">
      <MilestoneBanner
        sectionTitle="Настройки"
        milestoneTarget="Локальный профиль • localStorage"
        purposeDescription="Управление учебным профилем, темой оформления интерфейса, параметрами отображения материалов и локальными данными."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Левая карточка: Локальный профиль и учебные параметры */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <UserCheck
                  className="h-4 w-4 text-teal-600 dark:text-teal-400"
                  aria-hidden="true"
                />
                <CardTitle>Локальный профиль и параметры чтения</CardTitle>
              </div>
              <Badge variant="outline">Только в браузере</Badge>
            </div>
            <CardDescription>
              Укажите имя и учебный курс для отображения в шапке рабочего
              пространства, а также настройте отображение справочника.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div className="space-y-1">
                <label
                  htmlFor="student-display-name"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Имя студента (необязательно)
                </label>
                <input
                  id="student-display-name"
                  type="text"
                  maxLength={60}
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  placeholder="Например: Александр, Айгерим — или оставьте пустым"
                  className="h-9 w-full rounded-lg border border-slate-200/90 bg-white px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="student-study-track"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Учебный курс / направление
                </label>
                <input
                  id="student-study-track"
                  type="text"
                  maxLength={80}
                  value={studyTrackInput}
                  onChange={(e) => setStudyTrackInput(e.target.value)}
                  placeholder="Базовая и клиническая фармакология (3 курс • Демо-профиль)"
                  className="h-9 w-full rounded-lg border border-slate-200/90 bg-white px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div className="pt-1">
                <Button type="submit" variant="primary" size="sm">
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Сохранить профиль</span>
                </Button>
              </div>
            </form>

            {/* Рабочие переключатели параметров интерфейса */}
            <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800/80">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Параметры отображения контента
              </p>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/40 p-3.5 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Клинические акценты и формулы механизмов
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Отображать блоки «Клинический акцент» и «Клинический ориентир»
                    в карточках препаратов, модулях и тестах.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.showClinicalMnemonics}
                  onClick={() => {
                    const nextVal = !preferences.showClinicalMnemonics;
                    updatePreferences({ showClinicalMnemonics: nextVal });
                    notify(
                      nextVal
                        ? "Клинические акценты включены"
                        : "Клинические акценты скрыты",
                      "info"
                    );
                  }}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                    preferences.showClinicalMnemonics
                      ? "bg-teal-600"
                      : "bg-slate-300 dark:bg-slate-700"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      preferences.showClinicalMnemonics
                        ? "translate-x-6"
                        : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/40 p-3.5 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Компактная плотность таблиц каталога
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Уменьшает вертикальные отступы строк в каталоге лекарственных
                    препаратов для обзора большего числа позиций.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.compactCards}
                  onClick={() => {
                    const nextVal = !preferences.compactCards;
                    updatePreferences({ compactCards: nextVal });
                    notify(
                      nextVal
                        ? "Включена компактная плотность таблиц"
                        : "Включена стандартная плотность таблиц",
                      "info"
                    );
                  }}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                    preferences.compactCards
                      ? "bg-teal-600"
                      : "bg-slate-300 dark:bg-slate-700"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      preferences.compactCards
                        ? "translate-x-6"
                        : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Правая карточка: Тема оформления и управление демо-данными */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings
                className="h-4 w-4 text-teal-600 dark:text-teal-400"
                aria-hidden="true"
              />
              <CardTitle>Оформление и демо-режим</CardTitle>
            </div>
            <CardDescription>
              Переключение темы интерфейса и управление локальным хранилищем.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Тема оформления интерфейса
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updatePreferences({ theme: "light" })}
                  className={cn(
                    "flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors",
                    preferences.theme === "light"
                      ? "border-teal-600 bg-teal-50/80 text-teal-900 dark:border-teal-500 dark:bg-teal-950/60 dark:text-teal-200"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  )}
                >
                  <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Светлая</span>
                </button>

                <button
                  type="button"
                  onClick={() => updatePreferences({ theme: "dark" })}
                  className={cn(
                    "flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors",
                    preferences.theme === "dark"
                      ? "border-teal-500 bg-teal-950/70 text-teal-200"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  )}
                >
                  <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Тёмная</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-2.5 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  О демонстрационном режиме
                </p>
                <Badge variant="amber" className="text-[10px]">
                  Demo v1
                </Badge>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Приложение работает полностью автономно в браузере и хранит
                избранное, пройденные темы, ответы на тесты и настройки в
                ключах <code className="font-mono">pharmasphere.v1.*</code>{" "}
                локального хранилища (<code className="font-mono">localStorage</code>).
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={resetAllPrototypeData}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Сбросить все локальные данные</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <DemoDisclaimer />
    </div>
  );
}
