/**
 * Основные доменные типы платформы PharmaSphere.
 * Все демонстрационные записи используют стабильные идентификаторы и явные внешние ключи,
 * чтобы слой доступа к данным в дальнейшем можно было легко переключить на Supabase/PostgreSQL.
 */

export type OrganSystem =
  | "Вегетативная нервная система"
  | "Сердечно-сосудистая система и почки"
  | "Центральная нервная система"
  | "Противомикробные средства"
  | "Эндокринная система и обмен веществ"
  | "Дыхательная система и аутакоиды";

export type DifficultyLevel =
  | "Базовый уровень"
  | "Клинический минимум"
  | "Повышенная сложность";

export interface PharmacologicalGroup {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  organSystem: OrganSystem;
  primaryTarget: string;
  classification: string[];
  mechanismSummary: string;
  clinicalOverview: string;
  keyRepresentatives: string[];
  prototypeDrugId: string;
  drugCountInDemo: number;
  isDemoContent: true;
}

export interface Drug {
  id: string;
  slug: string;
  genericName: string;
  tradeNames: string[];
  commonReferenceAliases: string[];
  groupId: string;
  pharmacologicalClass: string;
  organSystem: OrganSystem;
  primaryTarget: string;
  mechanismOfAction: string;
  pharmacodynamics: string;
  shortDescription: string;
  educationalSummary: string;
  dosingSummary: string;
  keyPharmacokinetics: {
    routeSummary: string;
    absorptionAndDistribution: string;
    halfLifeRange: string;
    eliminationSummary: string;
  };
  classicIndications: string[];
  contraindicationNotes: string[];
  highYieldAdverseEffects: string[];
  drugInteractions: string[];
  specialConsiderations: string[];
  isFeatured: boolean;
  isDemoContent: true;
}

export interface QuizOption {
  id: "A" | "B" | "C" | "D";
  label: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  title: string;
  organSystem: OrganSystem;
  difficulty: DifficultyLevel;
  relatedDrugId: string;
  relatedGroupId: string;
  stem: string;
  options: readonly [QuizOption, QuizOption, QuizOption, QuizOption];
  correctOptionId: "A" | "B" | "C" | "D";
  conciseExplanation: string;
  mechanismTakeaway: string;
  isDemoContent: true;
}

export interface LearningModuleTopic {
  id: string;
  number: number;
  title: string;
  summary: string;
  durationMinutes: number;
  keyPoints: string[];
  clinicalNote: string;
}

export interface LearningModule {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  organSystem: OrganSystem;
  difficulty: DifficultyLevel;
  relatedGroupId: string;
  totalUnits: number;
  completedUnitsDefault: number;
  estimatedMinutes: number;
  defaultProgressPercent: number;
  lastTopicTitle: string;
  learningObjectives: string[];
  topics: LearningModuleTopic[];
  isDemoContent: true;
}

export interface AnsweredChallengeRecord {
  questionId: string;
  selectedOptionId: "A" | "B" | "C" | "D";
  isCorrect: boolean;
  answeredAtIso: string;
}

export interface LearningProgress {
  /** Базовые демонстрационные показатели + ответы текущей сессии */
  questionsAnswered: number;
  correctAnswersCount: number;
  accuracyPercentage: number;
  studyTopicsCompleted: number;
  currentStreakDays: number;
  /** Прогресс по ID учебного модуля (0..100) */
  moduleProgressMap: Record<string, number>;
  /** Список ID реально изученных тем учебных модулей */
  completedTopicIds: string[];
  /** Количество завершённых сессий тестирования */
  completedQuizzesCount: number;
  /** Записанные ответы на тестовые вопросы для защиты от повторного начисления баллов */
  answeredChallenges: Record<string, AnsweredChallengeRecord>;
  /** ID текущего активного вопроса тестирования */
  activeChallengeQuestionId: string;
  isDemoBaseline: boolean;
}

export type FavoriteEntityType = "drug" | "group" | "module";

export interface FavoriteEntry {
  id: string;
  entityId: string;
  entityType: FavoriteEntityType;
  title: string;
  subtitle: string;
  href: string;
  addedAtIso: string;
  isDefaultDemo?: boolean;
}

export type RecentStudyItemType = "drug" | "group" | "module" | "challenge";

export interface RecentStudyItem {
  id: string;
  entityId: string;
  itemType: RecentStudyItemType;
  title: string;
  categoryLabel: string;
  href: string;
  timestampLabel: string;
  recordedAtIso: string;
  /** true, если элемент взят из начального демо-набора до реальных действий пользователя */
  isSeededDemoEntry: boolean;
}

export type ThemePreference = "light" | "dark";

export interface UserPreferences {
  displayName: string;
  studyTrackLabel: string;
  theme: ThemePreference;
  showClinicalMnemonics: boolean;
  compactCards: boolean;
}

export type SearchResultCategory = "drug" | "group" | "module";

export interface SearchResult {
  id: string;
  category: SearchResultCategory;
  title: string;
  subtitle: string;
  badgeText: string;
  description: string;
  matchedField: string;
  href: string;
}
