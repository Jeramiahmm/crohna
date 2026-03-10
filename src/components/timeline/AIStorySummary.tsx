"use client";

import { motion } from "framer-motion";
import { AIStory } from "@/data/demo";

interface AIStorySummaryProps {
  story: AIStory;
  index: number;
}

export default function AIStorySummary({ story, index }: AIStorySummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.9,
        delay: index * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative group"
    >
      <div className="relative bg-chrono-card/30 rounded-3xl p-8 md:p-12 border border-chrono-border/10 overflow-hidden card-hover">
        {/* Badge */}
        <div className="relative flex items-center gap-2 mb-6">
          <span className="text-[10px] font-medium text-chrono-muted uppercase tracking-[0.25em]">
            Story
          </span>
          <span className="text-xs text-chrono-muted">{story.period}</span>
        </div>

        {/* Title */}
        <h3 className="relative text-2xl md:text-3xl font-display font-bold mb-4 gradient-text">
          {story.title}
        </h3>

        {/* Summary */}
        <p className="relative text-chrono-text-secondary leading-relaxed text-base mb-8">
          {story.summary}
        </p>

        {/* Highlights */}
        <div className="relative space-y-2.5 mb-8">
          {story.highlights.map((highlight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="w-1 h-1 rounded-full bg-chrono-accent/50 mt-2 flex-shrink-0" />
              <span className="text-sm text-chrono-text-secondary">{highlight}</span>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        {story.stats && (
          <div className="relative grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(story.stats).map(([key, value], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-chrono-bg/30 rounded-xl p-4 border border-chrono-border/10"
              >
                <div className="text-lg md:text-xl font-display font-bold text-chrono-text">
                  {value}
                </div>
                <div className="text-[11px] text-chrono-muted uppercase tracking-wider mt-1">
                  {key}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
