"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { AIStory } from "@/data/demo";
import AIStorySummary from "@/components/timeline/AIStorySummary";
import StatCard from "@/components/insights/StatCard";
import CategoryChart from "@/components/insights/CategoryChart";
import YearChart from "@/components/insights/YearChart";
import CityChart from "@/components/insights/CityChart";
import ShareCard from "@/components/share/ShareCard";
import { AIStoryLoadingSkeleton } from "@/components/ui/Skeletons";
import EmptyState from "@/components/ui/EmptyState";

interface InsightStats {
  totalEvents: number;
  totalPhotos: number;
  citiesVisited: number;
  mostActiveYear: number;
  mostVisitedCity: string;
  topCategory: string;
  longestStreak: string;
  categories: { name: string; count: number; color: string }[];
  yearlyEvents: { year: number; count: number }[];
  cityVisits: { city: string; count: number }[];
}

export default function InsightsPage() {
  const [stories, setStories] = useState<AIStory[]>([]);
  const [stats, setStats] = useState<InsightStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareStory, setShareStory] = useState<AIStory | null>(null);
  const [storyFilter, setStoryFilter] = useState<"all" | "year" | "chapter">("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/stories").then((r) => r.json()),
      fetch("/api/insights").then((r) => r.json()),
    ])
      .then(([storiesData, insightsData]) => {
        setStories(storiesData.stories || []);
        setStats(insightsData.stats || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleRegenerate = useCallback(async (storyId: string) => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/stories/${storyId}`, { method: "PUT" });
      if (res.ok) {
        const data = await res.json();
        setStories((prev) =>
          prev.map((s) => (s.id === storyId ? data.story : s))
        );
      }
    } catch (err) {
      console.error("Failed to regenerate story:", err);
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleShare = useCallback((story: AIStory) => {
    setShareStory(story);
    setShareOpen(true);
  }, []);

  const filteredStories = stories.filter((s) => {
    if (storyFilter === "year") return s.year !== undefined;
    if (storyFilter === "chapter") return !s.year;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-32 flex items-center justify-center">
        <div className="text-sm font-body font-light text-chrono-muted animate-pulse">Loading insights...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen pt-24 pb-32">
        <section className="relative py-16 md:py-28 px-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-4xl mx-auto text-center"
          >
            <span className="section-label mb-5 block">Discover</span>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight">
              <em className="text-chrono-text">Insights</em>
            </h1>
          </motion.div>
        </section>
        <EmptyState
          icon="timeline"
          title="No insights yet"
          description="Add events to your timeline to unlock analytics, patterns, and stories about your life."
          actionLabel="Go to Timeline"
          onAction={() => window.location.href = "/timeline"}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-32">
      <section className="relative py-16 md:py-28 px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <span className="section-label mb-5 block">
            Discover
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight">
            <em className="text-chrono-text">Insights</em>
          </h1>
          <p className="text-base font-body font-light text-chrono-muted max-w-md mx-auto leading-relaxed">
            Patterns, highlights, and stories hidden in your
            life&apos;s timeline.
          </p>
        </motion.div>
      </section>

      <section className="px-6 mb-28">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[var(--line)]">
          <StatCard label="Total Events" value={stats.totalEvents} delay={0} />
          <StatCard label="Photos captured" value={stats.totalPhotos} delay={0.1} />
          <StatCard label="Cities visited" value={stats.citiesVisited} delay={0.2} />
          <StatCard label="Most active year" value={stats.mostActiveYear.toString()} delay={0.3} />
        </div>
      </section>

      <section className="px-6 mb-28">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-16"
          >
            <span className="section-label mb-5 block">Highlights</span>
            <h2 className="text-3xl md:text-4xl font-display font-light tracking-tight">
              Your Year in Review
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[var(--line)]">
            {[
              { label: "Most visited city", value: stats.mostVisitedCity },
              { label: "Top category", value: stats.topCategory },
              { label: "Longest active streak", value: stats.longestStreak },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.9 }}
                className="bg-chrono-bg p-10 text-center card-hover"
              >
                <div className="text-2xl font-display font-light text-chrono-text mb-3">
                  {item.value}
                </div>
                <div className="section-label">
                  {item.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 mb-28">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="section-label mb-5 block">Analytics</span>
            <h2 className="text-2xl md:text-3xl font-display font-light tracking-tight">
              Data Visualizations
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <CategoryChart categories={stats.categories} />
            <YearChart data={stats.yearlyEvents} />
          </div>
          <CityChart data={stats.cityVisits} />
        </div>
      </section>

      {stories.length > 0 && (
        <section className="px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <span className="section-label mb-4 block">Your Narratives</span>
              <h2 className="text-3xl md:text-4xl font-display font-light mb-4 tracking-tight">
                Life Stories
              </h2>
              <p className="text-sm font-body font-light text-chrono-muted max-w-md mx-auto">
                Emotional, crafted narratives about your life chapters and milestones.
              </p>
            </motion.div>

            <div className="flex justify-center gap-2 mb-10">
              {[
                { id: "all" as const, label: "All Stories" },
                { id: "year" as const, label: "By Year" },
                { id: "chapter" as const, label: "By Chapter" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStoryFilter(tab.id)}
                  className={`px-4 py-2 text-xs font-body font-light transition-all duration-300 rounded-full ${
                    storyFilter === tab.id
                      ? "bg-[var(--muted)] border border-[var(--line-hover)] text-chrono-accent"
                      : "text-chrono-muted hover:text-chrono-text border border-[var(--line-strong)] hover:border-[var(--line-hover)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-10">
              <AnimatePresence mode="wait">
                {generating && <AIStoryLoadingSkeleton />}
              </AnimatePresence>

              {filteredStories.map((story, i) => (
                <div key={story.id} className="relative">
                  <AIStorySummary story={story} index={i} />

                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-end gap-2 mt-3 px-2"
                  >
                    <button
                      onClick={() => handleRegenerate(story.id)}
                      disabled={generating}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-body font-light text-chrono-muted hover:text-chrono-text border border-[var(--line-strong)] hover:border-[var(--line-hover)] transition-all disabled:opacity-40"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                      </svg>
                      Regenerate
                    </button>
                    <button
                      onClick={() => handleShare(story)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-body font-light text-chrono-muted hover:text-chrono-text border border-[var(--line-strong)] hover:border-[var(--line-hover)] transition-all"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                      </svg>
                      Share
                    </button>
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(story.summary);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-body font-light text-chrono-muted hover:text-chrono-text border border-[var(--line-strong)] hover:border-[var(--line-hover)] transition-all"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                      Copy
                    </button>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {shareStory && (
        <ShareCard
          isOpen={shareOpen}
          onClose={() => { setShareOpen(false); setShareStory(null); }}
          type={shareStory.year ? "year-review" : "story"}
          title={shareStory.title}
          content={shareStory.summary}
          stats={shareStory.stats}
          highlights={shareStory.highlights}
        />
      )}
    </div>
  );
}
