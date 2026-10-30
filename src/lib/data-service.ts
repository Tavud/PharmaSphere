import {
  DEMO_DRUGS,
  DEMO_LEARNING_MODULES,
  DEMO_PHARMACOLOGICAL_GROUPS,
  DEMO_QUIZ_QUESTIONS,
} from "@/data/pharmacology-data";
import {
  Drug,
  LearningModule,
  PharmacologicalGroup,
  QuizQuestion,
} from "@/types/pharmacology";

/**
 * Выделенный слой доступа к данным PharmaSphere.
 *
 * UI-компоненты и модули обращаются к сущностям исключительно через эти функции.
 * На следующих этапах их можно переключить на запросы к Supabase без изменения компонентов.
 */

export function getAllDrugs(): readonly Drug[] {
  return DEMO_DRUGS;
}

export function getFeaturedDrugs(): Drug[] {
  return DEMO_DRUGS.filter((drug) => drug.isFeatured);
}

export function getDrugById(drugId: string): Drug | undefined {
  return DEMO_DRUGS.find(
    (drug) => drug.id === drugId || drug.slug === drugId
  );
}

export function getDrugsByGroupId(groupId: string): Drug[] {
  return DEMO_DRUGS.filter((drug) => drug.groupId === groupId);
}

export function getAllPharmacologicalGroups(): readonly PharmacologicalGroup[] {
  return DEMO_PHARMACOLOGICAL_GROUPS;
}

export function getPharmacologicalGroupById(
  groupId: string
): PharmacologicalGroup | undefined {
  return DEMO_PHARMACOLOGICAL_GROUPS.find(
    (group) => group.id === groupId || group.slug === groupId
  );
}

export function getAllLearningModules(): readonly LearningModule[] {
  return DEMO_LEARNING_MODULES;
}

export function getLearningModuleById(
  moduleId: string
): LearningModule | undefined {
  return DEMO_LEARNING_MODULES.find(
    (mod) => mod.id === moduleId || mod.slug === moduleId
  );
}

export function getAllQuizQuestions(): readonly QuizQuestion[] {
  return DEMO_QUIZ_QUESTIONS;
}

export function getQuizQuestionById(
  questionId: string
): QuizQuestion | undefined {
  return DEMO_QUIZ_QUESTIONS.find((q) => q.id === questionId);
}
