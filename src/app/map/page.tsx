"use client";

import { motion } from "framer-motion";
import { demoEvents } from "@/data/demo";
import EventMap from "@/components/map/EventMap";

export default function MapPage() {
  return (
    <div className="min-h-screen pt-24 pb-32">
      <section className="relative py-28 px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <span className="section-label mb-5 block">
            Explore
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight">
            <em className="text-chrono-text">Life Map</em>
          </h1>
          <p className="text-base font-body font-light text-chrono-muted max-w-md mx-auto leading-relaxed">
            See where your life happened. Every memory pinned to
            the places that matter most.
          </p>
        </motion.div>
      </section>

      <section className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1.2 }}
          className="max-w-7xl mx-auto"
        >
          <EventMap events={demoEvents} />
        </motion.div>
      </section>

      <section className="px-6 mt-28">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-12"
          >
            <span className="section-label mb-4 block">Locations</span>
            <h2 className="text-2xl font-display font-light tracking-tight">
              All Locations
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[1px] bg-[var(--line)]">
            {demoEvents
              .filter((e) => e.location)
              .map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.8 }}
                  className="bg-chrono-bg p-5 card-hover"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-3 h-3 text-chrono-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z"
                      />
                    </svg>
                    <span className="text-xs font-body font-light text-chrono-muted">
                      {event.location}
                    </span>
                  </div>
                  <h3 className="text-sm font-body font-light text-chrono-text">
                    {event.title}
                  </h3>
                  <p className="text-xs font-body font-light text-chrono-muted mt-1.5">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </motion.div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
