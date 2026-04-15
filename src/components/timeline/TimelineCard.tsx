"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { TimelineEvent } from "@/data/demo";
import { formatDate, getSeason, resolveImageUrl } from "@/lib/utils";

interface TimelineCardProps {
  event: TimelineEvent;
  index: number;
  variant?: "hero" | "compact";
  onEdit?: () => void;
}

export default memo(function TimelineCard({ event, index, variant = "compact", onEdit }: TimelineCardProps) {
  const isHero = variant === "hero";

  return (
    <motion.article
      aria-label={`${event.title} — ${event.date}`}
      initial={{ opacity: 0, y: isHero ? 60 : 30, scale: isHero ? 1 : 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative group"
    >
      <div className="relative rounded-2xl bg-[var(--card-bg)] overflow-hidden border border-[var(--line)] transition-all duration-300">
        {event.imageUrl && (
          <div className={`relative overflow-hidden ${isHero ? "h-[50vh] md:h-[60vh]" : "h-40 sm:h-52 md:h-60"}`}>
            <Image
              src={resolveImageUrl(event.imageUrl) || event.imageUrl}
              alt={event.title}
              fill
              quality={75}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes={isHero ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
              {...(index === 0 ? { priority: true } : { loading: "lazy" })}
            />
            <div className={`absolute inset-0 ${isHero ? "bg-gradient-to-t from-black/60 via-black/20 to-transparent" : "bg-gradient-to-t from-black/45 via-transparent to-transparent"}`} />

            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 text-xs font-body font-medium bg-chrono-accent/90 rounded-lg text-white">
                {event.category}
              </span>
            </div>

            {onEdit && (
              <button
                type="button"
                aria-label={`Edit ${event.title}`}
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white/50 hover:text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>
            )}

            {event.source && event.source !== "manual" && (
              <div className="absolute bottom-4 right-4">
                <span className="px-2 py-1 text-[10px] font-body font-normal bg-black/30 text-white/50 rounded-lg">
                  {event.source}
                </span>
              </div>
            )}

            {/* Hero variant: overlay title on image */}
            {isHero && (
              <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-body font-medium text-white/70 uppercase tracking-[0.2em]">
                    {getSeason(event.date)}
                  </span>
                  {event.location && (
                    <>
                      <span className="text-white/40 text-[10px]">/</span>
                      <span className="text-[10px] font-body font-normal text-white/60">
                        {event.location}
                      </span>
                    </>
                  )}
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white leading-tight">
                  {event.title}
                </h3>
                <p className="text-xs font-body font-normal text-white/50 mt-2">
                  {formatDate(event.date)}
                </p>
              </div>
            )}
          </div>
        )}

        {!event.imageUrl && onEdit && (
          <button
            type="button"
            aria-label={`Edit ${event.title}`}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-chrono-card flex items-center justify-center text-chrono-muted hover:text-chrono-text opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all z-10"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
        )}

        {/* Content area — hero shows description only (title is on image), compact shows everything */}
        <div className={`${isHero ? "p-6 md:p-8" : "p-4 sm:p-6 md:p-7"}`}>
          {!isHero && (
            <>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-body font-medium text-chrono-accent uppercase tracking-[0.2em]">
                  {getSeason(event.date)}
                </span>
                {event.location && (
                  <>
                    <span className="text-chrono-muted text-[10px]">/</span>
                    <span className="text-[10px] font-body font-normal text-chrono-muted">
                      {event.location}
                    </span>
                  </>
                )}
              </div>
              <div className="text-xs font-body font-normal text-chrono-muted mb-3">
                {formatDate(event.date)}
              </div>
              <h3 className="text-lg md:text-xl font-display font-semibold mb-3 text-chrono-text leading-tight">
                {event.title}
              </h3>
            </>
          )}

          {event.description && (
            <p className={`text-sm font-body font-normal leading-relaxed text-chrono-muted ${isHero ? "" : "line-clamp-3"}`}>
              {event.description}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
});
