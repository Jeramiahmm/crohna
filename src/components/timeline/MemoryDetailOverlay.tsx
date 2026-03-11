"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { TimelineEvent } from "@/data/demo";
import { formatDate } from "@/lib/utils";

interface MemoryDetailOverlayProps {
  event: TimelineEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (id: string) => void;
}

export default function MemoryDetailOverlay({ event, isOpen, onClose, onEdit, onDelete }: MemoryDetailOverlayProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isOpen) setConfirmDelete(false);
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleDelete = useCallback(() => {
    if (!event) return;
    onDelete(event.id);
    onClose();
  }, [event, onDelete, onClose]);

  if (!event) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[85] overflow-y-auto"
          >
            <div className="min-h-full flex items-start justify-center py-8 px-4">
              <div className="relative w-full max-w-3xl bg-chrono-surface border border-white/[0.12] overflow-hidden">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Hero Image */}
                {event.imageUrl && (
                  <div className="relative w-full" style={{ height: "55vh", maxHeight: "500px" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-chrono-surface to-transparent" />
                  </div>
                )}

                {/* Content */}
                <div className="px-8 pb-8" style={{ marginTop: event.imageUrl ? "-2rem" : "0" }}>
                  <div className="relative z-10">
                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-chrono-text mb-4 leading-tight">
                      {event.title}
                    </h2>

                    {/* Date and Location */}
                    <div className="flex items-center gap-4 mb-6 text-sm font-body font-extralight text-chrono-muted">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        {formatDate(event.date)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          {event.location}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {event.description && (
                      <p className="text-base font-body font-extralight leading-relaxed mb-6" style={{ color: "rgba(240,235,225,0.75)" }}>
                        {event.description}
                      </p>
                    )}

                    {/* Category badge and tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                      {event.category && (
                        <span className="px-3 py-1 text-xs font-body font-extralight bg-white/[0.06] border border-white/[0.12] rounded-full text-white/80">
                          {event.category}
                        </span>
                      )}
                      {event.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 text-[11px] font-mono text-white/60 border border-white/[0.12] rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Map placeholder */}
                    {event.latitude && event.longitude && (
                      <div className="relative h-[200px] mb-6 bg-chrono-card/40 border border-white/[0.08] overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center relative" style={{ background: "#1a1a2e" }}>
                          <div className="absolute inset-0 opacity-30" style={{
                            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 1px, transparent 1px)`,
                            backgroundSize: "20px 20px"
                          }} />
                          <div className="relative">
                            <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                            <div className="absolute -inset-2 border-2 border-white/30 rounded-full animate-ping" style={{ animationDuration: "2s" }} />
                          </div>
                          <div className="absolute bottom-3 left-3 text-[10px] font-mono text-white/40">
                            {event.latitude.toFixed(4)}°N, {Math.abs(event.longitude).toFixed(4)}°W
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-white/[0.08]">
                      <button
                        onClick={() => onEdit(event)}
                        className="px-6 py-2.5 text-sm font-body font-light text-white/80 border border-white/[0.15] hover:border-white/30 hover:text-white rounded-full transition-all duration-300"
                      >
                        Edit Memory
                      </button>
                      {!confirmDelete ? (
                        <button
                          onClick={() => setConfirmDelete(true)}
                          className="text-sm font-body font-light text-white/40 hover:text-red-400/70 transition-colors"
                        >
                          Delete Memory
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-400/70">Are you sure? This cannot be undone</span>
                          <button
                            onClick={handleDelete}
                            className="px-3 py-1.5 text-xs text-red-400 border border-red-400/30 hover:bg-red-400/10 rounded-full transition-all"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDelete(false)}
                            className="px-3 py-1.5 text-xs text-white/50 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
