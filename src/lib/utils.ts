import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
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
      return "rgba(255,255,255,0.8)";
    case "career":
      return "rgba(255,255,255,0.6)";
    case "achievement":
      return "rgba(255,255,255,0.9)";
    case "education":
      return "rgba(255,255,255,0.5)";
    case "life":
      return "rgba(255,255,255,0.7)";
    default:
      return "rgba(255,255,255,0.8)";
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
