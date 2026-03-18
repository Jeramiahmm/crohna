"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { TimelineEvent, getEventsByYear, demoEvents } from "@/data/demo";
import YearSection from "@/components/timeline/YearSection";
import EventModal from "@/components/events/EventModal";
import EmptyState from "@/components/ui/EmptyState";
import { toast } from "sonner";
import { CATEGORIES } from "@/lib/constants";

const FILTER_OPTIONS = ["All", ...CATEGORIES.map((c) => c.label)];


function CategoryFilterBar({ selected, onToggle }: { selected: Set<string>; onToggle: (cat: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap"
    >
      {FILTER_OPTIONS.map((cat) => {
        const isSelected = cat === "All" ? selected.size === 0 : selected.has(cat.toLowerCase());
        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            className={`px-4 py-1.5 text-xs font-body font-light rounded-full transition-all duration-300 whitespace-nowrap border ${
              isSelected
                ? "bg-foreground text-background border-foreground"
                : "bg-transparent text-chrono-muted border-[var(--line-strong)] hover:border-[var(--line-hover)]"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </motion.div>
  );
}

function YearScrubber({ years, activeYear, onYearClick }: { years: string[]; activeYear: string; onYearClick: (year: string) => void }) {
  return (
    <div className="fixed z-30 hidden md:flex flex-col items-center" style={{ right: "calc(50% - 320px)", top: "50%", transform: "translateY(-50%)" }}>
      <div className="relative flex flex-col items-center">
        <div className="absolute top-0 bottom-0 w-px bg-[var(--line-strong)]" />
        {years.map((year) => {
          const isActive = activeYear === year;
          return (
            <button key={year} onClick={() => onYearClick(year)} className="relative flex items-center py-4 group">
              <span className={`text-xs font-body font-light transition-all duration-300 mr-3 whitespace-nowrap ${isActive ? "text-chrono-text opacity-100" : "text-chrono-muted opacity-40"}`}>
                {year}
              </span>
              <div className={`w-3 h-3 rounded-full border transition-all duration-300 z-10 ${isActive ? "bg-chrono-text border-chrono-text scale-110" : "bg-transparent border-chrono-muted group-hover:border-chrono-text"}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TimelinePage() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShowingDemo, setIsShowingDemo] = useState(false);
  const [activeYear, setActiveYear] = useState<string>("");
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | undefined>();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchEvents = useCallback(() => {
    if (status === "loading") return;
    if (!session) {
      setEvents(demoEvents);
      setIsShowingDemo(true);
      setLoading(false);
      return;
    }
    fetch("/api/events?limit=50")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        const real = data.events || [];
        if (real.length === 0) {
          setEvents(demoEvents);
          setIsShowingDemo(true);
        } else {
          setEvents(real);
          setIsShowingDemo(false);
        }
        setNextCursor(data.nextCursor);
        setLoading(false);
      })
      .catch(() => {
        setEvents(demoEvents);
        setIsShowingDemo(true);
        setLoading(false);
      });
  }, [session, status]);

  const loadMore = useCallback(() => {
    if (!nextCursor || loadingMore || isShowingDemo) return;
    setLoadingMore(true);
    fetch(`/api/events?limit=50&cursor=${nextCursor}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.events) {
          setEvents((prev) => [...prev, ...data.events]);
          setNextCursor(data.nextCursor);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }, [nextCursor, loadingMore, isShowingDemo]);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchEvents();
    const handler = () => fetchEvents();
    window.addEventListener("chrono:event-created", handler);
    const searchHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSearchQuery(detail?.query || "");
    };
    window.addEventListener("chrono:search", searchHandler);
    return () => {
      window.removeEventListener("chrono:event-created", handler);
      window.removeEventListener("chrono:search", searchHandler);
    };
  }, [fetchEvents]);

  const handleToggleCategory = useCallback((cat: string) => {
    if (cat === "All") { setSelectedCategories(new Set()); return; }
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      const lower = cat.toLowerCase();
      if (next.has(lower)) { next.delete(lower); } else { next.add(lower); }
      return next;
    });
  }, []);

  const categoryFiltered = selectedCategories.size === 0 ? events : events.filter((e) => e.category && selectedCategories.has(e.category));
  const filteredEvents = searchQuery
    ? categoryFiltered.filter((e) => {
        const searchable = `${e.title} ${e.description || ""} ${e.location || ""} ${e.category || ""}`.toLowerCase();
        return searchable.includes(searchQuery.toLowerCase());
      })
    : categoryFiltered;
  const eventsByYear = getEventsByYear(filteredEvents);
  const allYears = Object.keys(getEventsByYear(events));
  const years = Object.keys(eventsByYear);

  useEffect(() => {
    const handleScroll = () => {
      const yearElements = document.querySelectorAll("[data-year]");
      let current = "";
      yearElements.forEach((el) => {
        if (el.getBoundingClientRect().top <= 200) current = el.getAttribute("data-year") || "";
      });
      if (current) setActiveYear(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCreateEvent = useCallback(async (eventData: Partial<TimelineEvent>) => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      if (res.ok) {
        const { event } = await res.json();
        setEvents((prev) => [event, ...prev]);
      } else {
        toast.error("Failed to create event. Please try again.");
      }
    } catch {
      toast.error("Failed to create event. Please try again.");
    }
  }, []);

  const handleEditEvent = useCallback(async (eventData: Partial<TimelineEvent>) => {
    try {
      const res = await fetch(`/api/events/${eventData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      if (res.ok) {
        const { event } = await res.json();
        setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)));
      } else {
        toast.error("Failed to update event. Please try again.");
      }
    } catch {
      toast.error("Failed to update event. Please try again.");
    }
    setEditingEvent(undefined);
  }, []);

  const handleDeleteEvent = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      } else {
        toast.error("Failed to delete event. Please try again.");
      }
    } catch {
      toast.error("Failed to delete event. Please try again.");
    }
    setEditingEvent(undefined);
    setEventModalOpen(false);
  }, []);

  const scrollToYear = (year: string) => {
    const el = document.querySelector(`[data-year="${year}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-32 flex items-center justify-center">
        <div className="text-sm font-body font-light text-chrono-muted animate-pulse">Loading your timeline...</div>
      </div>
    );
  }

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
              You&apos;re viewing a sample timeline &mdash; see what your life could look like
            </p>
            <button
              onClick={() => signIn("google", { callbackUrl: "/timeline" })}
              className="px-4 py-1.5 text-xs font-body font-light bg-foreground text-background rounded-full hover:opacity-90 transition-all whitespace-nowrap ml-4"
            >
              Start yours
            </button>
          </div>
        </motion.div>
      )}

      <section className="relative py-16 md:py-28 px-6 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="relative max-w-4xl mx-auto text-center">
          <span className="section-label mb-5 block">Your Journey</span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight text-chrono-text"><em>Timeline</em></h1>
          <p className="text-base font-body font-light text-chrono-muted max-w-md mx-auto mb-12 leading-relaxed">Every moment that shaped your story, beautifully organized and brought to life.</p>

          {!isShowingDemo && (
            <div className="flex items-center justify-center gap-3 mb-10">
              <button onClick={() => { setEditingEvent(undefined); setEventModalOpen(true); }} className="px-6 py-2.5 text-sm font-body font-light bg-foreground text-background rounded-full hover:opacity-90 transition-all duration-500 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add Event
              </button>
            </div>
          )}

          <CategoryFilterBar selected={selectedCategories} onToggle={handleToggleCategory} />
        </motion.div>

        {allYears.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="flex justify-center gap-3 mt-14">
            {allYears.map((year, i) => (
              <motion.button key={year} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.1 }} onClick={() => scrollToYear(year)}
                className={`px-5 py-2 text-sm font-body font-light transition-all rounded-full ${activeYear === year ? "bg-[var(--muted)] border border-[var(--line-hover)] text-chrono-text" : "border border-[var(--line)] hover:border-[var(--line-hover)] text-chrono-muted"}`}>
                {year}
              </motion.button>
            ))}
          </motion.div>
        )}
      </section>

      <AnimatePresence>
        {activeYear && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-30">
            <div className="px-4 py-1.5 glass-strong text-xs font-body font-light text-chrono-text flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-chrono-accent" />
              {activeYear}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <YearScrubber years={allYears} activeYear={activeYear} onYearClick={scrollToYear} />

      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-body font-light text-chrono-muted border border-[var(--line)] rounded-full">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            {filteredEvents.length} result{filteredEvents.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
          </span>
        </motion.div>
      )}

      {filteredEvents.length === 0 && (searchQuery || selectedCategories.size > 0) ? (
        <div className="text-center py-32">
          <svg className="w-10 h-10 mx-auto mb-4 text-chrono-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <p className="text-sm font-body font-extralight text-chrono-muted italic">
            {searchQuery
              ? `No memories matching "${searchQuery}"`
              : "No memories in the selected categories."}
          </p>
          {searchQuery && (
            <p className="text-xs font-body font-extralight text-chrono-muted mt-2">
              Try a different search term or clear your filters
            </p>
          )}
        </div>
      ) : events.length === 0 && !isShowingDemo ? (
        <EmptyState icon="timeline" title="Your story starts here" description="Add your first life event to begin building your personal timeline. Every moment matters." actionLabel="Create First Event" onAction={() => setEventModalOpen(true)} />
      ) : (
        <section className="px-6">
          <div className="space-y-28">
            <AnimatePresence mode="sync">
              {years.map((year) => (
                  <motion.div key={year} data-year={year} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
                    <YearSection year={year} events={eventsByYear[year]} onEditEvent={isShowingDemo ? undefined : (event) => { setEditingEvent(event); setEventModalOpen(true); }} />
                  </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {nextCursor && !isShowingDemo && (
        <div className="text-center mt-16">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 text-sm font-body font-light text-chrono-muted border border-[var(--line-strong)] hover:border-[var(--line-hover)] hover:text-chrono-text rounded-full transition-all duration-500 disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {events.length > 0 && !isShowingDemo && (
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-40">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-chrono-muted" />
            <p className="text-sm font-display font-light italic text-chrono-muted">Your story continues...</p>
            <button onClick={() => { setEditingEvent(undefined); setEventModalOpen(true); }} className="mt-2 px-5 py-2 text-xs font-body font-light text-chrono-muted border border-[var(--line-strong)] hover:border-[var(--line-hover)] hover:text-chrono-text rounded-full transition-all duration-500">
              Add Next Moment
            </button>
          </div>
        </motion.div>
      )}

      {isShowingDemo && (
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-40 mb-10">
          <div className="inline-flex flex-col items-center gap-6">
            <div className="w-2 h-2 rounded-full bg-chrono-muted" />
            <p className="text-lg font-display font-light italic text-chrono-muted">This could be your story.</p>
            <button
              onClick={() => signIn("google", { callbackUrl: "/timeline" })}
              className="px-8 py-3 text-sm font-body font-light bg-foreground text-background rounded-full hover:opacity-90 transition-all duration-500"
            >
              Start Your Timeline
            </button>
          </div>
        </motion.div>
      )}

      <EventModal isOpen={eventModalOpen} onClose={() => { setEventModalOpen(false); setEditingEvent(undefined); }} onSave={editingEvent ? handleEditEvent : handleCreateEvent} event={editingEvent} onDelete={handleDeleteEvent} />
    </div>
  );
}
