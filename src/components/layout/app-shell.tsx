"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Info,
  Layers,
  LayoutDashboard,
  Menu,
  Moon,
  Pill,
  Search,
  Settings,
  Sun,
  UserCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/features/preferences/app-state-context";
import { GlobalSearchModal } from "@/components/layout/global-search";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  {
    label: "Обзор",
    href: "/app",
    icon: LayoutDashboard,
  },
  {
    label: "Препараты",
    href: "/app/drugs",
    icon: Pill,
  },
  {
    label: "Фармгруппы",
    href: "/app/groups",
    icon: Layers,
  },
  {
    label: "Обучение",
    href: "/app/learning",
    icon: GraduationCap,
  },
  {
    label: "Прогресс",
    href: "/app/progress",
    icon: Activity,
  },
  {
    label: "Избранное",
    href: "/app/favorites",
    icon: Bookmark,
  },
  {
    label: "Настройки",
    href: "/app/settings",
    icon: Settings,
  },
] as const;

function isRouteActive(pathname: string, itemHref: string): boolean {
  if (itemHref === "/app") {
    return pathname === "/app";
  }
  return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/app";
  const {
    preferences,
    favorites,
    toggleTheme,
    notification,
    dismissNotification,
  } = useAppState();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const profileLabel =
    preferences.displayName.trim().length > 0
      ? preferences.displayName.trim()
      : "Студент (Демо)";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 md:flex-row dark:bg-navy-950 dark:text-slate-100">
      {/* Подложка мобильного меню */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Компактная боковая панель (224px на десктопе, 56px в свернутом виде) */}
      <aside
        aria-label="Основная навигация приложения"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-800/90 bg-navy-900 text-slate-200 transition-all duration-150 ease-out md:sticky md:top-0 md:h-screen",
          sidebarCompact ? "md:w-14" : "md:w-56",
          mobileMenuOpen
            ? "w-60 translate-x-0 shadow-xl"
            : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Компактная шапка бренда (48px) */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-800/80 px-3">
          <Link
            href="/"
            title="Перейти на презентационную главную страницу PharmaSphere"
            className="flex items-center gap-2.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-teal-600 text-white">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <div
              className={cn(
                "flex items-baseline gap-1.5",
                sidebarCompact && "md:hidden"
              )}
            >
              <span className="text-[14px] font-semibold tracking-tight text-white">
                PharmaSphere
              </span>
              <span className="font-mono text-[10px] text-teal-400">
                v1.5
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Закрыть меню навигации"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Пункты навигации */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2.5">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(pathname, item.href);
            const showFavoritesCount =
              item.href === "/app/favorites" && favorites.length > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={sidebarCompact ? item.label : undefined}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400",
                  active
                    ? "bg-slate-800/90 text-white"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white",
                  sidebarCompact && "md:justify-center md:px-0"
                )}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-teal-400"
                    aria-hidden="true"
                  />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active
                      ? "text-teal-400"
                      : "text-slate-400 group-hover:text-slate-200"
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "flex-1 whitespace-nowrap",
                    sidebarCompact && "md:hidden"
                  )}
                >
                  {item.label}
                </span>

                {showFavoritesCount && (
                  <span
                    className={cn(
                      "rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-medium text-teal-300 border border-slate-700",
                      sidebarCompact && "md:hidden"
                    )}
                  >
                    {favorites.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Компактный футер боковой панели с переходом на презентационную главную */}
        <div className="border-t border-slate-800/80 p-2 space-y-1.5">
          <Link
            href="/"
            title="Вернуться на презентационную главную страницу"
            className={cn(
              "flex items-center gap-2 rounded-md border border-slate-800 bg-slate-950/50 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-teal-500/40 hover:bg-slate-800/80 hover:text-white",
              sidebarCompact && "md:justify-center md:px-0"
            )}
          >
            <ArrowLeft
              className="h-3.5 w-3.5 shrink-0 text-teal-400"
              aria-hidden="true"
            />
            <span
              className={cn("whitespace-nowrap", sidebarCompact && "md:hidden")}
            >
              На главную сайта
            </span>
          </Link>

          <div
            className={cn(
              "rounded border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-[11px] text-slate-400",
              sidebarCompact && "md:hidden"
            )}
          >
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span>Учебный демо-каталог</span>
            </div>
            <p className="mt-0.5 text-[10px] leading-tight text-slate-500">
              7 препаратов • 6 групп • локально
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarCompact((prev) => !prev)}
            className="hidden md:flex w-full items-center justify-center gap-1.5 rounded border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            aria-label={
              sidebarCompact
                ? "Развернуть боковую панель навигации"
                : "Свернуть боковую панель навигации"
            }
          >
            {sidebarCompact ? (
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <>
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Свернуть панель</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Основная рабочая область */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Компактная верхняя панель (48px) */}
        <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 bg-white/95 px-3 backdrop-blur sm:px-5 dark:border-slate-800/80 dark:bg-navy-900/95">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 md:hidden dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Открыть меню навигации"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200/90 bg-slate-50 px-2.5 text-xs text-slate-600 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Открыть глобальный поиск по справочнику"
            >
              <Search
                className="h-3.5 w-3.5 text-slate-400 dark:text-slate-400"
                aria-hidden="true"
              />
              <span className="truncate max-w-[160px] sm:max-w-none">
                Быстрый поиск препарата или группы...
              </span>
              <kbd className="hidden sm:inline-block rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                Ctrl+K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Ссылка возврата на презентационную главную */}
            <Link
              href="/"
              className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200/90 bg-white px-2.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title="Вернуться на презентационную главную страницу"
            >
              <ArrowLeft
                className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400"
                aria-hidden="true"
              />
              <span>Главная сайта</span>
            </Link>

            {/* Сдержанный индикатор демо-режима */}
            <span
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded border border-amber-200/80 bg-amber-50/70 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300"
              title="Приложение использует локальный демонстрационный набор данных"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
                aria-hidden="true"
              />
              <span>ДЕМО-РЕЖИМ</span>
            </span>

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200/90 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label={
                preferences.theme === "dark"
                  ? "Включить светлую клиническую тему"
                  : "Включить темную тему"
              }
              title={
                preferences.theme === "dark"
                  ? "Переключить на светлую тему"
                  : "Переключить на темную тему"
              }
            >
              {preferences.theme === "dark" ? (
                <Sun className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
              )}
            </button>

            <Link
              href="/app/settings"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200/90 bg-white px-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title="Настройки профиля студента и локального хранилища"
            >
              <UserCheck
                className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400"
                aria-hidden="true"
              />
              <span className="hidden lg:inline max-w-[130px] truncate">
                {profileLabel}
              </span>
            </Link>
          </div>
        </header>

        {/* Основной контент страницы с компактными отступами */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-5 sm:py-5">
          {children}
        </main>

        {/* Тонкий нижний колонтитул */}
        <footer className="mt-auto border-t border-slate-200/70 bg-white/60 px-3 py-2.5 text-[11px] text-slate-500 sm:px-5 dark:border-slate-800/70 dark:bg-navy-900/40 dark:text-slate-400">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
            <span>
              <strong>PharmaSphere</strong> • Клинический справочник и практикум
              (Демо-прототип)
            </span>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hover:text-teal-700 dark:hover:text-teal-400"
              >
                Главная сайта
              </Link>
              <Link
                href="/app/drugs"
                className="hover:text-teal-700 dark:hover:text-teal-400"
              >
                Препараты
              </Link>
              <Link
                href="/app/groups"
                className="hover:text-teal-700 dark:hover:text-teal-400"
              >
                Фармгруппы
              </Link>
              <Link
                href="/app/settings"
                className="hover:text-teal-700 dark:hover:text-teal-400"
              >
                Настройки
              </Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Модальное окно глобального поиска */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Компактное всплывающее уведомление */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 flex max-w-xs items-center gap-2 rounded-lg border border-slate-800 bg-navy-900 px-3 py-2 text-xs font-medium text-white shadow-lg dark:border-slate-700"
        >
          {notification.tone === "success" ? (
            <CheckCircle2
              className="h-3.5 w-3.5 shrink-0 text-teal-400"
              aria-hidden="true"
            />
          ) : (
            <Info
              className="h-3.5 w-3.5 shrink-0 text-cyan-400"
              aria-hidden="true"
            />
          )}
          <span className="flex-1 leading-snug">{notification.message}</span>
          <button
            type="button"
            onClick={dismissNotification}
            className="rounded p-0.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Закрыть уведомление"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
