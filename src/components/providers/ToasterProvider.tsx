"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/components/ui/ThemeProvider";

export function ToasterProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="bottom-right"
      theme={theme}
      toastOptions={{
        className: "font-body text-sm",
        style: {
          background: "var(--card-bg)",
          border: "1px solid var(--line-strong)",
          color: "var(--foreground)",
        },
      }}
    />
  );
}
