"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import { demoEvents, getEventsByYear, TimelineEvent } from "@/data/demo";
import YearSection from "@/components/timeline/YearSection";
import ChapterHeader from "@/components/timeline/ChapterHeader";
import EventModal from "@/components/events/EventModal";
import EmptyState from "@/components/ui/EmptyState";
import MemoryDetailOverlay from "@/components/timeline/MemoryDetailOverlay";
import ShareTimelineModal from "@/components/timeline/ShareTimelineModal";
import Toast from "@/components/ui/Toast";

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
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    events.forEach((e) => e.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [events]);

  // Filter events by tag and search
  const filteredEvents = useMemo(() => {
    let result = events;
    if (activeTag) {
      result = result.filter((e) => e.tags?.includes(activeTag));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e) =>
        e.title.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        e.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [events, activeTag, searchQuery]);

  const eventsByYear = getEventsByYear(filteredEvents);
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
      tags: eventData.tags,
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

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  const handleCardClick = useCallback((event: TimelineEvent) => {
    setSelectedEvent(event);
    setDetailOpen(true);
  }, []);

  const handleDetailEdit = useCallback((event: TimelineEvent) => {
    setDetailOpen(false);
    setEditingEvent(event);
    setEventModalOpen(true);
  }, []);

  const handleDetailDelete = useCallback((id: string) => {
    handleDeleteEvent(id);
    setDetailOpen(false);
  }, [handleDeleteEvent]);

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

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => { setEditingEvent(undefined); setEventModalOpen(true); }}
              className="px-6 py-2.5 text-sm font-body font-light bg-white text-black rounded-full hover:bg-white/90 transition-colors duration-500 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Memory
            </button>
            <button
              onClick={() => setShareOpen(true)}
              className="px-5 py-2.5 text-sm font-body font-light text-white/80 border border-white/[0.12] hover:border-white/30 hover:text-white rounded-full transition-all duration-500 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              Share Timeline
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

          {/* Search bar */}
          <div className="mt-8 max-w-md mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories, tags, locations..."
              className="w-full bg-chrono-card/40 px-5 py-3 text-sm text-chrono-text placeholder:text-chrono-muted/50 border border-white/[0.08] rounded-full outline-none focus:border-white/20 transition-colors"
            />
          </div>
        </motion.div>

        {/* Tag cloud */}
        {allTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-2 mt-6 max-w-3xl mx-auto"
          >
            {activeTag && (
              <button
                onClick={() => setActiveTag(null)}
                className="px-3 py-1.5 text-xs font-mono text-white/80 bg-white/[0.08] border border-white/20 rounded-full transition-all"
              >
                Clear filter ×
              </button>
            )}
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1.5 text-[11px] font-mono rounded-full transition-all duration-300 ${
                  activeTag === tag
                    ? "bg-white/[0.1] border border-white/30 text-white"
                    : "border border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/15"
                }`}
              >
                {tag}
              </button>
            ))}
          </motion.div>
        )}

        {years.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex justify-center gap-3 mt-8"
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

      {filteredEvents.length === 0 ? (
        <EmptyState
          icon="timeline"
          title={activeTag || searchQuery ? "No matching memories" : "Your story starts here"}
          description={activeTag || searchQuery ? "Try adjusting your filters or search query." : "Add your first life event to begin building your personal timeline. Every moment matters."}
          actionLabel={activeTag || searchQuery ? "Clear Filters" : "Create First Event"}
          onAction={() => {
            if (activeTag || searchQuery) {
              setActiveTag(null);
              setSearchQuery("");
            } else {
              setEventModalOpen(true);
            }
          }}
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
                    onCardClick={handleCardClick}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {filteredEvents.length > 0 && (
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

      <MemoryDetailOverlay
        event={selectedEvent}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={handleDetailEdit}
        onDelete={handleDetailDelete}
      />

      <ShareTimelineModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        onToast={showToast}
      />

      <Toast message={toastMsg} isVisible={toastVisible} />
    </div>
  );
}
