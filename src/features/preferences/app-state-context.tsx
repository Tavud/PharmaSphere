"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_DEMO_FAVORITES,
  DEFAULT_DEMO_LEARNING_PROGRESS,
  DEFAULT_SAMPLE_RECENT_ITEMS,
  DEFAULT_USER_PREFERENCES,
  DEMO_LEARNING_MODULES,
  DEMO_QUIZ_QUESTIONS,
} from "@/data/pharmacology-data";
import {
  clearAllPrototypeStorage,
  loadFavorites,
  loadLearningProgress,
  loadUserPreferences,
  loadUserRecentActivity,
  saveFavorites,
  saveLearningProgress,
  saveUserPreferences,
  saveUserRecentActivity,
} from "@/lib/storage";
import {
  FavoriteEntry,
  LearningProgress,
  RecentStudyItem,
  RecentStudyItemType,
  UserPreferences,
} from "@/types/pharmacology";

export interface FeedbackNotification {
  id: string;
  message: string;
  tone: "info" | "success" | "neutral";
}

interface AppStateContextValue {
  isHydrated: boolean;
  preferences: UserPreferences;
  favorites: readonly FavoriteEntry[];
  progress: LearningProgress;
  recentItems: readonly RecentStudyItem[];
  hasUserSessionHistory: boolean;
  notification: FeedbackNotification | null;
  dismissNotification: () => void;
  notify: (message: string, tone?: "info" | "success" | "neutral") => void;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  toggleTheme: () => void;
  isFavorite: (entityId: string) => boolean;
  toggleFavorite: (entry: Omit<FavoriteEntry, "id" | "addedAtIso">) => void;
  restoreDefaultFavorites: () => void;
  advanceModuleProgress: (moduleId: string, moduleTitle: string) => void;
  toggleTopicCompletion: (
    moduleId: string,
    topicId: string,
    topicTitle: string,
    moduleTitle: string
  ) => void;
  submitChallengeAnswer: (
    questionId: string,
    selectedOptionId: "A" | "B" | "C" | "D",
    isCorrect: boolean,
    questionTitle: string
  ) => void;
  setActiveChallengeQuestion: (questionId: string) => void;
  restartQuizSession: () => void;
  resetChallengeDemo: () => void;
  recordStudyActivity: (params: {
    entityId: string;
    itemType: RecentStudyItemType;
    title: string;
    categoryLabel: string;
    href: string;
    timestampLabel?: string;
  }) => void;
  clearSessionHistory: () => void;
  resetAllPrototypeData: () => void;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(
  undefined
);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(
    DEFAULT_USER_PREFERENCES
  );
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([
    ...DEFAULT_DEMO_FAVORITES,
  ]);
  const [progress, setProgress] = useState<LearningProgress>(
    DEFAULT_DEMO_LEARNING_PROGRESS
  );
  const [userRecentItems, setUserRecentItems] = useState<RecentStudyItem[]>([]);
  const [notification, setNotification] = useState<FeedbackNotification | null>(
    null
  );

  useEffect(() => {
    const storedPrefs = loadUserPreferences();
    const storedFavorites = loadFavorites();
    const storedProgress = loadLearningProgress();
    const storedRecent = loadUserRecentActivity();

    setPreferences(storedPrefs);
    setFavorites(storedFavorites);
    setProgress(storedProgress);
    setUserRecentItems(storedRecent);
    setIsHydrated(true);
  }, []);

  // Синхронизация класса темы на корневом элементе документа
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (preferences.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [preferences.theme]);

  // Автоматическое скрытие уведомления через 4 секунды
  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const notify = useCallback(
    (message: string, tone: "info" | "success" | "neutral" = "info") => {
      setNotification({
        id: `notif-${Date.now()}`,
        message,
        tone,
      });
    },
    []
  );

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const updatePreferences = useCallback(
    (patch: Partial<UserPreferences>) => {
      setPreferences((prev) => {
        const updated: UserPreferences = { ...prev, ...patch };
        saveUserPreferences(updated);
        return updated;
      });
    },
    []
  );

  const toggleTheme = useCallback(() => {
    setPreferences((prev) => {
      const nextTheme = prev.theme === "dark" ? "light" : "dark";
      const updated: UserPreferences = { ...prev, theme: nextTheme };
      saveUserPreferences(updated);
      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (entityId: string) => {
      return favorites.some((fav) => fav.entityId === entityId);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (entry: Omit<FavoriteEntry, "id" | "addedAtIso">) => {
      setFavorites((prev) => {
        const exists = prev.some((item) => item.entityId === entry.entityId);
        let next: FavoriteEntry[];
        if (exists) {
          next = prev.filter((item) => item.entityId !== entry.entityId);
          notify(`«${entry.title}» удалено из избранного`, "neutral");
        } else {
          const newEntry: FavoriteEntry = {
            ...entry,
            id: `fav-${entry.entityId}-${Date.now()}`,
            addedAtIso: new Date().toISOString(),
            isDefaultDemo: false,
          };
          next = [newEntry, ...prev];
          notify(`«${entry.title}» добавлено в избранное`, "success");
        }
        saveFavorites(next);
        return next;
      });
    },
    [notify]
  );

  const restoreDefaultFavorites = useCallback(() => {
    const defaults = [...DEFAULT_DEMO_FAVORITES];
    setFavorites(defaults);
    saveFavorites(defaults);
    notify("Демонстрационный список избранного восстановлен", "info");
  }, [notify]);

  const recordStudyActivity = useCallback(
    (params: {
      entityId: string;
      itemType: RecentStudyItemType;
      title: string;
      categoryLabel: string;
      href: string;
      timestampLabel?: string;
    }) => {
      setUserRecentItems((prev) => {
        const nowIso = new Date().toISOString();
        const newItem: RecentStudyItem = {
          id: `recent-${params.entityId}-${Date.now()}`,
          entityId: params.entityId,
          itemType: params.itemType,
          title: params.title,
          categoryLabel: params.categoryLabel,
          href: params.href,
          timestampLabel:
            params.timestampLabel ?? "Просмотрено в текущей сессии",
          recordedAtIso: nowIso,
          isSeededDemoEntry: false,
        };
        const deduplicated = prev.filter(
          (existing) => existing.entityId !== params.entityId
        );
        const updated = [newItem, ...deduplicated].slice(0, 8);
        saveUserRecentActivity(updated);
        return updated;
      });
    },
    []
  );

  const toggleTopicCompletion = useCallback(
    (
      moduleId: string,
      topicId: string,
      topicTitle: string,
      moduleTitle: string
    ) => {
      const targetModule = DEMO_LEARNING_MODULES.find((m) => m.id === moduleId);
      setProgress((prev) => {
        const alreadyCompleted = prev.completedTopicIds.includes(topicId);
        const nextCompletedTopicIds = alreadyCompleted
          ? prev.completedTopicIds.filter((id) => id !== topicId)
          : [...prev.completedTopicIds, topicId];

        let nextModulePct = prev.moduleProgressMap[moduleId] ?? 0;
        if (targetModule && targetModule.topics.length > 0) {
          const completedInMod = targetModule.topics.filter((t) =>
            nextCompletedTopicIds.includes(t.id)
          ).length;
          nextModulePct = Math.round(
            (completedInMod / targetModule.topics.length) * 100
          );
        }

        const nextProgress: LearningProgress = {
          ...prev,
          studyTopicsCompleted: nextCompletedTopicIds.length,
          completedTopicIds: nextCompletedTopicIds,
          moduleProgressMap: {
            ...prev.moduleProgressMap,
            [moduleId]: nextModulePct,
          },
          isDemoBaseline: false,
        };
        saveLearningProgress(nextProgress);
        return nextProgress;
      });

      recordStudyActivity({
        entityId: moduleId,
        itemType: "module",
        title: `${moduleTitle} — ${topicTitle}`,
        categoryLabel: "Учебный модуль",
        href: `/app/learning?module=${moduleId}`,
        timestampLabel: "Обновлен статус изучения темы",
      });
      notify(`Обновлен статус темы «${topicTitle}»`, "success");
    },
    [notify, recordStudyActivity]
  );

  const advanceModuleProgress = useCallback(
    (moduleId: string, moduleTitle: string) => {
      const targetModule = DEMO_LEARNING_MODULES.find((m) => m.id === moduleId);

      setProgress((prev) => {
        const nextCompletedIds = [...prev.completedTopicIds];
        let nextPct = prev.moduleProgressMap[moduleId] ?? 0;

        if (targetModule && targetModule.topics.length > 0) {
          const nextUnfinished = targetModule.topics.find(
            (t) => !nextCompletedIds.includes(t.id)
          );
          if (nextUnfinished) {
            nextCompletedIds.push(nextUnfinished.id);
          }
          const completedInMod = targetModule.topics.filter((t) =>
            nextCompletedIds.includes(t.id)
          ).length;
          nextPct = Math.round(
            (completedInMod / targetModule.topics.length) * 100
          );
        } else {
          if (nextPct >= 100) return prev;
          nextPct = Math.min(100, nextPct + 25);
        }

        const nextProgress: LearningProgress = {
          ...prev,
          studyTopicsCompleted: nextCompletedIds.length,
          completedTopicIds: nextCompletedIds,
          moduleProgressMap: {
            ...prev.moduleProgressMap,
            [moduleId]: nextPct,
          },
          isDemoBaseline: false,
        };
        saveLearningProgress(nextProgress);
        return nextProgress;
      });

      recordStudyActivity({
        entityId: moduleId,
        itemType: "module",
        title: moduleTitle,
        categoryLabel: "Учебный модуль",
        href: `/app/learning?module=${moduleId}`,
        timestampLabel: "Завершена очередная тема модуля",
      });
      notify(`Отмечена пройденной тема в модуле «${moduleTitle}»`, "success");
    },
    [notify, recordStudyActivity]
  );

  const submitChallengeAnswer = useCallback(
    (
      questionId: string,
      selectedOptionId: "A" | "B" | "C" | "D",
      isCorrect: boolean,
      questionTitle: string
    ) => {
      setProgress((prev) => {
        // Защита от повторного начисления баллов за уже отвеченный вопрос
        if (prev.answeredChallenges[questionId]) {
          return prev;
        }
        const nextQuestionsAnswered = prev.questionsAnswered + 1;
        const nextCorrectCount =
          prev.correctAnswersCount + (isCorrect ? 1 : 0);
        const nextAccuracy = Math.round(
          (nextCorrectCount / Math.max(1, nextQuestionsAnswered)) * 100
        );

        const nextAnsweredChallenges = {
          ...prev.answeredChallenges,
          [questionId]: {
            questionId,
            selectedOptionId,
            isCorrect,
            answeredAtIso: new Date().toISOString(),
          },
        };

        const isFullTestNowComplete =
          Object.keys(nextAnsweredChallenges).length ===
          DEMO_QUIZ_QUESTIONS.length;

        const nextProgress: LearningProgress = {
          ...prev,
          questionsAnswered: nextQuestionsAnswered,
          correctAnswersCount: nextCorrectCount,
          accuracyPercentage: nextAccuracy,
          completedQuizzesCount: isFullTestNowComplete
            ? prev.completedQuizzesCount + 1
            : prev.completedQuizzesCount,
          answeredChallenges: nextAnsweredChallenges,
          isDemoBaseline: false,
        };
        saveLearningProgress(nextProgress);
        return nextProgress;
      });

      recordStudyActivity({
        entityId: questionId,
        itemType: "challenge",
        title: `Тестовая задача: ${questionTitle}`,
        categoryLabel: isCorrect
          ? "Задача решена верно"
          : "Разобрана задача",
        href: "/app/quiz",
        timestampLabel: isCorrect
          ? "Дан верный ответ в текущей сессии"
          : "Изучено пояснение в текущей сессии",
      });
    },
    [recordStudyActivity]
  );

  const setActiveChallengeQuestion = useCallback((questionId: string) => {
    setProgress((prev) => {
      const next: LearningProgress = {
        ...prev,
        activeChallengeQuestionId: questionId,
      };
      saveLearningProgress(next);
      return next;
    });
  }, []);

  const restartQuizSession = useCallback(() => {
    setProgress((prev) => {
      const next: LearningProgress = {
        ...prev,
        answeredChallenges: {},
        activeChallengeQuestionId:
          DEMO_QUIZ_QUESTIONS[0]?.id ?? "quiz-acei-bradykinin",
      };
      saveLearningProgress(next);
      return next;
    });
    notify("Текущая попытка тестирования сброшена для повторного прохождения", "info");
  }, [notify]);

  const resetChallengeDemo = useCallback(() => {
    setProgress(() => {
      const resetState: LearningProgress = {
        ...DEFAULT_DEMO_LEARNING_PROGRESS,
      };
      saveLearningProgress(resetState);
      return resetState;
    });
    notify(
      "Тестирование и демо-статистика обучения сброшены к исходным значениям",
      "info"
    );
  }, [notify]);

  const clearSessionHistory = useCallback(() => {
    setUserRecentItems([]);
    saveUserRecentActivity([]);
    notify(
      "История текущей сессии очищена; показаны начальные демо-записи",
      "neutral"
    );
  }, [notify]);

  const resetAllPrototypeData = useCallback(() => {
    clearAllPrototypeStorage();
    setPreferences(DEFAULT_USER_PREFERENCES);
    setFavorites([...DEFAULT_DEMO_FAVORITES]);
    setProgress(DEFAULT_DEMO_LEARNING_PROGRESS);
    setUserRecentItems([]);
    notify(
      "Все локальные настройки и демо-данные прототипа восстановлены",
      "info"
    );
  }, [notify]);

  const hasUserSessionHistory = userRecentItems.length > 0;
  const recentItems = useMemo(() => {
    if (userRecentItems.length > 0) {
      return userRecentItems;
    }
    return DEFAULT_SAMPLE_RECENT_ITEMS;
  }, [userRecentItems]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      isHydrated,
      preferences,
      favorites,
      progress,
      recentItems,
      hasUserSessionHistory,
      notification,
      dismissNotification,
      notify,
      updatePreferences,
      toggleTheme,
      isFavorite,
      toggleFavorite,
      restoreDefaultFavorites,
      advanceModuleProgress,
      toggleTopicCompletion,
      submitChallengeAnswer,
      setActiveChallengeQuestion,
      restartQuizSession,
      resetChallengeDemo,
      recordStudyActivity,
      clearSessionHistory,
      resetAllPrototypeData,
    }),
    [
      isHydrated,
      preferences,
      favorites,
      progress,
      recentItems,
      hasUserSessionHistory,
      notification,
      dismissNotification,
      notify,
      updatePreferences,
      toggleTheme,
      isFavorite,
      toggleFavorite,
      restoreDefaultFavorites,
      advanceModuleProgress,
      toggleTopicCompletion,
      submitChallengeAnswer,
      setActiveChallengeQuestion,
      restartQuizSession,
      resetChallengeDemo,
      recordStudyActivity,
      clearSessionHistory,
      resetAllPrototypeData,
    ]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState должен вызываться внутри AppStateProvider");
  }
  return context;
}
