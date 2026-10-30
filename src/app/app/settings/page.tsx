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
    <div className="space-y-4">
      <MilestoneBanner
        sectionTitle="Настройки"
        milestoneTarget="Локальный профиль • localStorage"
        purposeDescription="Управление учебным профилем, темой оформления интерфейса (светлая / темная) и локальными данными прототипа."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <UserCheck
                  className="h-4 w-4 text-teal-700 dark:text-teal-400"
                  aria-hidden="true"
                />
                <CardTitle>Локальный профиль студента</CardTitle>
              </div>
              <Badge variant="outline">Только в браузере</Badge>
            </div>
            <CardDescription>
              Укажите имя и учебный курс для отображения в подзаголовке обзора.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-3">
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
                  className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
                  className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div className="pt-1">
                <Button type="submit" variant="primary" size="sm">
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Сохранить настройки</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings
                className="h-4 w-4 text-teal-700 dark:text-teal-400"
                aria-hidden="true"
              />
              <CardTitle>Оформление и данные прототипа</CardTitle>
            </div>
            <CardDescription>
              Переключение темы интерфейса и сброс локального хранилища.
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
                  className={`flex h-8 items-center justify-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors ${
                    preferences.theme === "light"
                      ? "border-teal-600 bg-teal-50/80 text-teal-900 dark:border-teal-500 dark:bg-teal-950/60 dark:text-teal-200"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Светлая</span>
                </button>

                <button
                  type="button"
                  onClick={() => updatePreferences({ theme: "dark" })}
                  className={`flex h-8 items-center justify-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors ${
                    preferences.theme === "dark"
                      ? "border-teal-500 bg-teal-950/70 text-teal-200"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Темная</span>
                </button>
              </div>
            </div>

            <div className="rounded-md border border-slate-200/80 bg-slate-50/70 p-3 space-y-2 dark:border-slate-800 dark:bg-slate-950/50">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Сброс локального хранилища прототипа
              </p>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Очищает все ключи `pharmasphere.v1.*` в `localStorage` и
                восстанавливает исходную демо-статистику, избранное и историю
                просмотров.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={resetAllPrototypeData}
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
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
