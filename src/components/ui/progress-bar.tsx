import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
  indicatorClassName?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label = "Прогресс обучения",
  className,
  indicatorClassName,
}: ProgressBarProps) {
  const clampedPercentage = Math.min(
    100,
    Math.max(0, Math.round((value / Math.max(1, max)) * 100))
  );

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clampedPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-teal-600 transition-all duration-300 ease-out dark:bg-teal-500",
          indicatorClassName
        )}
        style={{ width: `${clampedPercentage}%` }}
      />
    </div>
  );
}
