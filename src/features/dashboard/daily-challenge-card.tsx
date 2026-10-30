"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, RotateCcw, Shuffle, XCircle } from "lucide-react";
import { getAllQuizQuestions, getDrugById } from "@/lib/data-service";
import { useAppState } from "@/features/preferences/app-state-context";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DailyChallengeCard() {
  const questions = getAllQuizQuestions();
  const {
    progress,
    submitChallengeAnswer,
    setActiveChallengeQuestion,
    resetChallengeDemo,
  } = useAppState();

  const currentQuestionIndex = Math.max(
    0,
    questions.findIndex((q) => q.id === progress.activeChallengeQuestionId)
  );
  const currentQuestion = questions[currentQuestionIndex] ?? questions[0];

  if (!currentQuestion) {
    return null;
  }

  const answeredRecord = progress.answeredChallenges[currentQuestion.id];
  const isAnswered = Boolean(answeredRecord);
  const relatedDrug = getDrugById(currentQuestion.relatedDrugId);

  const handleSelectOption = (optionId: "A" | "B" | "C" | "D") => {
    if (isAnswered) {
      return;
    }
    const isCorrect = optionId === currentQuestion.correctOptionId;
    submitChallengeAnswer(
      currentQuestion.id,
      optionId,
      isCorrect,
      currentQuestion.title
    );
  };

  const handleNextQuestion = () => {
    const nextIndex = (currentQuestionIndex + 1) % questions.length;
    const nextQ = questions[nextIndex];
    if (nextQ) {
      setActiveChallengeQuestion(nextQ.id);
    }
  };

  return (
    <Card id="daily-challenge" className="flex flex-col">
      <CardHeader className="bg-slate-900 text-white py-2.5 px-4 rounded-t-lg border-b border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-white text-[14px]">
            Вопрос дня по фармакологии
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-teal-300 border border-slate-700">
              {currentQuestionIndex + 1}/{questions.length}
            </span>
            <Badge variant="amber" className="text-[10px]">
              Демо
            </Badge>
          </div>
        </div>
        <p className="text-[11px] text-slate-300 truncate">
          {currentQuestion.title} • {currentQuestion.organSystem}
        </p>
      </CardHeader>

      <CardContent className="flex-1 p-3.5 space-y-3">
        <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">
          {currentQuestion.stem}
        </p>

        <div
          role="radiogroup"
          aria-label={currentQuestion.title}
          className="space-y-1.5"
        >
          {currentQuestion.options.map((option) => {
            const isSelected = answeredRecord?.selectedOptionId === option.id;
            const isCorrectOption =
              option.id === currentQuestion.correctOptionId;

            let optionStateStyles =
              "border-slate-200 bg-white hover:border-teal-500 hover:bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-500";

            if (isAnswered) {
              if (isCorrectOption) {
                optionStateStyles =
                  "border-emerald-500/80 bg-emerald-50/70 text-emerald-950 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-100";
              } else if (isSelected && !isCorrectOption) {
                optionStateStyles =
                  "border-rose-400 bg-rose-50/70 text-rose-950 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-100";
              } else {
                optionStateStyles =
                  "border-slate-200/60 bg-slate-50/40 text-slate-400 opacity-75 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-500";
              }
            }

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={isAnswered}
                onClick={() => handleSelectOption(option.id)}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-md border px-2.5 py-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-default",
                  optionStateStyles
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded font-mono text-[10px] font-semibold",
                    isAnswered && isCorrectOption
                      ? "bg-emerald-600 text-white"
                      : isAnswered && isSelected && !isCorrectOption
                      ? "bg-rose-600 text-white"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  )}
                >
                  {option.id}
                </span>

                <span className="flex-1 leading-snug">{option.text}</span>

                {isAnswered && isCorrectOption && (
                  <CheckCircle2
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                    aria-label="Правильный вариант ответа"
                  />
                )}
                {isAnswered && isSelected && !isCorrectOption && (
                  <XCircle
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-400"
                    aria-label="Выбранный неверный вариант"
                  />
                )}
              </button>
            );
          })}
        </div>

        {isAnswered && answeredRecord && (
          <div
            role="region"
            aria-label="Разбор ответа на вопрос дня"
            className={cn(
              "rounded-md border p-2.5 space-y-1.5 text-xs leading-normal",
              answeredRecord.isCorrect
                ? "border-emerald-200 bg-emerald-50/60 text-slate-800 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-slate-200"
                : "border-amber-200 bg-amber-50/60 text-slate-800 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-slate-200"
            )}
          >
            <div className="flex items-center justify-between gap-2 font-semibold">
              <span>
                {answeredRecord.isCorrect
                  ? `Верно (вариант ${currentQuestion.correctOptionId})`
                  : `Неверно (выбрано ${answeredRecord.selectedOptionId}, верно — ${currentQuestion.correctOptionId})`}
              </span>
              <span className="text-[10px] font-normal text-slate-500">
                Ответ заблокирован
              </span>
            </div>

            <p className="text-[12px] text-slate-700 dark:text-slate-300">
              {currentQuestion.conciseExplanation}
            </p>

            <p className="font-mono text-[11px] font-medium text-teal-800 dark:text-teal-300">
              {currentQuestion.mechanismTakeaway}
            </p>

            {relatedDrug && (
              <p className="text-[11px] text-slate-500">
                Препарат:{" "}
                <Link
                  href={`/app/drugs/${relatedDrug.id}`}
                  className="font-semibold text-teal-700 underline hover:text-teal-800 dark:text-teal-400"
                >
                  {relatedDrug.genericName}
                </Link>
              </p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-slate-50/60 py-2 px-3.5 dark:bg-slate-900/40">
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextQuestion}
          aria-label="Переключить на другой демо-вопрос по фармакологии"
        >
          <Shuffle
            className="h-3 w-3 text-teal-600 dark:text-teal-400"
            aria-hidden="true"
          />
          <span>Другой вопрос</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={resetChallengeDemo}
          aria-label="Сбросить состояние демонстрационного вопроса дня"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          <span>Сбросить</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
