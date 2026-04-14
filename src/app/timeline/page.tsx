"use client";

import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { TimelineEvent, getEventsByYear } from "@/data/demo";
import YearSection from "@/components/timeline/YearSection";
import EventModal from "@/components/events/EventModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { toast } from "sonner";
import { CATEGORIES } from "@/lib/constants";
import { useEvents } from "@/hooks/useEvents";

const FILTER_OPTIONS = ["All", ...CATEGORIES.map((c) => c.label)];

interface FilterBarProps {
  selectedCategories: Set<string>;
  onToggleCategory: (cat: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (val: string) => void;
  onDateToChange: (val: string) => void;
  hasDateFilter: boolean;
  onClearDates: () => void;
}

function FilterBar({
  selectedCategories,
  onToggleCategory,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  hasDateFilter,
  onClearDates,
}: FilterBarProps) {
  const [showDateFilter, setShowDateFilter] = useState(hasDateFilter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="space-y-3"
    >
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap" role="radiogroup" aria-label="Filter by category">
        {FILTER_OPTIONS.map((cat) => {
          const isSelected = cat === "All" ? selectedCategories.size === 0 : selectedCategories.has(cat.toLowerCase());
          return (
            <button
              key={cat}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onToggleCategory(cat)}
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
        <button
          onClick={() => setShowDateFilter((v) => !v)}
          className={`px-4 py-1.5 text-xs font-body font-light rounded-full transition-all duration-300 whitespace-nowrap border flex items-center gap-1.5 ${
            hasDateFilter
              ? "bg-foreground text-background border-foreground"
              : "bg-transparent text-chrono-muted border-[var(--line-strong)] hover:border-[var(--line-hover)]"
          }`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          Date Range
        </button>
      </div>

      <AnimatePresence>
        {showDateFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <label className="flex items-center gap-2">
                <span className="text-xs font-body font-light text-chrono-muted">From</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => onDateFromChange(e.target.value)}
                  className="px-3 py-1.5 text-xs font-body font-light bg-transparent text-chrono-text border border-[var(--line-strong)] rounded-full focus:border-[var(--line-hover)] focus:outline-none transition-colors"
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-xs font-body font-light text-chrono-muted">To</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => onDateToChange(e.target.value)}
                  className="px-3 py-1.5 text-xs font-body font-light bg-transparent text-chrono-text border border-[var(--line-strong)] rounded-full focus:border-[var(--line-hover)] focus:outline-none transition-colors"
                />
              </label>
              {hasDateFilter && (
                <button
                  onClick={() => { onClearDates(); setShowDateFilter(false); }}
                  className="px-3 py-1.5 text-xs font-body font-light text-chrono-muted hover:text-chrono-text border border-[var(--line-strong)] hover:border-[var(--line-hover)] rounded-full transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

export default function TimelinePageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 pb-32 flex items-center justify-center"><div className="text-sm font-body font-light text-chrono-muted animate-pulse">Loading your timeline...</div></div>}>
      <TimelinePage />
    </Suspense>
  );
}

function TimelinePage() {
  const { events, isLoading, isShowingDemo, nextCursor, loadingMore, loadMore, mutate } = useEvents(50);
  const [activeYear, setActiveYear] = useState<string>("");
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | undefined>();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  // Re-fetch when events are created via AddMemoryButton
  useEffect(() => {
    const handler = () => mutate();
    window.addEventListener("chrono:event-created", handler);
    return () => window.removeEventListener("chrono:event-created", handler);
  }, [mutate]);

  const handleToggleCategory = useCallback((cat: string) => {
    if (cat === "All") { setSelectedCategories(new Set()); return; }
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      const lower = cat.toLowerCase();
      if (next.has(lower)) { next.delete(lower); } else { next.add(lower); }
      return next;
    });
  }, []);

  const hasDateFilter = dateFrom !== "" || dateTo !== "";
  const categoryFiltered = selectedCategories.size === 0 ? events : events.filter((e) => e.category && selectedCategories.has(e.category));
  const dateFiltered = hasDateFilter
    ? categoryFiltered.filter((e) => {
        const eventTime = new Date(e.date).getTime();
        if (dateFrom && eventTime < new Date(dateFrom).getTime()) return false;
        if (dateTo && eventTime > new Date(dateTo + "T23:59:59").getTime()) return false;
        return true;
      })
    : categoryFiltered;
  const filteredEvents = searchQuery
    ? dateFiltered.filter((e) => {
        const searchable = `${e.title} ${e.description || ""} ${e.location || ""} ${e.category || ""}`.toLowerCase();
        return searchable.includes(searchQuery.toLowerCase());
      })
    : dateFiltered;
  const eventsByYear = getEventsByYear(filteredEvents);
  const allYears = Object.keys(getEventsByYear(events));
  const years = Object.keys(eventsByYear);

  const handleScroll = useCallback(() => {
    const yearElements = document.querySelectorAll("[data-year]");
    let current = "";
    yearElements.forEach((el) => {
      if (el.getBoundingClientRect().top <= 200) current = el.getAttribute("data-year") || "";
    });
    if (current) setActiveYear(current);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleCreateEvent = useCallback(async (eventData: Partial<TimelineEvent>) => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      if (res.ok) {
        mutate();
        toast.success("Event created");
      } else {
        toast.error("Failed to create event. Please try again.");
      }
    } catch {
      toast.error("Failed to create event. Please try again.");
    }
  }, [mutate]);

  const handleEditEvent = useCallback(async (eventData: Partial<TimelineEvent>) => {
    try {
      const res = await fetch(`/api/events/${eventData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      if (res.ok) {
        mutate();
      } else {
        toast.error("Failed to update event. Please try again.");
      }
    } catch {
      toast.error("Failed to update event. Please try again.");
    }
    setEditingEvent(undefined);
  }, [mutate]);

  const handleRequestDelete = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmId) return;
    const deletedId = deleteConfirmId;
    setDeleteConfirmId(null);
    setEditingEvent(undefined);
    setEventModalOpen(false);
    try {
      const res = await fetch(`/api/events/${deletedId}`, { method: "DELETE" });
      if (res.ok) {
        mutate();
        toast("Event deleted", {
          duration: 30000,
          action: {
            label: "Undo",
            onClick: async () => {
              try {
                const restoreRes = await fetch(`/api/events/${deletedId}/restore`, { method: "POST" });
                if (restoreRes.ok) {
                  mutate();
                  toast.success("Event restored");
                } else {
                  toast.error("Failed to restore event");
                }
              } catch {
                toast.error("Failed to restore event");
              }
            },
          },
        });
      } else {
        toast.error("Failed to delete event. Please try again.");
      }
    } catch {
      toast.error("Failed to delete event. Please try again.");
    }
  }, [deleteConfirmId, mutate]);

  const handleGenerateStory = useCallback(async (year: number) => {
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year }),
      });
      if (res.ok) {
        toast.success(`${year} story generated! View it on the Insights page.`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to generate story");
      }
    } catch {
      toast.error("Failed to generate story");
    }
  }, []);

  const scrollToYear = (year: string) => {
    const el = document.querySelector(`[data-year="${year}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isLoading) {
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

          <FilterBar
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            hasDateFilter={hasDateFilter}
            onClearDates={() => { setDateFrom(""); setDateTo(""); }}
          />
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

      {filteredEvents.length === 0 && (searchQuery || selectedCategories.size > 0 || hasDateFilter) ? (
        <div className="text-center py-32">
          <svg className="w-10 h-10 mx-auto mb-4 text-chrono-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <p className="text-sm font-body font-extralight text-chrono-muted italic">
            {searchQuery
              ? `No memories matching "${searchQuery}"`
              : hasDateFilter
                ? "No memories in the selected date range."
                : "No memories in the selected categories."}
          </p>
          {(searchQuery || hasDateFilter) && (
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
                    <YearSection year={year} events={eventsByYear[year]} onEditEvent={isShowingDemo ? undefined : (event) => { setEditingEvent(event); setEventModalOpen(true); }} onGenerateStory={isShowingDemo ? undefined : handleGenerateStory} />
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

      <EventModal isOpen={eventModalOpen} onClose={() => { setEventModalOpen(false); setEditingEvent(undefined); }} onSave={editingEvent ? handleEditEvent : handleCreateEvent} event={editingEvent} onDelete={handleRequestDelete} />
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete event?"
        description="This event will be removed from your timeline. You'll have 30 seconds to undo."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
