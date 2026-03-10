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
      {/* Year label */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-24 z-10 flex justify-center mb-12"
      >
        <div className="relative">
          <span className="text-7xl md:text-9xl font-display font-bold gradient-text opacity-20 select-none">
            {year}
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl md:text-3xl font-display font-semibold text-chrono-text">
              {year}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Events count */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="flex justify-center mb-8"
      >
        <span className="text-xs text-chrono-muted uppercase tracking-widest">
          {events.length} {events.length === 1 ? "moment" : "moments"}
        </span>
      </motion.div>

      {/* Events grid */}
      <div className="relative max-w-5xl mx-auto">
        {/* Timeline line (desktop) */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px">
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full origin-top"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(167,139,250,0.3) 10%, rgba(167,139,250,0.3) 90%, transparent 100%)",
            }}
          />
        </div>

        {/* Event cards */}
        <div className="space-y-8 md:space-y-12">
          {events.map((event, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div
                key={event.id}
                className={`relative md:grid md:grid-cols-2 md:gap-8 ${
                  isLeft ? "" : "md:direction-rtl"
                }`}
              >
                {/* Timeline node (desktop) */}
                <div className="hidden md:flex absolute left-1/2 top-8 -translate-x-1/2 z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="w-3 h-3 rounded-full bg-chrono-accent ring-4 ring-chrono-bg"
                  />
                </div>

                {/* Card placement */}
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
