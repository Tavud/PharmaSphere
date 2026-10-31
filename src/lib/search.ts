import {
  getAllDrugs,
  getAllLearningModules,
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
 * - Ищет по МНН, торговым названиям, синонимам, фармакологическим классам,
 *   рецепторным мишеням, механизмам действия, показаниям, фармакологическим группам
 *   и учебным модулям/темам.
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
  const modules = getAllLearningModules();

  for (const drug of drugs) {
    const parentGroup = getPharmacologicalGroupById(drug.groupId);
    const genericLower = drug.genericName.toLowerCase();
    const slugLower = drug.slug.toLowerCase();
    const classLower = drug.pharmacologicalClass.toLowerCase();
    const groupNameLower = parentGroup ? parentGroup.name.toLowerCase() : "";
    const groupShortLower = parentGroup ? parentGroup.shortName.toLowerCase() : "";
    const tradeMatch = drug.tradeNames.find((tn) =>
      tn.toLowerCase().includes(normalizedQuery)
    );
    const aliasMatch = drug.commonReferenceAliases.find((alias) =>
      alias.toLowerCase().includes(normalizedQuery)
    );
    const targetLower = drug.primaryTarget.toLowerCase();
    const mechanismLower = drug.mechanismOfAction.toLowerCase();
    const indicationMatch = drug.classicIndications.find((ind) =>
      ind.toLowerCase().includes(normalizedQuery)
    );

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
      score = 82;
      matchedField = "МНН препарата";
    } else if (tradeMatch) {
      score = 78;
      matchedField = `Торговое название (${tradeMatch})`;
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
      score = 58;
      matchedField = `Мишень (${drug.primaryTarget})`;
    } else if (mechanismLower.includes(normalizedQuery)) {
      score = 50;
      matchedField = "Механизм действия";
    } else if (indicationMatch) {
      score = 45;
      matchedField = "Показание к применению";
    }

    if (score > 0) {
      scoredResults.push({
        score,
        result: {
          id: `search-drug-${drug.id}`,
          category: "drug",
          title: drug.genericName,
          subtitle: `${drug.pharmacologicalClass} • ${drug.tradeNames.join(", ")}`,
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
    const mechLower = group.mechanismSummary.toLowerCase();

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
      score = 52;
      matchedField = `Мишень (${group.primaryTarget})`;
    } else if (mechLower.includes(normalizedQuery)) {
      score = 44;
      matchedField = "Механизм группы";
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

  for (const mod of modules) {
    const titleLower = mod.title.toLowerCase();
    const subtitleLower = mod.subtitle.toLowerCase();
    const matchedTopic = mod.topics.find(
      (t) =>
        t.title.toLowerCase().includes(normalizedQuery) ||
        t.summary.toLowerCase().includes(normalizedQuery)
    );

    let score = 0;
    let matchedField = "Учебный модуль";

    if (titleLower.includes(normalizedQuery)) {
      score = 70;
      matchedField = "Название модуля";
    } else if (subtitleLower.includes(normalizedQuery)) {
      score = 62;
      matchedField = "Программа модуля";
    } else if (matchedTopic) {
      score = 56;
      matchedField = `Тема ${matchedTopic.number}: ${matchedTopic.title}`;
    }

    if (score > 0) {
      scoredResults.push({
        score,
        result: {
          id: `search-module-${mod.id}`,
          category: "module",
          title: mod.title,
          subtitle: mod.subtitle,
          badgeText: mod.organSystem,
          description: matchedTopic ? matchedTopic.summary : mod.subtitle,
          matchedField,
          href: `/app/learning?module=${mod.id}`,
        },
      });
    }
  }

  return scoredResults
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.result.title.localeCompare(b.result.title, "ru")
    )
    .map((entry) => entry.result);
}

/**
 * Возвращает рекомендуемые позиции при открытии поиска до ввода запроса.
 */
export function getQuickSearchSuggestions(): SearchResult[] {
  const featured = getAllDrugs().slice(0, 3);
  const topGroups = getAllPharmacologicalGroups().slice(0, 2);
  const topModule = getAllLearningModules()[0];

  return [
    ...featured.map((drug) => ({
      id: `suggest-drug-${drug.id}`,
      category: "drug" as const,
      title: drug.genericName,
      subtitle: `${drug.pharmacologicalClass} • ${drug.tradeNames.join(", ")}`,
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
      matchedField: "Фармакологическая группа",
      href: `/app/groups?group=${group.id}`,
    })),
    ...(topModule
      ? [
          {
            id: `suggest-module-${topModule.id}`,
            category: "module" as const,
            title: topModule.title,
            subtitle: topModule.subtitle,
            badgeText: topModule.organSystem,
            description: topModule.subtitle,
            matchedField: "Учебный материал",
            href: `/app/learning?module=${topModule.id}`,
          },
        ]
      : []),
  ];
}
