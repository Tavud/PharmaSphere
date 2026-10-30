"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bookmark,
  CheckCircle2,
  ClipboardCheck,
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

export interface NavGroup {
  id: string;
  title?: string;
  items: readonly NavItem[];
}

export const NAVIGATION_GROUPS: readonly NavGroup[] = [
  {
    id: "main",
    items: [
      {
        label: "Главная",
        href: "/app",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "library",
    title: "Библиотека",
    items: [
      {
        label: "Препараты",
        href: "/app/drugs",
        icon: Pill,
      },
      {
        label: "Фармакологические группы",
        href: "/app/groups",
        icon: Layers,
      },
    ],
  },
  {
    id: "education",
    title: "Обучение",
    items: [
      {
        label: "Модули",
        href: "/app/learning",
        icon: GraduationCap,
      },
      {
        label: "Тестирование",
        href: "/app/quiz",
        icon: ClipboardCheck,
      },
      {
        label: "Прогресс",
        href: "/app/progress",
        icon: Activity,
      },
    ],
  },
  {
    id: "personal",
    title: "Личное",
    items: [
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
    ],
  },
] as const;

function isRouteActive(pathname: string, itemHref: string): boolean {
  if (itemHref === "/app") {
    return pathname === "/app";
  }
  return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
}

function resolveSectionBreadcrumb(pathname: string): string {
  if (pathname === "/app") return "Рабочее пространство";
  if (pathname.startsWith("/app/drugs/")) return "Библиотека / Профиль препарата";
  if (pathname.startsWith("/app/drugs")) return "Библиотека / Препараты";
  if (pathname.startsWith("/app/groups"))
    return "Библиотека / Фармакологические группы";
  if (pathname.startsWith("/app/learning")) return "Обучение / Модули";
  if (pathname.startsWith("/app/quiz")) return "Обучение / Тестирование";
  if (pathname.startsWith("/app/progress")) return "Обучение / Прогресс";
  if (pathname.startsWith("/app/favorites")) return "Личное / Избранное";
  if (pathname.startsWith("/app/settings")) return "Личное / Настройки";
  return "Рабочее пространство";
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
      : "Профиль студента";

  const currentBreadcrumb = resolveSectionBreadcrumb(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-900 md:flex-row dark:bg-[#090D16] dark:text-slate-100">
      {/* Подложка мобильного меню */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Компактная структурированная боковая панель (240px) */}
      <aside
        aria-label="Основная навигация приложения"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-slate-200/80 bg-white transition-transform duration-200 ease-out md:sticky md:top-0 md:h-screen md:translate-x-0 dark:border-slate-800/80 dark:bg-[#0C111D]",
          mobileMenuOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
        )}
      >
        {/* Шапка бренда (переход на презентационную страницу `/`) */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-800/70">
          <Link
            href="/"
            title="Презентационная страница PharmaSphere"
            className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <polygon
                  points="12,3 19.5,7.3 19.5,16.7 12,21 4.5,16.7 4.5,7.3"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="2.2" fill="currentColor" />
              </svg>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-semibold tracking-tight text-slate-900 dark:text-white">
                PharmaSphere
              </span>
              <span className="rounded bg-teal-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                Demo
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:hidden dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Закрыть меню навигации"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Группированная навигация */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {NAVIGATION_GROUPS.map((group) => (
            <div key={group.id} className="space-y-1">
              {group.title && (
                <p className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.title}
                </p>
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isRouteActive(pathname, item.href);
                  const showFavoritesCount =
                    item.href === "/app/favorites" && favorites.length > 0;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                        active
                          ? "bg-teal-50/90 text-teal-900 dark:bg-teal-950/50 dark:text-teal-200"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active
                            ? "text-teal-600 dark:text-teal-400"
                            : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                        )}
                        aria-hidden="true"
                      />
                      <span className="flex-1 truncate">{item.label}</span>

                      {showFavoritesCount && (
                        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {favorites.length}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Аккуратный статус-блок внизу сайдбара без дублирующих кнопок */}
        <div className="border-t border-slate-100 p-3 dark:border-slate-800/70">
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
            <div className="flex items-center justify-between font-medium text-slate-700 dark:text-slate-300">
              <span>Локальная база (Demo)</span>
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
              7 препаратов • 6 групп • 5 тестов
            </p>
          </div>
        </div>
      </aside>

      {/* Основная рабочая область */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Верхняя панель (56px) */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-8 dark:border-slate-800/80 dark:bg-[#0C111D]/90">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 md:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Открыть меню навигации"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>

            <span className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
              {currentBreadcrumb}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200/90 bg-slate-50/80 px-3 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200"
              aria-label="Быстрый поиск по справочнику (Ctrl+K)"
            >
              <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span className="hidden sm:inline">Быстрый поиск...</span>
              <kbd className="hidden sm:inline-block rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                Ctrl+K
              </kbd>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/90 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label={
                preferences.theme === "dark"
                  ? "Включить светлую тему"
                  : "Включить темную тему"
              }
              title={
                preferences.theme === "dark"
                  ? "Светлая тема"
                  : "Темная тема"
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
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              title="Настройки профиля"
            >
              <UserCheck
                className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400"
                aria-hidden="true"
              />
              <span className="hidden lg:inline max-w-[140px] truncate">
                {profileLabel}
              </span>
            </Link>
          </div>
        </header>

        {/* Основной контейнер страницы с достаточным свободным пространством */}
        <main className="mx-auto w-full max-w-[1140px] flex-1 px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>

      {/* Модальное окно глобального поиска */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Всплывающее уведомление */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex max-w-xs items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-white shadow-lg dark:border-slate-700"
        >
          {notification.tone === "success" ? (
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-teal-400"
              aria-hidden="true"
            />
          ) : (
            <Info
              className="h-4 w-4 shrink-0 text-cyan-400"
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
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
