"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { demoEvents, getEventsByYear, TimelineEvent } from "@/data/demo";
import YearSection from "@/components/timeline/YearSection";
import ChapterHeader from "@/components/timeline/ChapterHeader";
import EventModal from "@/components/events/EventModal";
import EmptyState from "@/components/ui/EmptyState";

const chapters: Record<string, { title: string; subtitle: string; startDate: string; endDate: string }> = {
  "college-start": {
    title: "College Years",
    subtitle: "Where it all began",
    startDate: "2022-01-01",
    endDate: "2022-12-31",
  },
  "growth": {
    title: "Growth & Discovery",
    subtitle: "Firsts and foundations",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
  },
  "breakthrough": {
    title: "Breakthrough Year",
    subtitle: "Ambitions became achievements",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
  },
};

function getChapterForYear(year: string) {
  switch (year) {
    case "2022": return chapters["college-start"];
    case "2023": return chapters["growth"];
    case "2024": return chapters["breakthrough"];
    default: return null;
  }
}

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>(demoEvents);
  const [activeYear, setActiveYear] = useState<string>("");
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | undefined>();
  const [demoMode, setDemoMode] = useState(true);

  const eventsByYear = getEventsByYear(events);
  const years = Object.keys(eventsByYear);

  useEffect(() => {
    const handleScroll = () => {
      const yearElements = document.querySelectorAll("[data-year]");
      let current = "";
      yearElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 200) {
          current = el.getAttribute("data-year") || "";
        }
      });
      if (current) setActiveYear(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCreateEvent = useCallback((eventData: Partial<TimelineEvent>) => {
    const newEvent: TimelineEvent = {
      id: eventData.id || `evt-${Date.now()}`,
      title: eventData.title || "",
      date: eventData.date || "",
      location: eventData.location,
      description: eventData.description,
      category: eventData.category,
      imageUrl: eventData.imageUrl,
      source: "manual",
    };
    setEvents((prev) => [...prev, newEvent]);
  }, []);

  const handleEditEvent = useCallback((eventData: Partial<TimelineEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventData.id ? { ...e, ...eventData } : e))
    );
    setEditingEvent(undefined);
  }, []);

  const handleDeleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setEditingEvent(undefined);
    setEventModalOpen(false);
  }, []);

  const scrollToYear = (year: string) => {
    const el = document.querySelector(`[data-year="${year}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
            Your Journey
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight">
            <em className="text-white">Timeline</em>
          </h1>
          <p className="text-base font-body font-light text-chrono-text-secondary max-w-md mx-auto mb-12 leading-relaxed">
            Every moment that shaped your story, beautifully organized
            and brought to life.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => { setEditingEvent(undefined); setEventModalOpen(true); }}
              className="px-6 py-2.5 text-sm font-body font-light bg-white text-black rounded-full hover:bg-white/90 transition-colors duration-500 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Event
            </button>
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={`px-5 py-2.5 text-sm font-body font-light rounded-full transition-all duration-500 border ${
                demoMode
                  ? "border-white/20 text-white/80 bg-white/[0.04]"
                  : "border-white/[0.1] text-chrono-text-secondary hover:border-white/20"
              }`}
            >
              Demo Mode {demoMode ? "On" : "Off"}
            </button>
          </div>
        </motion.div>

        {years.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex justify-center gap-3 mt-14"
          >
            {years.map((year, i) => (
              <motion.button
                key={year}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                onClick={() => scrollToYear(year)}
                className={`px-5 py-2 text-sm font-body font-light transition-all rounded-full ${
                  activeYear === year
                    ? "bg-white/[0.08] border border-white/20 text-white/80"
                    : "border border-white/[0.08] hover:border-white/25 text-chrono-muted"
                }`}
              >
                {year}
              </motion.button>
            ))}
          </motion.div>
        )}
      </section>

      <AnimatePresence>
        {activeYear && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-30"
          >
            <div className="px-4 py-1.5 glass-strong text-xs font-body font-light text-chrono-text flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              {activeYear}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {events.length === 0 ? (
        <EmptyState
          icon="timeline"
          title="Your story starts here"
          description="Add your first life event to begin building your personal timeline. Every moment matters."
          actionLabel="Create First Event"
          onAction={() => setEventModalOpen(true)}
        />
      ) : (
        <section className="px-6">
          <div className="space-y-28">
            {years.map((year, i) => {
              const chapter = getChapterForYear(year);
              return (
                <div key={year} data-year={year}>
                  {chapter && (
                    <ChapterHeader
                      title={chapter.title}
                      subtitle={chapter.subtitle}
                    />
                  )}
                  <YearSection
                    year={year}
                    events={eventsByYear[year]}
                    yearIndex={i}
                    onEditEvent={(event) => {
                      setEditingEvent(event);
                      setEventModalOpen(true);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {events.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-40"
        >
          <div className="inline-flex flex-col items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <p className="text-sm font-display font-light italic text-chrono-muted">
              Your story continues...
            </p>
            <button
              onClick={() => { setEditingEvent(undefined); setEventModalOpen(true); }}
              className="mt-2 px-5 py-2 text-xs font-body font-light text-chrono-muted border border-white/[0.12] hover:border-white/30 hover:text-chrono-text rounded-full transition-all duration-500"
            >
              Add Next Moment
            </button>
          </div>
        </motion.div>
      )}

      <EventModal
        isOpen={eventModalOpen}
        onClose={() => { setEventModalOpen(false); setEditingEvent(undefined); }}
        onSave={editingEvent ? handleEditEvent : handleCreateEvent}
        event={editingEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}
