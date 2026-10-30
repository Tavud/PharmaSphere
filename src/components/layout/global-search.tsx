"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CornerDownLeft,
  Layers,
  Pill,
  Search,
  X,
} from "lucide-react";
import {
  getQuickSearchSuggestions,
  searchPharmacologyCatalog,
} from "@/lib/search";
import { SearchResult } from "@/types/pharmacology";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppState } from "@/features/preferences/app-state-context";

const SUGGESTED_SEARCH_CHIPS = [
  "Метопролол",
  "Лизиноприл",
  "Бета-адреноблокаторы",
  "Атропин",
  "Петлевые диуретики",
  "NKCC2",
] as const;

interface SearchResultsListProps {
  query: string;
  results: SearchResult[];
  activeIndex: number;
  onHoverIndex: (index: number) => void;
  onSelectResult: (result: SearchResult) => void;
  onSelectSuggestionChip: (term: string) => void;
  listboxId: string;
}

function SearchResultsList({
  query,
  results,
  activeIndex,
  onHoverIndex,
  onSelectResult,
  onSelectSuggestionChip,
  listboxId,
}: SearchResultsListProps) {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length > 0 && results.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-xs font-medium text-slate-900 dark:text-slate-100">
          По запросу «{trimmedQuery}» совпадений не найдено
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          В демо-каталоге 7 препаратов и 6 групп. Примеры запросов:
        </p>
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
          {SUGGESTED_SEARCH_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onSelectSuggestionChip(chip)}
              className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:border-teal-400 hover:bg-teal-50/60 hover:text-teal-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
      <div className="flex items-center justify-between bg-slate-50/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-900 dark:text-slate-400">
        <span>
          {trimmedQuery.length > 0
            ? `Найдено в демо-каталоге: ${results.length}`
            : "Быстрый переход (Демо-каталог)"}
        </span>
        <span className="hidden sm:inline font-normal normal-case text-slate-400">
          ↑↓ и Enter
        </span>
      </div>

      <ul
        id={listboxId}
        role="listbox"
        aria-label="Результаты поиска по справочнику фармакологии"
        className="max-h-72 overflow-y-auto p-1"
      >
        {results.map((result, index) => {
          const isSelected = index === activeIndex;
          const isDrug = result.category === "drug";

          return (
            <li
              key={result.id}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={isSelected}
            >
              <button
                type="button"
                onMouseEnter={() => onHoverIndex(index)}
                onClick={() => onSelectResult(result)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                  isSelected
                    ? "bg-teal-50/90 text-slate-900 dark:bg-teal-950/50 dark:text-slate-100"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                )}
              >
                {isDrug ? (
                  <Pill
                    className="h-3.5 w-3.5 shrink-0 text-teal-600 dark:text-teal-400"
                    aria-hidden="true"
                  />
                ) : (
                  <Layers
                    className="h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400"
                    aria-hidden="true"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {result.title}
                    </span>
                    <Badge
                      variant={isDrug ? "teal" : "default"}
                      className="text-[10px]"
                    >
                      {isDrug ? "Препарат" : "Группа"}
                    </Badge>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      • {result.matchedField}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {result.subtitle}
                  </p>
                </div>

                <div className="flex shrink-0 items-center text-xs text-teal-700 dark:text-teal-400">
                  {isSelected ? (
                    <CornerDownLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <ArrowRight
                      className="h-3.5 w-3.5 opacity-50"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Компактная встроенная строка глобального поиска (высота 36px / h-9).
 */
export function GlobalSearchInline({ className }: { className?: string }) {
  const router = useRouter();
  const { recordStudyActivity } = useAppState();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    if (!query.trim()) {
      return getQuickSearchSuggestions();
    }
    return searchPharmacologyCatalog(query);
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelectResult = (result: SearchResult) => {
    recordStudyActivity({
      entityId: result.id.replace(
        /^search-(drug|group)-|^suggest-(drug|group)-/,
        ""
      ),
      itemType: result.category === "drug" ? "drug" : "group",
      title: result.title,
      categoryLabel:
        result.category === "drug"
          ? "Справочник препаратов (Поиск)"
          : "Фармакологическая группа (Поиск)",
      href: result.href,
      timestampLabel: `Найдено через поиск${
        query.trim() ? ` («${query.trim()}»)` : ""
      }`,
    });
    setIsOpen(false);
    router.push(result.href);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      if (results.length > 0) {
        setActiveIndex((prev) => (prev + 1) % results.length);
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      if (results.length > 0) {
        setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (event.key === "Enter") {
      if (isOpen && results[activeIndex]) {
        event.preventDefault();
        handleSelectResult(results[activeIndex]);
      } else if (query.trim().length > 0 && results[0]) {
        event.preventDefault();
        handleSelectResult(results[0]);
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-400"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            isOpen && results[activeIndex]
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          aria-label="Поиск препаратов по МНН, рецепторам или фармакологическим группам"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Поиск по МНН (Метопролол, Лизиноприл), мишени (β1, NKCC2) или фармгруппе..."
          className="h-9 w-full rounded-md border border-slate-200/90 bg-white pl-8 pr-8 text-[13px] text-slate-900 placeholder:text-slate-400 transition-colors focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Очистить поисковый запрос"
            className="absolute right-2 flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-40 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <SearchResultsList
            query={query}
            results={results}
            activeIndex={activeIndex}
            onHoverIndex={setActiveIndex}
            onSelectResult={handleSelectResult}
            onSelectSuggestionChip={(chip) => {
              setQuery(chip);
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            listboxId={listboxId}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Компактное модальное окно глобального поиска (Ctrl+K).
 */
interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const { recordStudyActivity } = useAppState();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    if (!query.trim()) {
      return getQuickSearchSuggestions();
    }
    return searchPharmacologyCatalog(query);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 20);
      function handleGlobalEscape(e: KeyboardEvent) {
        if (e.key === "Escape") {
          onClose();
        }
      }
      window.addEventListener("keydown", handleGlobalEscape);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("keydown", handleGlobalEscape);
      };
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!isOpen) {
    return null;
  }

  const handleSelectResult = (result: SearchResult) => {
    recordStudyActivity({
      entityId: result.id.replace(
        /^search-(drug|group)-|^suggest-(drug|group)-/,
        ""
      ),
      itemType: result.category === "drug" ? "drug" : "group",
      title: result.title,
      categoryLabel:
        result.category === "drug"
          ? "Справочник препаратов (Поиск)"
          : "Фармакологическая группа (Поиск)",
      href: result.href,
      timestampLabel: `Найдено через быстрый поиск${
        query.trim() ? ` («${query.trim()}»)` : ""
      }`,
    });
    onClose();
    router.push(result.href);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev + 1) % results.length);
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (event.key === "Enter") {
      if (results[activeIndex]) {
        event.preventDefault();
        handleSelectResult(results[activeIndex]);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Глобальный поиск по фармакологии"
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 p-3 pt-14 sm:pt-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex items-center border-b border-slate-100 px-3 py-2 dark:border-slate-800">
          <Search
            className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-autocomplete="list"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите МНН, рецептор или фармакологическую группу..."
            className="w-full bg-transparent px-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="mr-1.5 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              aria-label="Очистить поле поиска"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно поиска"
            className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          >
            ESC
          </button>
        </div>

        <SearchResultsList
          query={query}
          results={results}
          activeIndex={activeIndex}
          onHoverIndex={setActiveIndex}
          onSelectResult={handleSelectResult}
          onSelectSuggestionChip={(chip) => {
            setQuery(chip);
            inputRef.current?.focus();
          }}
          listboxId={listboxId}
        />
      </div>
    </div>
  );
}
