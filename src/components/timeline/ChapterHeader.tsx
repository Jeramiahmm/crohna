"use client";

import { motion } from "framer-motion";

interface ChapterHeaderProps {
  title: string;
  subtitle?: string;
  dateRange?: string;
}

export default function ChapterHeader({ title, subtitle, dateRange }: ChapterHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative py-14 flex justify-center"
    >
      <div className="relative text-center">
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-px h-6 bg-gradient-to-b from-transparent to-chrono-accent/20" />

        <div className="inline-flex flex-col items-center gap-2 px-8 py-4 rounded-2xl glass border border-chrono-border/15">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-chrono-accent/40 animate-pulse-glow" />
            <span className="text-xs text-chrono-muted uppercase tracking-[0.2em] font-medium">
              Chapter
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-display font-bold gradient-text">{title}</h3>
          {subtitle && (
            <p className="text-xs text-chrono-text-secondary">{subtitle}</p>
          )}
          {dateRange && (
            <span className="text-[10px] text-chrono-muted uppercase tracking-wider">{dateRange}</span>
          )}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 w-px h-6 bg-gradient-to-b from-chrono-accent/20 to-transparent" />
      </div>
    </motion.div>
  );
}
