"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { TimelineEvent } from "@/data/demo";
import TimelineCard from "./TimelineCard";

interface YearSectionProps {
  year: string;
  events: TimelineEvent[];
  onEditEvent?: (event: TimelineEvent) => void;
  onGenerateStory?: (year: number) => void;
}

export default memo(function YearSection({ year, events, onEditEvent, onGenerateStory }: YearSectionProps) {
  return (
    <div className="relative">
      {/* Ghost watermark year */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none select-none z-0">
        <span className="watermark">
          {year}
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-24 z-10 flex justify-center mb-16"
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

      <div className="relative max-w-5xl mx-auto">
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px">
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full origin-top timeline-line"
          />
        </div>

        <div className="space-y-6 md:space-y-16">
          {events.map((event, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div
                key={event.id}
                className={`relative md:grid md:grid-cols-2 md:gap-8 ${
                  isLeft ? "" : "md:direction-rtl"
                }`}
              >
                <div className="hidden md:flex absolute left-1/2 top-8 -translate-x-1/2 z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-2.5 h-2.5 rounded-full bg-chrono-glow ring-4 ring-chrono-bg"
                  />
                </div>

                {isLeft ? (
                  <>
                    <div className="md:text-right">
                      <TimelineCard
                        event={event}
                        index={index}
                        isLeft
                        onEdit={onEditEvent ? () => onEditEvent(event) : undefined}
                      />
                    </div>
                    <div className="hidden md:block" />
                  </>
                ) : (
                  <>
                    <div className="hidden md:block" />
                    <div style={{ direction: "ltr" }}>
                      <TimelineCard
                        event={event}
                        index={index}
                        onEdit={onEditEvent ? () => onEditEvent(event) : undefined}
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
