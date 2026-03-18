import { describe, it, expect } from "vitest";
import { formatDate, formatDateShort, getCategoryColor, resolveImageUrl, getSeason } from "@/lib/utils";

describe("formatDate", () => {
  it("formats a date string to long format", () => {
    const result = formatDate("2024-03-15");
    expect(result).toContain("March");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });
});

describe("formatDateShort", () => {
  it("formats a date string to short format", () => {
    const result = formatDateShort("2024-03-15");
    expect(result).toContain("Mar");
    expect(result).toContain("2024");
  });
});

describe("getCategoryColor", () => {
  it("returns distinct colors for known categories", () => {
    const travel = getCategoryColor("travel");
    const career = getCategoryColor("career");
    const achievement = getCategoryColor("achievement");
    const education = getCategoryColor("education");
    const life = getCategoryColor("life");

    // All should be valid rgba strings
    expect(travel).toMatch(/rgba\(/);
    expect(career).toMatch(/rgba\(/);
    expect(achievement).toMatch(/rgba\(/);
    expect(education).toMatch(/rgba\(/);
    expect(life).toMatch(/rgba\(/);

    // Different categories should have different opacity values
    expect(travel).not.toBe(career);
    expect(education).not.toBe(achievement);
  });

  it("returns a default color for unknown categories", () => {
    const result = getCategoryColor("unknown");
    expect(result).toMatch(/rgba\(/);
  });

  it("returns a default color for undefined", () => {
    const result = getCategoryColor(undefined);
    expect(result).toMatch(/rgba\(/);
  });
});

describe("resolveImageUrl", () => {
  it("returns undefined for undefined input", () => {
    expect(resolveImageUrl(undefined)).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(resolveImageUrl("")).toBeUndefined();
  });

  it("passes through normal URLs unchanged", () => {
    const url = "https://images.unsplash.com/photo-123.jpg";
    expect(resolveImageUrl(url)).toBe(url);
  });

  it("converts gphotos:// URLs to proxy URLs", () => {
    const result = resolveImageUrl("gphotos://ABC123XYZ");
    expect(result).toBe("/api/google/photos/proxy?id=ABC123XYZ");
  });

  it("properly encodes special characters in gphotos IDs", () => {
    const result = resolveImageUrl("gphotos://id+with spaces&special");
    expect(result).toContain("/api/google/photos/proxy?id=");
    expect(result).toContain(encodeURIComponent("id+with spaces&special"));
  });
});

describe("getSeason", () => {
  it("returns Spring for March-May", () => {
    expect(getSeason("2024-03-15")).toBe("Spring");
    expect(getSeason("2024-04-01")).toBe("Spring");
    expect(getSeason("2024-05-31")).toBe("Spring");
  });

  it("returns Summer for June-August", () => {
    expect(getSeason("2024-06-01")).toBe("Summer");
    expect(getSeason("2024-08-15")).toBe("Summer");
  });

  it("returns Fall for September-November", () => {
    expect(getSeason("2024-09-01")).toBe("Fall");
    expect(getSeason("2024-11-30")).toBe("Fall");
  });

  it("returns Winter for December-February", () => {
    expect(getSeason("2024-12-01")).toBe("Winter");
    expect(getSeason("2024-01-15")).toBe("Winter");
    expect(getSeason("2024-02-28")).toBe("Winter");
  });
});
