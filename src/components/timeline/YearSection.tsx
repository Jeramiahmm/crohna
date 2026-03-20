"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { TimelineEvent } from "@/data/demo";
import TimelineCard from "./TimelineCard";

interface YearSectionProps {
  year: string;
  events: TimelineEvent[];
  onEditEvent?: (event: TimelineEvent) => void;
}

export default memo(function YearSection({ year, events, onEditEvent }: YearSectionProps) {
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
        <div className="relative text-center">
          <span className="text-2xl md:text-3xl font-display font-bold text-chrono-text">
            {year}
          </span>
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
