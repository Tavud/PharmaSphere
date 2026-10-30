import {
  getAllDrugs,
  getAllPharmacologicalGroups,
  getPharmacologicalGroupById,
} from "@/lib/data-service";
import { SearchResult } from "@/types/pharmacology";

interface ScoredSearchResult {
  result: SearchResult;
  score: number;
}

/**
 * Поисковый движок по демонстрационному каталогу фармакологии.
 * - Ищет по русским и международным названиям (МНН), синонимам, классам,
 *   рецепторным мишеням и фармакологическим группам.
 * - Нечувствителен к регистру и поддерживает частичные совпадения.
 * - Ранжирует точные и префиксные совпадения выше внутренних подстрок.
 */
export function searchPharmacologyCatalog(rawQuery: string): SearchResult[] {
  const normalizedQuery = rawQuery.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  const scoredResults: ScoredSearchResult[] = [];
  const drugs = getAllDrugs();
  const groups = getAllPharmacologicalGroups();

  for (const drug of drugs) {
    const parentGroup = getPharmacologicalGroupById(drug.groupId);
    const genericLower = drug.genericName.toLowerCase();
    const slugLower = drug.slug.toLowerCase();
    const classLower = drug.pharmacologicalClass.toLowerCase();
    const groupNameLower = parentGroup ? parentGroup.name.toLowerCase() : "";
    const groupShortLower = parentGroup ? parentGroup.shortName.toLowerCase() : "";
    const aliasMatch = drug.commonReferenceAliases.find((alias) =>
      alias.toLowerCase().includes(normalizedQuery)
    );
    const targetLower = drug.primaryTarget.toLowerCase();

    let score = 0;
    let matchedField = "МНН препарата";

    if (genericLower === normalizedQuery || slugLower === normalizedQuery) {
      score = 100;
      matchedField = "Точное совпадение МНН";
    } else if (
      genericLower.startsWith(normalizedQuery) ||
      slugLower.startsWith(normalizedQuery)
    ) {
      score = 90;
      matchedField = "МНН препарата";
    } else if (genericLower.includes(normalizedQuery)) {
      score = 80;
      matchedField = "МНН препарата";
    } else if (aliasMatch) {
      score = 75;
      matchedField = `Синоним / форма (${aliasMatch})`;
    } else if (
      classLower.includes(normalizedQuery) ||
      groupNameLower.includes(normalizedQuery) ||
      groupShortLower.includes(normalizedQuery)
    ) {
      score = 65;
      matchedField = "Фармакологический класс";
    } else if (targetLower.includes(normalizedQuery)) {
      score = 55;
      matchedField = `Мишень (${drug.primaryTarget})`;
    }

    if (score > 0) {
      scoredResults.push({
        score,
        result: {
          id: `search-drug-${drug.id}`,
          category: "drug",
          title: drug.genericName,
          subtitle: drug.pharmacologicalClass,
          badgeText: drug.organSystem,
          description: drug.shortDescription,
          matchedField,
          href: `/app/drugs/${drug.id}`,
        },
      });
    }
  }

  for (const group of groups) {
    const nameLower = group.name.toLowerCase();
    const shortLower = group.shortName.toLowerCase();
    const systemLower = group.organSystem.toLowerCase();
    const targetLower = group.primaryTarget.toLowerCase();

    let score = 0;
    let matchedField = "Фармакологическая группа";

    if (shortLower === normalizedQuery || nameLower === normalizedQuery) {
      score = 95;
      matchedField = "Точное совпадение группы";
    } else if (
      shortLower.startsWith(normalizedQuery) ||
      nameLower.startsWith(normalizedQuery)
    ) {
      score = 85;
      matchedField = "Название группы";
    } else if (
      shortLower.includes(normalizedQuery) ||
      nameLower.includes(normalizedQuery)
    ) {
      score = 72;
      matchedField = "Название группы";
    } else if (systemLower.includes(normalizedQuery)) {
      score = 60;
      matchedField = `Система (${group.organSystem})`;
    } else if (targetLower.includes(normalizedQuery)) {
      score = 50;
      matchedField = `Мишень (${group.primaryTarget})`;
    }

    if (score > 0) {
      scoredResults.push({
        score,
        result: {
          id: `search-group-${group.id}`,
          category: "group",
          title: group.name,
          subtitle: `${group.shortName} • ${group.primaryTarget}`,
          badgeText: group.organSystem,
          description: group.mechanismSummary,
          matchedField,
          href: `/app/groups?group=${group.id}`,
        },
      });
    }
  }

  return scoredResults
    .sort((a, b) => b.score - a.score || a.result.title.localeCompare(b.result.title, "ru"))
    .map((entry) => entry.result);
}

/**
 * Возвращает рекомендуемые позиции при открытии поиска до ввода запроса.
 */
export function getQuickSearchSuggestions(): SearchResult[] {
  const featured = getAllDrugs().slice(0, 3);
  const topGroups = getAllPharmacologicalGroups().slice(0, 2);

  return [
    ...featured.map((drug) => ({
      id: `suggest-drug-${drug.id}`,
      category: "drug" as const,
      title: drug.genericName,
      subtitle: drug.pharmacologicalClass,
      badgeText: drug.organSystem,
      description: drug.shortDescription,
      matchedField: "Популярный препарат",
      href: `/app/drugs/${drug.id}`,
    })),
    ...topGroups.map((group) => ({
      id: `suggest-group-${group.id}`,
      category: "group" as const,
      title: group.name,
      subtitle: group.shortName,
      badgeText: group.organSystem,
      description: group.mechanismSummary,
      matchedField: "Базовая группа",
      href: `/app/groups?group=${group.id}`,
    })),
  ];
}
