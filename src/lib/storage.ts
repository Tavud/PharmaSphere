import {
  DEFAULT_DEMO_FAVORITES,
  DEFAULT_DEMO_LEARNING_PROGRESS,
  DEFAULT_USER_PREFERENCES,
  DEMO_DRUGS,
  DEMO_LEARNING_MODULES,
  DEMO_PHARMACOLOGICAL_GROUPS,
  DEMO_QUIZ_QUESTIONS,
} from "@/data/pharmacology-data";
import {
  AnsweredChallengeRecord,
  FavoriteEntry,
  LearningProgress,
  RecentStudyItem,
  UserPreferences,
} from "@/types/pharmacology";

/**
 * Клиентский модуль сохранения состояния прототипа PharmaSphere в localStorage.
 *
 * Архитектурные гарантии:
 * 1. Безопасен при серверном рендеринге (SSR) — не обращается к `window` на сервере.
 * 2. Перехватывает исключения при недоступном хранилище или режиме инкогнито.
 * 3. Проверяет структуру JSON при чтении, возвращая безопасные значения по умолчанию.
 * 4. Автоматически русифицирует заголовки и метки для записей, сохраненных до локализации.
 */

export const STORAGE_KEYS = {
  PREFERENCES: "pharmasphere.v1.preferences",
  FAVORITES: "pharmasphere.v1.favorites",
  PROGRESS: "pharmasphere.v1.progress",
  RECENT_ACTIVITY: "pharmasphere.v1.recent_activity",
} as const;

function isBrowserStorageAvailable(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const testKey = "__pharmasphere_storage_probe__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeReadJson<T>(
  key: string,
  validator: (raw: unknown) => T | null,
  fallback: T
): T {
  if (!isBrowserStorageAvailable()) {
    return fallback;
  }
  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      return fallback;
    }
    const parsed: unknown = JSON.parse(rawValue);
    const validated = validator(parsed);
    return validated !== null ? validated : fallback;
  } catch {
    return fallback;
  }
}

function safeWriteJson<T>(key: string, value: T): boolean {
  if (!isBrowserStorageAvailable()) {
    return false;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function resolveLocalizedEntityMeta(entityId: string): {
  title?: string;
  subtitle?: string;
} {
  const drug = DEMO_DRUGS.find((d) => d.id === entityId);
  if (drug) {
    return {
      title: drug.genericName,
      subtitle: drug.pharmacologicalClass,
    };
  }
  const group = DEMO_PHARMACOLOGICAL_GROUPS.find((g) => g.id === entityId);
  if (group) {
    return {
      title: group.name,
      subtitle: `${group.organSystem} • ${group.shortName}`,
    };
  }
  const mod = DEMO_LEARNING_MODULES.find((m) => m.id === entityId);
  if (mod) {
    return {
      title: mod.title,
      subtitle: mod.subtitle,
    };
  }
  const quiz = DEMO_QUIZ_QUESTIONS.find((q) => q.id === entityId);
  if (quiz) {
    return {
      title: `Вопрос дня: ${quiz.title}`,
      subtitle: quiz.organSystem,
    };
  }
  return {};
}

function localizeLegacyLabel(rawLabel: string): string {
  const map: Record<string, string> = {
    "Drug Monograph": "Карточка препарата",
    "Drug Reference (Search)": "Справочник препаратов (Поиск)",
    "Pharmacology Group (Search)": "Фармакологическая группа (Поиск)",
    "Learning Module": "Учебный модуль",
    "Challenge Completed (Correct)": "Задача решена верно",
    "Challenge Reviewed": "Разобрана задача дня",
    "Viewed in current session": "Просмотрено в текущей сессии",
    "Opened from Featured Drugs": "Открыто из блока «Популярные препараты»",
    "Opened from Drug Reference": "Открыто из «Справочника препаратов»",
    "Reviewed monograph profile": "Просмотрена карточка препарата",
    "Answered correctly in session": "Дан верный ответ в текущей сессии",
    "Reviewed explanation in session": "Изучено пояснение в текущей сессии",
  };
  return map[rawLabel] ?? rawLabel;
}

function normalizeAppHref(rawHref: string): string {
  if (rawHref === "/#daily-challenge" || rawHref === "/app#daily-challenge") {
    return "/app/quiz";
  }
  if (
    /^\/(drugs|groups|learning|quiz|progress|favorites|settings)(\/|\?|$|#)/.test(
      rawHref
    )
  ) {
    return `/app${rawHref}`;
  }
  return rawHref;
}

function validateUserPreferences(raw: unknown): UserPreferences | null {
  if (!isRecord(raw)) {
    return null;
  }
  const displayName =
    typeof raw.displayName === "string"
      ? raw.displayName.slice(0, 60)
      : DEFAULT_USER_PREFERENCES.displayName;

  const rawTrack =
    typeof raw.studyTrackLabel === "string" ? raw.studyTrackLabel.trim() : "";
  const studyTrackLabel =
    rawTrack.length > 0 &&
    rawTrack !== "Pre-Clinical Pharmacology (MS2 Demo Profile)"
      ? rawTrack.slice(0, 80)
      : DEFAULT_USER_PREFERENCES.studyTrackLabel;

  const theme =
    raw.theme === "dark" || raw.theme === "light"
      ? raw.theme
      : DEFAULT_USER_PREFERENCES.theme;
  const showClinicalMnemonics =
    typeof raw.showClinicalMnemonics === "boolean"
      ? raw.showClinicalMnemonics
      : DEFAULT_USER_PREFERENCES.showClinicalMnemonics;
  const compactCards =
    typeof raw.compactCards === "boolean"
      ? raw.compactCards
      : DEFAULT_USER_PREFERENCES.compactCards;

  return {
    displayName,
    studyTrackLabel,
    theme,
    showClinicalMnemonics,
    compactCards,
  };
}

function validateFavorites(raw: unknown): FavoriteEntry[] | null {
  if (!Array.isArray(raw)) {
    return null;
  }
  const validEntries: FavoriteEntry[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    if (
      typeof item.id === "string" &&
      typeof item.entityId === "string" &&
      (item.entityType === "drug" ||
        item.entityType === "group" ||
        item.entityType === "module") &&
      typeof item.title === "string" &&
      typeof item.subtitle === "string" &&
      typeof item.href === "string" &&
      typeof item.addedAtIso === "string"
    ) {
      const localized = resolveLocalizedEntityMeta(item.entityId);
      validEntries.push({
        id: item.id,
        entityId: item.entityId,
        entityType: item.entityType,
        title: localized.title ?? item.title,
        subtitle: localized.subtitle ?? item.subtitle,
        href: normalizeAppHref(item.href),
        addedAtIso: item.addedAtIso,
        isDefaultDemo: Boolean(item.isDefaultDemo),
      });
    }
  }
  return validEntries;
}

function validateLearningProgress(raw: unknown): LearningProgress | null {
  if (!isRecord(raw)) {
    return null;
  }
  if (
    typeof raw.questionsAnswered !== "number" ||
    typeof raw.correctAnswersCount !== "number" ||
    typeof raw.accuracyPercentage !== "number" ||
    typeof raw.studyTopicsCompleted !== "number" ||
    typeof raw.currentStreakDays !== "number"
  ) {
    return null;
  }

  const moduleProgressMap: Record<string, number> = {
    ...DEFAULT_DEMO_LEARNING_PROGRESS.moduleProgressMap,
  };
  if (isRecord(raw.moduleProgressMap)) {
    for (const [k, v] of Object.entries(raw.moduleProgressMap)) {
      if (typeof v === "number" && v >= 0 && v <= 100) {
        moduleProgressMap[k] = v;
      }
    }
  }

  const answeredChallenges: Record<string, AnsweredChallengeRecord> = {};
  if (isRecord(raw.answeredChallenges)) {
    for (const [k, v] of Object.entries(raw.answeredChallenges)) {
      if (
        isRecord(v) &&
        typeof v.questionId === "string" &&
        (v.selectedOptionId === "A" ||
          v.selectedOptionId === "B" ||
          v.selectedOptionId === "C" ||
          v.selectedOptionId === "D") &&
        typeof v.isCorrect === "boolean" &&
        typeof v.answeredAtIso === "string"
      ) {
        answeredChallenges[k] = {
          questionId: v.questionId,
          selectedOptionId: v.selectedOptionId,
          isCorrect: v.isCorrect,
          answeredAtIso: v.answeredAtIso,
        };
      }
    }
  }

  const activeChallengeQuestionId =
    typeof raw.activeChallengeQuestionId === "string" &&
    raw.activeChallengeQuestionId.length > 0
      ? raw.activeChallengeQuestionId
      : DEFAULT_DEMO_LEARNING_PROGRESS.activeChallengeQuestionId;

  return {
    questionsAnswered: Math.max(0, Math.floor(raw.questionsAnswered)),
    correctAnswersCount: Math.max(0, Math.floor(raw.correctAnswersCount)),
    accuracyPercentage: Math.min(
      100,
      Math.max(0, Math.round(raw.accuracyPercentage))
    ),
    studyTopicsCompleted: Math.max(0, Math.floor(raw.studyTopicsCompleted)),
    currentStreakDays: Math.max(0, Math.floor(raw.currentStreakDays)),
    moduleProgressMap,
    answeredChallenges,
    activeChallengeQuestionId,
    isDemoBaseline:
      typeof raw.isDemoBaseline === "boolean" ? raw.isDemoBaseline : true,
  };
}

function validateRecentActivity(raw: unknown): RecentStudyItem[] | null {
  if (!Array.isArray(raw)) {
    return null;
  }
  const items: RecentStudyItem[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    if (
      typeof item.id === "string" &&
      typeof item.entityId === "string" &&
      (item.itemType === "drug" ||
        item.itemType === "group" ||
        item.itemType === "module" ||
        item.itemType === "challenge") &&
      typeof item.title === "string" &&
      typeof item.categoryLabel === "string" &&
      typeof item.href === "string" &&
      typeof item.timestampLabel === "string" &&
      typeof item.recordedAtIso === "string"
    ) {
      const localized = resolveLocalizedEntityMeta(item.entityId);
      const localizedTitle =
        item.itemType === "drug" && localized.title && localized.subtitle
          ? `${localized.title} — ${localized.subtitle}`
          : localized.title ?? item.title;

      items.push({
        id: item.id,
        entityId: item.entityId,
        itemType: item.itemType,
        title: localizedTitle,
        categoryLabel: localizeLegacyLabel(item.categoryLabel),
        href: normalizeAppHref(item.href),
        timestampLabel: localizeLegacyLabel(item.timestampLabel),
        recordedAtIso: item.recordedAtIso,
        isSeededDemoEntry: Boolean(item.isSeededDemoEntry),
      });
    }
  }
  return items;
}

export function loadUserPreferences(): UserPreferences {
  return safeReadJson(
    STORAGE_KEYS.PREFERENCES,
    validateUserPreferences,
    DEFAULT_USER_PREFERENCES
  );
}

export function saveUserPreferences(preferences: UserPreferences): boolean {
  return safeWriteJson(STORAGE_KEYS.PREFERENCES, preferences);
}

export function loadFavorites(): FavoriteEntry[] {
  return safeReadJson(STORAGE_KEYS.FAVORITES, validateFavorites, [
    ...DEFAULT_DEMO_FAVORITES,
  ]);
}

export function saveFavorites(favorites: FavoriteEntry[]): boolean {
  return safeWriteJson(STORAGE_KEYS.FAVORITES, favorites);
}

export function loadLearningProgress(): LearningProgress {
  return safeReadJson(
    STORAGE_KEYS.PROGRESS,
    validateLearningProgress,
    DEFAULT_DEMO_LEARNING_PROGRESS
  );
}

export function saveLearningProgress(progress: LearningProgress): boolean {
  return safeWriteJson(STORAGE_KEYS.PROGRESS, progress);
}

export function loadUserRecentActivity(): RecentStudyItem[] {
  return safeReadJson(STORAGE_KEYS.RECENT_ACTIVITY, validateRecentActivity, []);
}

export function saveUserRecentActivity(items: RecentStudyItem[]): boolean {
  return safeWriteJson(STORAGE_KEYS.RECENT_ACTIVITY, items.slice(0, 8));
}

export function clearAllPrototypeStorage(): boolean {
  if (!isBrowserStorageAvailable()) {
    return false;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    window.localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    window.localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    window.localStorage.removeItem(STORAGE_KEYS.RECENT_ACTIVITY);
    return true;
  } catch {
    return false;
  }
}
