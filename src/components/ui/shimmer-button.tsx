"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export default function ShimmerButton({
  children,
  className,
  ...props
}: ShimmerButtonProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const background = isDark ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)";
  const shimmerColor = isDark ? "#ffffff" : "#000000";

  return (
    <button
      className={cn(
        "group relative z-0 inline-flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-full px-10 py-4 text-sm font-body font-light tracking-wide transition-all duration-300",
        isDark ? "text-white" : "text-black",
        "hover:scale-[1.02] active:scale-[0.98]",
        className,
      )}
      style={{ background }}
      {...props}
    >
      {/* shimmer */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius: "inherit" }}
      >
        <div
          className="absolute inset-[-100%] animate-shimmer-slide"
          style={{
            background: `linear-gradient(90deg, transparent 0%, transparent 40%, ${shimmerColor}22 45%, ${shimmerColor}44 50%, ${shimmerColor}22 55%, transparent 60%, transparent 100%)`,
            backgroundSize: "200% 100%",
          }}
        />
      </div>

      {/* spin highlight */}
      <div
        className="absolute -z-10 animate-spin-around"
        style={{
          width: "200%",
          height: "200%",
          background: `conic-gradient(from 0deg, transparent 0 340deg, ${shimmerColor}33 360deg)`,
        }}
      />

      {/* backdrop */}
      <div
        className="absolute inset-px z-[-1]"
        style={{
          background,
          borderRadius: "inherit",
        }}
      />

      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}
