import React from "react";
import { Badge } from "@/components/ui/badge";

interface MilestoneBannerProps {
  sectionTitle: string;
  milestoneTarget: string;
  purposeDescription: string;
  currentStatusDescription?: string;
  plannedCapabilities?: string[];
  rightSlot?: React.ReactNode;
}

/**
 * Единая шапка разделов приложения в стиле современного медицинского SaaS.
 */
export function MilestoneBanner({
  sectionTitle,
  milestoneTarget,
  purposeDescription,
  rightSlot,
}: MilestoneBannerProps) {
  return (
    <header
      aria-label={`Раздел: ${sectionTitle}`}
      className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center dark:border-slate-800/80"
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {sectionTitle}
          </h1>
          <Badge variant="outline" className="text-[11px]">
            {milestoneTarget}
          </Badge>
        </div>
        <p className="max-w-2xl text-[13px] text-slate-500 dark:text-slate-400">
          {purposeDescription}
        </p>
      </div>

      {rightSlot && (
        <div className="flex shrink-0 items-center gap-2">{rightSlot}</div>
      )}
    </header>
  );
}
