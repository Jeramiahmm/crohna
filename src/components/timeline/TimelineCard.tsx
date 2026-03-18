"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { TimelineEvent } from "@/data/demo";
import { formatDate, getSeason, resolveImageUrl } from "@/lib/utils";

interface TimelineCardProps {
  event: TimelineEvent;
  index: number;
  isLeft?: boolean;
  onEdit?: () => void;
}

export default function TimelineCard({ event, index, isLeft = false, onEdit }: TimelineCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -40 : 40, y: 20 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 1,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`relative group ${isLeft ? "md:pr-12" : "md:pl-12"}`}
    >
      <div className="relative bg-[var(--card-bg)] overflow-hidden border border-[var(--line-strong)] card-hover transition-all duration-300">
        {event.imageUrl && (
          <div className="relative h-40 sm:h-52 md:h-60 overflow-hidden">
            <Image
              src={resolveImageUrl(event.imageUrl) || event.imageUrl}
              alt={event.title}
              fill
              className="object-cover archival-img transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

            <div className="absolute top-4 left-4">
              <span
                className="px-3 py-1 text-xs font-body font-extralight backdrop-blur-md border border-white/[0.12] rounded-full text-white/80"
                style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
              >
                {event.category}
              </span>
            </div>

            {onEdit && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>
            )}

            {event.source && event.source !== "manual" && (
              <div className="absolute bottom-4 right-4">
                <span className="px-2 py-1 text-[10px] font-body font-extralight bg-black/30 text-white/50 backdrop-blur-md rounded-full">
                  {event.source}
                </span>
              </div>
            )}
          </div>
        )}

        {!event.imageUrl && onEdit && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-chrono-card flex items-center justify-center text-chrono-muted hover:text-chrono-text opacity-0 group-hover:opacity-100 transition-all z-10"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
        )}

        <div className="p-4 sm:p-6 md:p-7">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-body font-extralight text-chrono-accent uppercase tracking-[0.2em]">
              {getSeason(event.date)}
            </span>
            {event.location && (
              <>
                <span className="text-chrono-muted text-[10px]">/</span>
                <span className="text-[10px] font-body font-extralight text-chrono-muted">
                  {event.location}
                </span>
              </>
            )}
          </div>

          <div className="text-xs font-body font-extralight text-chrono-muted mb-3">
            {formatDate(event.date)}
          </div>

          <h3 className="text-lg md:text-xl font-display font-bold mb-3 text-chrono-text leading-tight">
            {event.title}
          </h3>

          {event.description && (
            <p className="text-sm font-body font-extralight leading-relaxed line-clamp-3 text-chrono-muted">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
