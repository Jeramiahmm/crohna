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
      return "#7A8A96";
    case "career":
      return "#D6CFC7";
    case "achievement":
      return "#BFC3C7";
    case "education":
      return "#9A9590";
    case "life":
      return "#8A9A8A";
    default:
      return "#A1A1A1";
  }
}

export function getCategoryIcon(category?: string): string {
  switch (category) {
    case "travel":
      return "—";
    case "career":
      return "—";
    case "achievement":
      return "—";
    case "education":
      return "—";
    case "life":
      return "—";
    default:
      return "—";
  }
}
