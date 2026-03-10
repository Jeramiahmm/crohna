"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { TimelineEvent } from "@/data/demo";
import { formatDate, getCategoryColor } from "@/lib/utils";

interface TimelineCardProps {
  event: TimelineEvent;
  index: number;
  isLeft?: boolean;
  onEdit?: () => void;
}

export default function TimelineCard({ event, index, isLeft = false, onEdit }: TimelineCardProps) {
  const categoryColor = getCategoryColor(event.category);

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -60 : 60, y: 20 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`relative group ${isLeft ? "md:pr-12" : "md:pl-12"}`}
    >
      <div className="relative bg-chrono-card/80 rounded-2xl overflow-hidden border border-chrono-border/50 card-hover backdrop-blur-sm">
        {/* Image with parallax zoom */}
        {event.imageUrl && (
          <div className="relative h-48 md:h-56 overflow-hidden">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-chrono-card via-chrono-card/20 to-transparent" />

            {/* Category badge */}
            <div className="absolute top-4 left-4">
              <span
                className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border"
                style={{
                  backgroundColor: `${categoryColor}15`,
                  borderColor: `${categoryColor}30`,
                  color: categoryColor,
                }}
              >
                {event.category}
              </span>
            </div>

            {/* Edit button */}
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>
            )}

            {/* Source indicator */}
            {event.source && event.source !== "manual" && (
              <div className="absolute bottom-4 right-4">
                <span className="px-2 py-1 rounded-full text-[10px] bg-white/10 text-white/60 backdrop-blur-md">
                  {event.source}
                </span>
              </div>
            )}
          </div>
        )}

        {/* No image edit button */}
        {!event.imageUrl && onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-chrono-card/80 flex items-center justify-center text-chrono-muted hover:text-chrono-text opacity-0 group-hover:opacity-100 transition-all z-10"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
        )}

        {/* Content */}
        <div className="p-5 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: categoryColor }}
            />
            <span className="text-xs text-chrono-muted">
              {formatDate(event.date)}
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-display font-semibold mb-2 text-chrono-text group-hover:text-white transition-colors">
            {event.title}
          </h3>

          {event.description && (
            <p className="text-sm text-chrono-text-secondary leading-relaxed line-clamp-3">
              {event.description}
            </p>
          )}

          {event.location && (
            <div className="flex items-center gap-1.5 mt-4 text-xs text-chrono-muted">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
              </svg>
              {event.location}
            </div>
          )}
        </div>

        {/* Hover glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 60px ${categoryColor}08, 0 0 30px ${categoryColor}05`,
          }}
        />
      </div>
    </motion.div>
  );
}
