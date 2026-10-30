import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Compass, Pill } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#040814] px-4 py-12 text-slate-100">
      <div className="w-full max-w-md rounded-xl border border-slate-800/80 bg-slate-900/70 p-6 text-center shadow-2xl backdrop-blur-md space-y-4">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-teal-500/30 bg-teal-950/60 text-teal-300">
          <Compass className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="space-y-1.5">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-teal-400">
            Ошибка 404 • Маршрут не найден
          </p>
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Запрошенный раздел не существует
          </h1>
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-slate-400">
            Страница или карточка препарата по указанному адресу отсутствует в
            демонстрационном пространстве PharmaSphere.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Link
            href="/"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/90 px-3 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>На главную</span>
          </Link>

          <Link
            href="/app"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-teal-600 px-3 text-xs font-medium text-white transition-colors hover:bg-teal-500"
          >
            <span>Открыть приложение</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>

          <Link
            href="/app/drugs"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/90 px-3 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <Pill className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
            <span>Препараты</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
