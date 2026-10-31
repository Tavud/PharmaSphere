"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Pill,
  RotateCcw,
  XCircle,
} from "lucide-react";
import {
  getAllQuizQuestions,
  getDrugById,
  getPharmacologicalGroupById,
} from "@/lib/data-service";
import { useAppState } from "@/features/preferences/app-state-context";
import { MilestoneBanner } from "@/components/ui/milestone-banner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DemoDisclaimer } from "@/components/ui/demo-disclaimer";
import { cn } from "@/lib/utils";

export default function QuizTestingPage() {
  const questions = getAllQuizQuestions();
  const {
    progress,
    preferences,
    submitChallengeAnswer,
    setActiveChallengeQuestion,
    restartQuizSession,
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
  const relatedGroup = getPharmacologicalGroupById(
    currentQuestion.relatedGroupId
  );

  const answeredEntries = Object.values(progress.answeredChallenges);
  const answeredCount = answeredEntries.length;
  const sessionCorrectCount = answeredEntries.filter((r) => r.isCorrect).length;
  const sessionIncorrectCount = answeredCount - sessionCorrectCount;
  const sessionAccuracyPct =
    answeredCount > 0
      ? Math.round((sessionCorrectCount / answeredCount) * 100)
      : 0;
  const isAllQuestionsAnswered = answeredCount === questions.length;

  const handleSelectOption = (optionId: "A" | "B" | "C" | "D") => {
    if (isAnswered) return;
    const isCorrect = optionId === currentQuestion.correctOptionId;
    submitChallengeAnswer(
      currentQuestion.id,
      optionId,
      isCorrect,
      currentQuestion.title
    );
  };

  const handlePrevQuestion = () => {
    const prevIndex =
      (currentQuestionIndex - 1 + questions.length) % questions.length;
    const prevQ = questions[prevIndex];
    if (prevQ) {
      setActiveChallengeQuestion(prevQ.id);
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = (currentQuestionIndex + 1) % questions.length;
    const nextQ = questions[nextIndex];
    if (nextQ) {
      setActiveChallengeQuestion(nextQ.id);
    }
  };

  return (
    <div className="space-y-6">
      <MilestoneBanner
        sectionTitle="Тестирование"
        milestoneTarget={`Демо-задач: ${questions.length}`}
        purposeDescription="Клинико-фармакологические ситуационные задачи (демонстрационный набор) с проверкой ответа, разбором механизма и подсчётом результата."
        rightSlot={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/app/progress"
              className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              Страница прогресса
            </Link>
            <Button variant="outline" size="sm" onClick={restartQuizSession}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Пройти заново</span>
            </Button>
          </div>
        }
      />

      {/* Навигатор по тестовым задачам и счётчик текущей попытки */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Вопросы теста:
          </span>
          {questions.map((q, idx) => {
            const record = progress.answeredChallenges[q.id];
            const isCurrent = q.id === currentQuestion.id;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setActiveChallengeQuestion(q.id)}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors",
                  isCurrent
                    ? "border-teal-600 bg-teal-50 text-teal-900 dark:border-teal-400 dark:bg-teal-950/60 dark:text-teal-200"
                    : record
                    ? record.isCorrect
                      ? "border-emerald-200 bg-emerald-50/50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : "border-rose-200 bg-rose-50/50 text-rose-800 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-300"
                    : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                )}
              >
                <span className="font-mono font-semibold">#{idx + 1}</span>
                <span className="hidden sm:inline truncate max-w-[140px]">
                  {q.title}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Отвечено:{" "}
            <strong className="font-mono font-semibold text-slate-900 dark:text-white">
              {answeredCount} / {questions.length}
            </strong>
          </span>
          {answeredCount > 0 && (
            <span>
              Верно:{" "}
              <strong className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                {sessionCorrectCount} ({sessionAccuracyPct}%)
              </strong>
            </span>
          )}
        </div>
      </Card>

      {/* Основная карточка клинического вопроса */}
      <Card className="overflow-hidden">
        <CardHeader className="space-y-2 bg-slate-50/60 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="teal">{currentQuestion.organSystem}</Badge>
              <Badge variant="outline">{currentQuestion.difficulty}</Badge>
              <Badge variant="amber" className="text-[10px]">
                Демо-вопрос
              </Badge>
            </div>
            <span className="font-mono text-xs text-slate-400">
              Вопрос {currentQuestionIndex + 1} из {questions.length}
            </span>
          </div>

          <CardTitle className="text-base">{currentQuestion.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5 p-5 sm:p-6">
          <p className="text-[14px] leading-relaxed text-slate-900 dark:text-slate-100">
            {currentQuestion.stem}
          </p>

          <div
            role="radiogroup"
            aria-label={currentQuestion.title}
            className="space-y-2.5"
          >
            {currentQuestion.options.map((option) => {
              const isSelected = answeredRecord?.selectedOptionId === option.id;
              const isCorrectOption =
                option.id === currentQuestion.correctOptionId;

              let optionStateStyles =
                "border-slate-200/90 bg-white hover:border-teal-500/60 hover:bg-slate-50/70 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-500/60";

              if (isAnswered) {
                if (isCorrectOption) {
                  optionStateStyles =
                    "border-emerald-500/80 bg-emerald-50/70 text-emerald-950 dark:border-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-100";
                } else if (isSelected && !isCorrectOption) {
                  optionStateStyles =
                    "border-rose-400 bg-rose-50/70 text-rose-950 dark:border-rose-700 dark:bg-rose-950/30 dark:text-rose-100";
                } else {
                  optionStateStyles =
                    "border-slate-200/60 bg-slate-50/40 text-slate-400 opacity-75 dark:border-slate-800/60 dark:bg-slate-900/30 dark:text-slate-500";
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
                    "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-default",
                    optionStateStyles
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold",
                      isAnswered && isCorrectOption
                        ? "bg-emerald-600 text-white"
                        : isAnswered && isSelected && !isCorrectOption
                        ? "bg-rose-600 text-white"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    )}
                  >
                    {option.id}
                  </span>

                  <span className="flex-1 leading-relaxed">{option.text}</span>

                  {isAnswered && isCorrectOption && (
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      aria-label="Правильный ответ"
                    />
                  )}
                  {isAnswered && isSelected && !isCorrectOption && (
                    <XCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400"
                      aria-label="Неверный ответ"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Обратная связь после выбора ответа */}
          {isAnswered && answeredRecord && (
            <div
              role="region"
              aria-label="Клинический разбор ответа"
              className={cn(
                "rounded-xl border p-4 space-y-2.5 text-[13px] leading-relaxed",
                answeredRecord.isCorrect
                  ? "border-emerald-200 bg-emerald-50/50 text-slate-800 dark:border-emerald-800/60 dark:bg-emerald-950/25 dark:text-slate-200"
                  : "border-amber-200 bg-amber-50/50 text-slate-800 dark:border-amber-800/60 dark:bg-amber-950/25 dark:text-slate-200"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {answeredRecord.isCorrect
                    ? `Верно! Правильный вариант — ${currentQuestion.correctOptionId}`
                    : `Ответ неверный (выбран вариант ${answeredRecord.selectedOptionId}, правильный ответ — ${currentQuestion.correctOptionId})`}
                </p>
                <Badge variant="outline" className="text-[10px]">
                  Клинический разбор
                </Badge>
              </div>

              <p className="text-slate-700 dark:text-slate-300">
                {currentQuestion.conciseExplanation}
              </p>

              {preferences.showClinicalMnemonics && (
                <div className="rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 font-mono text-xs text-teal-800 dark:border-slate-800 dark:bg-slate-900/70 dark:text-teal-300">
                  {currentQuestion.mechanismTakeaway}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                {relatedDrug && (
                  <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Pill
                      className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400"
                      aria-hidden="true"
                    />
                    <span>Препарат:</span>
                    <Link
                      href={`/app/drugs/${relatedDrug.id}`}
                      className="font-semibold text-teal-700 hover:underline dark:text-teal-400"
                    >
                      {relatedDrug.genericName}
                    </Link>
                  </span>
                )}

                {relatedGroup && (
                  <span className="text-slate-600 dark:text-slate-400">
                    Фармгруппа:{" "}
                    <Link
                      href={`/app/groups?group=${relatedGroup.id}`}
                      className="font-semibold text-teal-700 hover:underline dark:text-teal-400"
                    >
                      {relatedGroup.name}
                    </Link>
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-slate-50/50 dark:bg-slate-900/40">
          <Button variant="outline" size="sm" onClick={handlePrevQuestion}>
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Предыдущий вопрос</span>
          </Button>

          <Button variant="primary" size="sm" onClick={handleNextQuestion}>
            <span>Следующий вопрос</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </CardFooter>
      </Card>

      {/* Итоговый результат тестирования (текущая попытка) */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <div className="flex items-center gap-2">
            <Award
              className="h-4 w-4 text-teal-600 dark:text-teal-400"
              aria-hidden="true"
            />
            <CardTitle>
              {isAllQuestionsAnswered
                ? "Тестирование завершено — итоговый результат"
                : "Текущий результат тестирования"}
            </CardTitle>
          </div>
          <Badge variant={isAllQuestionsAnswered ? "emerald" : "outline"}>
            {isAllQuestionsAnswered
              ? "Все задачи решены"
              : `Решено ${answeredCount} из ${questions.length}`}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-slate-500 dark:text-slate-400">
                Точность в текущем тесте
              </p>
              <p className="mt-1 font-mono text-lg font-semibold text-slate-900 dark:text-white">
                {answeredCount > 0 ? `${sessionAccuracyPct}%` : "—"}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/40 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <p className="text-emerald-800 dark:text-emerald-300">
                Правильных ответов
              </p>
              <p className="mt-1 font-mono text-lg font-semibold text-emerald-900 dark:text-emerald-200">
                {sessionCorrectCount} из {questions.length}
              </p>
            </div>

            <div className="rounded-xl border border-rose-200/70 bg-rose-50/40 p-3.5 dark:border-rose-900/50 dark:bg-rose-950/20">
              <p className="text-rose-800 dark:text-rose-300">
                Неправильных ответов
              </p>
              <p className="mt-1 font-mono text-lg font-semibold text-rose-900 dark:text-rose-200">
                {sessionIncorrectCount}
              </p>
            </div>
          </div>

          <ProgressBar
            value={Math.round((answeredCount / questions.length) * 100)}
            label="Прогресс прохождения текущего теста"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Все ваши ответы автоматически сохраняются в браузере и учитываются
              на странице «Прогресс».
            </p>
            <Button variant="outline" size="sm" onClick={restartQuizSession}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Пройти тест заново</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <DemoDisclaimer />
    </div>
  );
}
