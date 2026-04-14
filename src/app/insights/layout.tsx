import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insights — Crohna",
  description: "Discover patterns in your life — most active years, favorite cities, biggest milestones.",
};

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
