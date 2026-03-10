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
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative py-16 flex justify-center"
    >
      <div className="relative text-center">
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-px h-6 bg-gradient-to-b from-transparent to-chrono-accent/10" />

        <div className="inline-flex flex-col items-center gap-3 px-10 py-5 rounded-2xl bg-chrono-card/20 border border-chrono-border/10">
          <span className="text-[10px] text-chrono-muted uppercase tracking-[0.25em] font-medium">
            Chapter
          </span>
          <h3 className="text-lg md:text-xl font-display font-bold gradient-text">{title}</h3>
          {subtitle && (
            <p className="text-xs text-chrono-text-secondary">{subtitle}</p>
          )}
          {dateRange && (
            <span className="text-[10px] text-chrono-muted uppercase tracking-wider">{dateRange}</span>
          )}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 w-px h-6 bg-gradient-to-b from-chrono-accent/10 to-transparent" />
      </div>
    </motion.div>
  );
}
