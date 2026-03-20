import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function getCategoryColor(category?: string): string {
  switch (category) {
    case "travel":
      return "rgba(96, 165, 250, 0.8)";  // blue
    case "career":
      return "rgba(251, 191, 36, 0.8)";  // amber
    case "achievement":
      return "rgba(52, 211, 153, 0.8)";  // emerald
    case "education":
      return "rgba(167, 139, 250, 0.8)";  // violet
    case "life":
      return "rgba(251, 113, 133, 0.8)";  // rose
    default:
      return "rgba(148, 163, 184, 0.8)";  // slate
  }
}

/**
 * Resolve image URLs, converting gphotos:// placeholders to proxy URLs.
 */
export function resolveImageUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("gphotos://")) {
    const mediaItemId = url.slice("gphotos://".length);
    return `/api/google/photos/proxy?id=${encodeURIComponent(mediaItemId)}`;
  }
  return url;
}

export function getSeason(dateStr: string): string {
  const month = new Date(dateStr).getMonth();
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
}

/**
 * Group events by year, sorted descending by year and by date within each year.
 */
export function getEventsByYear<T extends { date: string }>(events: T[]): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};
  for (const event of events) {
    const year = new Date(event.date).getFullYear().toString();
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push(event);
  }
  const sorted: Record<string, T[]> = {};
  for (const year of Object.keys(grouped).sort((a, b) => Number(b) - Number(a))) {
    sorted[year] = grouped[year].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
  return sorted;
}
