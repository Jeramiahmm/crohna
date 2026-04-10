"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import EmptyState from "@/components/ui/EmptyState";
import { MapSkeleton } from "@/components/ui/Skeletons";
import { useEvents } from "@/hooks/useEvents";

const EventMap = dynamic(() => import("@/components/map/EventMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default function MapPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 pb-32 flex items-center justify-center"><div className="text-sm font-body font-light text-chrono-muted animate-pulse">Loading your map...</div></div>}>
      <MapPage />
    </Suspense>
  );
}

function MapPage() {
  const { events, isLoading, isShowingDemo } = useEvents();

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-32 flex items-center justify-center">
        <div className="text-sm font-body font-light text-chrono-muted animate-pulse">Loading your map...</div>
      </div>
    );
  }

  const displayEvents = searchQuery
    ? events.filter((e) => {
        const searchable = `${e.title} ${e.description || ""} ${e.location || ""} ${e.category || ""}`.toLowerCase();
        return searchable.includes(searchQuery.toLowerCase());
      })
    : events;
  const eventsWithLocation = displayEvents.filter((e) => e.location);

  return (
    <div className="min-h-screen pt-24 pb-32">
      {isShowingDemo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="sticky top-16 z-40 backdrop-blur-xl bg-[var(--card-bg)]/80 border-b border-[var(--line-strong)] px-6 py-3"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <p className="text-xs sm:text-sm font-body font-light text-chrono-muted">
              Sample locations &mdash; your memories will appear here
            </p>
            <button
              onClick={() => signIn("google", { callbackUrl: "/map" })}
              className="px-4 py-1.5 text-xs font-body font-light bg-foreground text-background rounded-full hover:opacity-90 transition-all whitespace-nowrap ml-4"
            >
              Start yours
            </button>
          </div>
        </motion.div>
      )}

      <section className="relative py-16 md:py-28 px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <span className="section-label mb-5 block">
            Explore
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight">
            <em className="text-chrono-text">Life Map</em>
          </h1>
          <p className="text-base font-body font-light text-chrono-muted max-w-md mx-auto leading-relaxed">
            See where your life happened. Every memory pinned to
            the places that matter most.
          </p>
        </motion.div>
      </section>

      {searchQuery && (
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-body font-light text-chrono-muted border border-[var(--line)] rounded-full">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            {displayEvents.length} result{displayEvents.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
          </span>
        </div>
      )}

      {displayEvents.length === 0 && !isShowingDemo ? (
        <EmptyState
          icon="timeline"
          title="No locations yet"
          description="Add events with locations to see them on your life map."
          actionLabel="Go to Timeline"
          onAction={() => window.location.href = "/timeline"}
        />
      ) : (
        <>
          <section className="px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1.2 }}
              className="max-w-7xl mx-auto"
            >
              <EventMap events={displayEvents} />
            </motion.div>
          </section>

          {eventsWithLocation.length > 0 && (
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
                  {eventsWithLocation.map((event, i) => (
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
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
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
          )}
        </>
      )}

      {isShowingDemo && (
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-28 mb-10">
          <div className="inline-flex flex-col items-center gap-6">
            <p className="text-lg font-display font-light italic text-chrono-muted">Where will your story take you?</p>
            <button
              onClick={() => signIn("google", { callbackUrl: "/map" })}
              className="px-8 py-3 text-sm font-body font-light bg-foreground text-background rounded-full hover:opacity-90 transition-all duration-500"
            >
              Start Mapping Your Life
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
