"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TimelineEvent } from "@/data/demo";
import { formatDate, getCategoryColor } from "@/lib/utils";
import Image from "next/image";

interface EventMapProps {
  events: TimelineEvent[];
}

export default function EventMap({ events }: EventMapProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  const project = (lat: number, lng: number): { x: number; y: number } => {
    const x = ((lng + 130) / 70) * 100;
    const y = ((50 - lat) / 20) * 100;
    return {
      x: Math.max(2, Math.min(98, x)),
      y: Math.max(2, Math.min(98, y)),
    };
  };

  const eventsWithCoords = events.filter(
    (e) => e.latitude !== undefined && e.longitude !== undefined
  );

  return (
    <div className="relative w-full h-full min-h-[500px] md:min-h-[700px] bg-chrono-surface rounded-3xl overflow-hidden border border-chrono-border/10">
      <div className="absolute inset-0 bg-gradient-to-br from-chrono-bg via-chrono-surface to-chrono-card/50" />

      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        {Array.from({ length: 20 }, (_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={`${(i + 1) * 5}%`}
            x2="100%"
            y2={`${(i + 1) * 5}%`}
            stroke="white"
            strokeWidth="0.5"
          />
        ))}
        {Array.from({ length: 20 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={`${(i + 1) * 5}%`}
            y1="0"
            x2={`${(i + 1) * 5}%`}
            y2="100%"
            stroke="white"
            strokeWidth="0.5"
          />
        ))}
      </svg>

      <svg className="absolute inset-0 w-full h-full">
        {eventsWithCoords.slice(0, -1).map((event, i) => {
          const next = eventsWithCoords[i + 1];
          const from = project(event.latitude!, event.longitude!);
          const to = project(next.latitude!, next.longitude!);
          return (
            <motion.line
              key={`line-${event.id}`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.07 }}
              transition={{ duration: 1.8, delay: i * 0.12 }}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke="#C7C2BA"
              strokeWidth="0.5"
              strokeDasharray="4 6"
            />
          );
        })}
      </svg>

      {eventsWithCoords.map((event, i) => {
        const pos = project(event.latitude!, event.longitude!);
        const color = getCategoryColor(event.category);
        const isSelected = selectedEvent?.id === event.id;
        const isHovered = hoveredEvent === event.id;

        return (
          <motion.div
            key={event.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 300 }}
            className="absolute cursor-pointer z-10"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => setSelectedEvent(isSelected ? null : event)}
            onMouseEnter={() => setHoveredEvent(event.id)}
            onMouseLeave={() => setHoveredEvent(null)}
          >
            <div
              className="absolute rounded-full animate-node-pulse"
              style={{
                backgroundColor: color,
                opacity: isSelected || isHovered ? 0.15 : 0.04,
                width: 20,
                height: 20,
                margin: -3,
              }}
            />

            <motion.div
              animate={{ scale: isSelected || isHovered ? 1.4 : 1 }}
              transition={{ duration: 0.4 }}
              className="relative w-3 h-3 rounded-full border border-chrono-bg/50"
              style={{ backgroundColor: color }}
            />

            <AnimatePresence>
              {isHovered && !isSelected && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 whitespace-nowrap glass rounded-lg px-3 py-2 text-xs"
                >
                  <div className="font-medium text-chrono-text">{event.title}</div>
                  <div className="text-chrono-muted">{event.location}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-4 right-4 w-80 glass-strong rounded-2xl overflow-hidden z-20"
          >
            {selectedEvent.imageUrl && (
              <div className="relative h-40">
                <Image
                  src={selectedEvent.imageUrl}
                  alt={selectedEvent.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-chrono-card via-transparent to-transparent" />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: getCategoryColor(selectedEvent.category) }}
                />
                <span className="text-xs text-chrono-muted">
                  {formatDate(selectedEvent.date)}
                </span>
              </div>
              <h3 className="text-lg font-display font-semibold text-chrono-text mb-1">
                {selectedEvent.title}
              </h3>
              {selectedEvent.location && (
                <p className="text-xs text-chrono-muted mb-3 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                  </svg>
                  {selectedEvent.location}
                </p>
              )}
              {selectedEvent.description && (
                <p className="text-sm text-chrono-text-secondary leading-relaxed">
                  {selectedEvent.description}
                </p>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="mt-4 text-xs text-chrono-muted hover:text-chrono-text transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-4 left-4 glass rounded-xl px-4 py-3 z-20">
        <div className="text-[10px] text-chrono-muted uppercase tracking-[0.15em] mb-2">
          Legend
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Travel", color: "#8A9098" },
            { label: "Career", color: "#C7C2BA" },
            { label: "Achievement", color: "#B8B3AB" },
            { label: "Education", color: "#9A9590" },
            { label: "Life", color: "#8A9A8A" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] text-chrono-text-secondary">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
