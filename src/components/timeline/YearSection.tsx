"use client";

import { motion } from "framer-motion";
import { TimelineEvent } from "@/data/demo";
import TimelineCard from "./TimelineCard";

interface YearSectionProps {
  year: string;
  events: TimelineEvent[];
  yearIndex: number;
  onEditEvent?: (event: TimelineEvent) => void;
}

export default function YearSection({ year, events, onEditEvent }: YearSectionProps) {
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-24 z-10 flex justify-center mb-16"
      >
        <div className="relative">
          <span className="text-7xl md:text-9xl font-display font-bold gradient-text opacity-[0.06] select-none">
            {year}
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl md:text-3xl font-display font-semibold text-chrono-text">
              {year}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="flex justify-center mb-10"
      >
        <span className="text-xs text-chrono-muted uppercase tracking-[0.2em]">
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
            className="w-full h-full origin-top"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(199,194,186,0.08) 10%, rgba(199,194,186,0.08) 90%, transparent 100%)",
            }}
          />
        </div>

        <div className="space-y-10 md:space-y-16">
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
                    className="w-2.5 h-2.5 rounded-full bg-chrono-accent/30 ring-4 ring-chrono-bg"
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
}
