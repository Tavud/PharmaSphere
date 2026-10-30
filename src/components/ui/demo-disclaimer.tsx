import React from "react";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoDisclaimerProps {
  className?: string;
  compact?: boolean;
}

/**
 * Компактное медицинское и образовательное уведомление о демонстрационных данных.
 */
export function DemoDisclaimer({ className }: DemoDisclaimerProps) {
  return (
    <aside
      aria-label="Учебное и клиническое предупреждение"
      className={cn(
        "flex items-start gap-2.5 rounded-lg border border-slate-200/80 bg-slate-100/70 px-3.5 py-2.5 text-[11px] leading-relaxed text-slate-600 dark:border-slate-800/80 dark:bg-slate-900/50 dark:text-slate-400",
        className
      )}
    >
      <ShieldAlert
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400"
        aria-hidden="true"
      />
      <p>
        <strong className="font-semibold text-slate-700 dark:text-slate-300">
          Демонстрационный учебный режим:
        </strong>{" "}
        справочник содержит локальную выборку данных для изучения механизмов
        фармакологии. Не является полным клиническим реестром или руководством
        по назначению терапии.
      </p>
    </aside>
  );
}
