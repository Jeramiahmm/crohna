import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Life Map — Crohna",
  description: "See where your life happened on an interactive map with pins for every memory.",
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
