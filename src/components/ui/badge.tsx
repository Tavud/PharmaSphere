import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "teal"
  | "navy"
  | "amber"
  | "emerald"
  | "rose"
  | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-slate-100 text-slate-700 border-slate-200/90 dark:bg-slate-800/90 dark:text-slate-300 dark:border-slate-700",
  teal:
    "bg-teal-50/80 text-teal-800 border-teal-200/80 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60",
  navy:
    "bg-slate-900 text-slate-100 border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
  amber:
    "bg-amber-50/80 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
  emerald:
    "bg-emerald-50/80 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60",
  rose:
    "bg-rose-50/80 text-rose-800 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60",
  outline:
    "bg-transparent text-slate-600 border-slate-200 dark:text-slate-400 dark:border-slate-700",
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] font-medium leading-none tracking-tight",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
