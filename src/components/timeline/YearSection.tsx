"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { TimelineEvent } from "@/data/demo";
import TimelineCard from "./TimelineCard";
import { ScrollRevealText } from "@/components/ui/ScrollRevealText";

interface YearSectionProps {
  year: string;
  events: TimelineEvent[];
  yearSummary?: string;
  onEditEvent?: (event: TimelineEvent) => void;
  onGenerateStory?: (year: number) => void;
}

export default memo(function YearSection({ year, events, yearSummary, onEditEvent, onGenerateStory }: YearSectionProps) {
  return (
    <div className="relative">
      {/* Dramatic watermark */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 pointer-events-none select-none z-0 w-full text-center overflow-hidden">
        <span className="watermark">
          {year}
        </span>
      </div>

      {/* Year heading */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-24 z-10 flex justify-center mb-8"
      >
        <div className="relative text-center flex items-center gap-3">
          <span className="text-2xl md:text-3xl font-display font-bold text-chrono-text">
            {year}
          </span>
          {onGenerateStory && (
            <button
              onClick={() => onGenerateStory(parseInt(year, 10))}
              className="px-3 py-1 text-[11px] font-body font-light text-chrono-muted border border-[var(--line-strong)] hover:border-[var(--line-hover)] hover:text-chrono-text rounded-full transition-all flex items-center gap-1.5"
              title={`Generate ${year} story`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              Story
            </button>
          )}
        </div>
      </motion.div>

      {/* Moment count */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="flex justify-center mb-10"
      >
        <span className="section-label">
          {events.length} {events.length === 1 ? "moment" : "moments"}
        </span>
      </motion.div>

      {/* Year summary scroll reveal text */}
      {yearSummary && (
        <div className="max-w-3xl mx-auto px-6 mb-16">
          <ScrollRevealText
            text={yearSummary}
            className="text-xl md:text-2xl lg:text-3xl font-display font-light leading-relaxed text-center"
          />
        </div>
      )}

      {/* Bento grid layout */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {events.map((event, index) => {
            const isHero = index % 3 === 0;
            return (
              <div key={event.id} className={isHero ? "md:col-span-2" : ""}>
                <TimelineCard
                  event={event}
                  index={index}
                  variant={isHero ? "hero" : "compact"}
                  onEdit={onEditEvent ? () => onEditEvent(event) : undefined}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
