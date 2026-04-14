import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timeline — Crohna",
  description: "View your life events organized chronologically on a beautiful visual timeline.",
};

export default function TimelineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
