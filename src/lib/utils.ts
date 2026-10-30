import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatRelativeSessionTime(isoDateString: string): string {
  const timestamp = Date.parse(isoDateString);
  if (Number.isNaN(timestamp)) {
    return "В текущей сессии";
  }

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSeconds < 60) {
    return "Только что";
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} мин. назад в сессии`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} ч. назад в сессии`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} дн. назад`;
}
