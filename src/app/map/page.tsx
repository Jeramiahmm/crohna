"use client";

import { motion } from "framer-motion";
import { demoEvents } from "@/data/demo";
import EventMap from "@/components/map/EventMap";

export default function MapPage() {
  return (
    <div className="min-h-screen pt-24 pb-32">
      <section className="relative py-24 px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-chrono-muted mb-4 block">
            Explore
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight">
            <span className="gradient-text">Life Map</span>
          </h1>
          <p className="text-lg text-chrono-text-secondary max-w-xl mx-auto">
            See where your life happened. Every memory, every milestone,
            pinned to the places that matter most.
          </p>
        </motion.div>
      </section>

      <section className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="max-w-7xl mx-auto"
        >
          <EventMap events={demoEvents} />
        </motion.div>
      </section>

      <section className="px-6 mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-display font-semibold mb-10 text-center tracking-tight"
          >
            All Locations
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {demoEvents
              .filter((e) => e.location)
              .map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-chrono-card/40 rounded-xl p-4 border border-chrono-border/20 card-hover"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-3.5 h-3.5 text-chrono-accent"
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
                    <span className="text-xs text-chrono-muted">
                      {event.location}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-chrono-text">
                    {event.title}
                  </h3>
                  <p className="text-xs text-chrono-muted mt-1">
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
