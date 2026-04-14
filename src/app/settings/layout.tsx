import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — Crohna",
  description: "Manage your account, privacy settings, and connected services.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
