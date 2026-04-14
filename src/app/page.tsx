"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { demoEvents, demoStories, getEventsByYear, TimelineEvent, AIStory } from "@/data/demo";
import TimelineCard from "@/components/timeline/TimelineCard";
import AIStorySummary from "@/components/timeline/AIStorySummary";
import ParticleField from "@/components/three/ParticleField";
import MarqueeTicker from "@/components/ui/MarqueeTicker";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useEvents } from "@/hooks/useEvents";
import { useStories } from "@/hooks/useStories";

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const HERO_WORDS = ["beautifully", "elegantly"] as const;

function AnimatedWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_WORDS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block relative align-bottom text-right overflow-visible" style={{ lineHeight: "inherit", paddingRight: "0.08em" }}>
      {/* invisible sizer — holds natural width/height for longest word */}
      <span className="invisible italic" aria-hidden="true">beautifully</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={HERO_WORDS[index]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute inset-0 italic text-chrono-accent text-right"
          style={{ lineHeight: "inherit" }}
        >
          {HERO_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}


function HeroButtons() {
  const { data: session, status } = useSession();
  const isLoggedIn = status !== "loading" && !!session;

  const handleGetStarted = () => {
    if (isLoggedIn) {
      window.location.href = "/timeline";
    } else {
      signIn("google", { callbackUrl: "/timeline" });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
      <button
        onClick={handleGetStarted}
        className="inline-flex cursor-pointer items-center justify-center rounded-xl px-8 py-3.5 text-sm font-body font-medium tracking-wide transition-all duration-300 bg-chrono-accent text-white hover:opacity-90 active:scale-[0.98] shadow-[0_2px_12px_rgba(74,107,82,0.25)]"
      >
        Get Started
      </button>
      <Link
        href="/insights"
        className="px-8 py-3.5 text-chrono-muted hover:text-chrono-text border border-[var(--line-strong)] hover:border-[var(--line-hover)] rounded-xl transition-all duration-300 text-sm font-body font-medium inline-block cursor-pointer"
      >
        View Insights
      </Link>
    </div>
  );
}

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.97]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <ParticleField />

      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 50% 40% at 50% 45%, var(--chrono-glow) 0%, transparent 60%)",
        }}
      />

      <motion.div
        style={{ y, scale }}
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 1.5 }}
          className="section-label mb-6"
        >
          Your Digital Life Story
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-semibold tracking-tight mb-8 text-chrono-text"
          style={{ fontSize: "clamp(2.6rem, 6vw, 4.8rem)", lineHeight: 1.15 }}
        >
          <span className="block">Your life,</span>
          <span className="block pb-1">
            <AnimatedWord /> mapped
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.2 }}
          className="text-base md:text-lg font-body font-normal max-w-lg mx-auto leading-relaxed text-chrono-muted"
        >
          A visual timeline of your memories, milestones, and places.
        </motion.p>
        <HeroButtons />
      </motion.div>
    </section>
  );
}

function OnThisDayWidget({ events }: { events?: TimelineEvent[] }) {
  const today = new Date();
  const month = today.getMonth();
  const day = today.getDate();

  const source = events && events.length > 0 ? events : demoEvents;
  const matches = source.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === month && d.getDate() === day && d.getFullYear() !== today.getFullYear();
  });

  return (
    <section className="relative py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="border-t border-b border-[var(--line)] py-10">
          <FadeUp>
            <span className="section-label mb-6 block text-center">On This Day</span>
          </FadeUp>

          {matches.length > 0 ? (
            <FadeUp delay={0.1}>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {matches.map((event) => {
                  const year = new Date(event.date).getFullYear();
                  return (
                    <div
                      key={event.id}
                      className="flex-shrink-0 w-48 sm:w-60 px-5 py-4 border border-[var(--line)] bg-[var(--card-bg)] hover:border-[var(--line-hover)] rounded-xl transition-all shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-display font-semibold text-chrono-text">{year}</span>
                        {event.category && (
                          <span className="px-2 py-0.5 text-[10px] font-body font-medium border border-[var(--line)] rounded-lg text-chrono-muted uppercase tracking-wider">
                            {event.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-body font-normal text-chrono-text leading-snug line-clamp-2">
                        {event.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </FadeUp>
          ) : (
            <FadeUp delay={0.1}>
              <p className="text-center text-sm font-body font-normal italic text-chrono-muted">
                Nothing yet — but today could be the start of something worth remembering.
              </p>
            </FadeUp>
          )}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Add your memories",
      description: "Import from photos, connect your calendar, or add events manually.",
    },
    {
      number: "02",
      title: "Watch your story unfold",
      description: "See your life organized chronologically with maps and insights.",
    },
    {
      number: "03",
      title: "Discover your narrative",
      description: "Crohna crafts personal narratives about your life chapters.",
    },
  ];

  return (
    <section className="relative py-[80px] md:py-[160px] px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-28">
          <span className="section-label mb-5 block">How It Works</span>
          <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-chrono-text">
            Three steps to your
            <br />
            <em>life story</em>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
          {steps.map((step, i) => (
            <FadeUp key={step.number} delay={i * 0.15} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-4 left-[60%] right-[-40%] h-px bg-[var(--line)]" />
              )}

              <div className="w-10 h-10 rounded-xl bg-chrono-accent/10 flex items-center justify-center mb-5 mx-auto text-sm font-body font-semibold text-chrono-accent">
                {step.number}
              </div>
              <h3 className="text-lg font-display font-semibold text-chrono-text mb-3">
                {step.title}
              </h3>
              <p className="text-sm font-body font-normal leading-relaxed max-w-xs mx-auto text-chrono-muted">
                {step.description}
              </p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlayYourStorySection({ events }: { events?: TimelineEvent[] }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentYearIndex, setCurrentYearIndex] = useState(-1);
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);
  const [showEvent, setShowEvent] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const innerTimerRef = useRef<NodeJS.Timeout | null>(null);

  const source = events && events.length > 0 ? events : demoEvents;
  const eventsByYear = getEventsByYear(source);
  const years = Object.keys(eventsByYear);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (innerTimerRef.current) clearTimeout(innerTimerRef.current);
  }, []);

  const play = useCallback(() => {
    cleanup();
    setIsPlaying(true);
    setCurrentYearIndex(0);
    setCurrentEventIndex(-1);
    setShowEvent(false);
  }, [cleanup]);

  useEffect(() => {
    if (!isPlaying || currentYearIndex < 0) return;

    if (currentYearIndex >= years.length) {
      const t = setTimeout(() => {
        setIsPlaying(false);
        setCurrentYearIndex(-1);
        setCurrentEventIndex(-1);
        setShowEvent(false);
      }, 2000);
      timerRef.current = t;
      return () => clearTimeout(t);
    }

    const yearEvents = eventsByYear[years[currentYearIndex]];

    if (currentEventIndex < 0) {
      const t = setTimeout(() => {
        setCurrentEventIndex(0);
        setShowEvent(true);
      }, 800);
      timerRef.current = t;
      return () => clearTimeout(t);
    }

    if (currentEventIndex < yearEvents.length - 1) {
      const t = setTimeout(() => {
        setShowEvent(false);
        const inner = setTimeout(() => {
          setCurrentEventIndex((prev) => prev + 1);
          setShowEvent(true);
        }, 200);
        innerTimerRef.current = inner;
      }, 1200);
      timerRef.current = t;
      return () => { clearTimeout(t); if (innerTimerRef.current) clearTimeout(innerTimerRef.current); };
    }

    const t = setTimeout(() => {
      setShowEvent(false);
      const inner = setTimeout(() => {
        setCurrentYearIndex((prev) => prev + 1);
        setCurrentEventIndex(-1);
      }, 300);
      innerTimerRef.current = inner;
    }, 1200);
    timerRef.current = t;
    return () => { clearTimeout(t); if (innerTimerRef.current) clearTimeout(innerTimerRef.current); };
  }, [isPlaying, currentYearIndex, currentEventIndex, years, eventsByYear]);

  useEffect(() => cleanup, [cleanup]);

  const currentYear = currentYearIndex >= 0 && currentYearIndex < years.length ? years[currentYearIndex] : null;
  const currentEvent = currentYear && currentEventIndex >= 0
    ? eventsByYear[currentYear][currentEventIndex]
    : null;

  return (
    <section className="relative py-[80px] md:py-[160px] px-6">
      <div className="max-w-4xl mx-auto">
        <FadeUp className="text-center mb-20">
          <span className="section-label mb-5 block">Experience</span>
          <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight mb-5 text-chrono-text">
            Play your
            <br />
            <em>story</em>
          </h2>
          <p className="font-body font-normal max-w-md mx-auto text-sm leading-relaxed text-chrono-muted">
            Watch your life unfold year by year in a cinematic sequence
          </p>
        </FadeUp>

        <div className="relative min-h-[320px] flex flex-col items-center justify-center">
          {!isPlaying && currentYearIndex < 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              onClick={play}
              className="group flex items-center gap-4 px-6 py-3 sm:px-10 sm:py-5 bg-[var(--card-bg)] border border-[var(--line)] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl bg-chrono-accent/10 flex items-center justify-center group-hover:bg-chrono-accent/20 transition-colors duration-500">
                <svg className="w-5 h-5 text-chrono-accent ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-base font-display font-semibold text-chrono-text">Play Your Story</div>
                <div className="text-xs font-body font-normal text-chrono-muted">{years[0]} — {years[years.length - 1]}</div>
              </div>
            </motion.button>
          )}

          {isPlaying && currentYearIndex >= 0 && currentYearIndex < years.length && (
            <div className="w-full flex flex-col items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentYear}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center mb-10"
                >
                  <div className="text-5xl sm:text-7xl md:text-[8rem] font-display font-semibold text-chrono-text leading-none">
                    {currentYear}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="relative h-24 w-full max-w-lg flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {showEvent && currentEvent && (
                    <motion.div
                      key={currentEvent.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute text-center"
                    >
                      <div className="text-lg md:text-xl font-display font-semibold text-chrono-text mb-1">
                        {currentEvent.title}
                      </div>
                      {currentEvent.location && (
                        <div className="text-xs font-body font-normal text-chrono-muted">
                          {currentEvent.location}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 mt-8">
                {years.map((year, i) => (
                  <div
                    key={year}
                    className="h-[1px] transition-all duration-500"
                    style={{
                      width: i < currentYearIndex ? 32 : i === currentYearIndex ? 48 : 24,
                      background: i < currentYearIndex
                        ? "var(--chrono-muted)"
                        : i === currentYearIndex
                        ? "var(--chrono-accent)"
                        : "var(--line)",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {isPlaying && currentYearIndex >= years.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-display font-semibold text-chrono-text mb-4">
                Your story continues
              </div>
              <button
                onClick={play}
                className="mt-4 px-6 py-2.5 text-sm font-body font-medium text-chrono-muted border border-[var(--line-strong)] hover:border-[var(--line-hover)] hover:text-chrono-text rounded-xl transition-all duration-300"
              >
                Replay
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: "Timeline",
      description: "Every moment organized chronologically. A living record of the events that shaped your story.",
    },
    {
      title: "Stories",
      description: "Beautiful, emotional summaries of your life chapters. Narratives crafted from your real experiences.",
    },
    {
      title: "Places",
      description: "See where your life happened on an animated map with pins for every memory.",
    },
    {
      title: "Insights",
      description: "Discover patterns in your life — most active years, favorite cities, biggest milestones.",
    },
  ];

  return (
    <section className="relative py-[80px] md:py-[160px] px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-28">
          <span className="section-label mb-5 block">Features</span>
          <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-chrono-text">
            Everything you need to
            <br />
            <em>relive your story</em>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((feature, i) => (
            <FadeUp key={feature.title} delay={i * 0.1}>
              <div className="group bg-[var(--card-bg)] p-6 sm:p-8 md:p-10 rounded-2xl border border-[var(--line)] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-500 h-full">
                <h3 className="text-lg font-display font-semibold mb-3 text-chrono-text tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm font-body font-normal leading-relaxed text-chrono-muted">
                  {feature.description}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelinePreview({ events }: { events?: TimelineEvent[] }) {
  const source = events && events.length > 0 ? events : demoEvents;
  const previewEvents = source.slice(0, 3);

  return (
    <section className="relative py-[80px] md:py-[160px] px-6">
      <div className="relative max-w-6xl mx-auto">
        <span className="watermark right-0 top-0">Timeline</span>

        <FadeUp className="text-center mb-24">
          <span className="section-label mb-5 block">Chapters of Your Life</span>
          <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight mb-5 text-chrono-text">
            Your life <em>in motion</em>
          </h2>
          <p className="font-body font-normal max-w-md mx-auto text-sm leading-relaxed text-chrono-muted">
            Every event becomes a card on your personal timeline
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-20">
          {previewEvents.map((event, i) => (
            <TimelineCard key={event.id} event={event} index={i} />
          ))}
        </div>

        <FadeUp className="text-center">
          <Link
            href="/timeline"
            className="px-6 py-3 md:px-10 md:py-4 text-sm font-body font-medium text-chrono-text border border-[var(--line-strong)] hover:border-[var(--line-hover)] hover:text-foreground rounded-full transition-all duration-500 inline-block"
          >
            Explore Full Timeline
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}

const FALLBACK_LOCATIONS = [
  { name: "Boulder, CO", count: 7, x: 28, y: 38 },
  { name: "San Francisco", count: 3, x: 15, y: 40 },
  { name: "New York", count: 1, x: 78, y: 36 },
  { name: "Seattle", count: 2, x: 16, y: 28 },
  { name: "Denver", count: 1, x: 30, y: 40 },
];

function deriveMapLocations(events: TimelineEvent[]) {
  const withLocation = events.filter((e) => e.location);
  if (withLocation.length === 0) return null;

  // Group by location name and count
  const locationMap = new Map<string, number>();
  for (const e of withLocation) {
    const loc = e.location!;
    locationMap.set(loc, (locationMap.get(loc) || 0) + 1);
  }

  // Take top 5 locations, distribute across the visual area
  const sorted = Array.from(locationMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Simple deterministic positioning based on index
  const positions = [
    { x: 28, y: 38 }, { x: 15, y: 40 }, { x: 78, y: 36 },
    { x: 16, y: 28 }, { x: 55, y: 45 },
  ];

  return {
    locations: sorted.map(([name, count], i) => ({
      name,
      count,
      x: positions[i].x,
      y: positions[i].y,
    })),
    totalCities: locationMap.size,
    totalMemories: withLocation.length,
  };
}

function MapPreview({ events }: { events?: TimelineEvent[] }) {
  const source = events && events.length > 0 ? events : demoEvents;
  const derived = deriveMapLocations(source);
  const locations = derived?.locations || FALLBACK_LOCATIONS;
  const totalCities = derived?.totalCities || 7;
  const totalMemories = derived?.totalMemories || 16;

  return (
    <section className="relative py-[80px] md:py-[160px] px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-24">
          <span className="section-label mb-5 block">A Record of Where You&apos;ve Been</span>
          <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight mb-5 text-chrono-text">
            See where your
            <br />
            <em>story happened</em>
          </h2>
          <p className="font-body font-normal max-w-md mx-auto text-sm leading-relaxed text-chrono-muted">
            Every memory pinned to the places that matter most
          </p>
        </FadeUp>

        <FadeUp>
          <div className="relative bg-[var(--card-bg)] p-5 sm:p-8 md:p-10 border border-[var(--line)] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="relative h-64 md:h-80 flex items-center justify-center">
              <div className="relative w-full h-full">
                {locations.map((loc, i) => (
                  <motion.div
                    key={loc.name}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 150, damping: 20 }}
                    className="absolute group cursor-pointer"
                    style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                  >
                    <div className="relative">
                      <div
                        className="w-3 h-3 rounded-full border-[1.5px]"
                        style={{
                          backgroundColor: "var(--line)",
                          borderColor: "var(--chrono-accent)",
                          boxShadow: `0 0 20px var(--chrono-glow)`,
                        }}
                      />
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-[var(--card-bg)] border border-[var(--line)] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.06)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                      <p className="text-[11px] font-body font-medium text-chrono-text">{loc.name}</p>
                      <p className="text-[10px] font-body font-normal text-chrono-muted">{loc.count} events</p>
                    </div>
                  </motion.div>
                ))}

                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                  {locations.slice(1).map((loc, i) => (
                    <motion.line
                      key={loc.name}
                      x1={`${locations[0].x}%`} y1={`${locations[0].y}%`}
                      x2={`${loc.x}%`} y2={`${loc.y}%`}
                      stroke="var(--line)" strokeWidth="0.5"
                      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.15, duration: 1.5 }}
                    />
                  ))}
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap mt-6 pt-6 border-t border-[var(--line)]">
              <div className="text-center">
                <div className="text-xl font-display font-semibold text-chrono-text">{totalCities}</div>
                <div className="text-[11px] font-body font-medium text-chrono-muted uppercase tracking-[0.12em]">Cities</div>
              </div>
              <div className="w-px h-8 bg-[var(--line)]" />
              <div className="text-center">
                <div className="text-xl font-display font-semibold text-chrono-text">{locations.length}</div>
                <div className="text-[11px] font-body font-medium text-chrono-muted uppercase tracking-[0.12em]">Top Locations</div>
              </div>
              <div className="w-px h-8 bg-[var(--line)]" />
              <div className="text-center">
                <div className="text-xl font-display font-semibold text-chrono-text">{totalMemories}</div>
                <div className="text-[11px] font-body font-medium text-chrono-muted uppercase tracking-[0.12em]">Memories</div>
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp className="text-center mt-14">
          <Link
            href="/map"
            className="px-6 py-3 md:px-10 md:py-4 text-sm font-body font-medium text-chrono-text border border-[var(--line-strong)] hover:border-[var(--line-hover)] hover:text-foreground rounded-full transition-all duration-500 inline-block"
          >
            Explore Life Map
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}

function StoriesPreview({ stories }: { stories?: AIStory[] }) {
  return (
    <section className="relative py-[80px] md:py-[160px] px-6">
      <div className="max-w-4xl mx-auto">
        <FadeUp className="text-center mb-24">
          <span className="section-label mb-5 block">Patterns in Your Story</span>
          <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight mb-5 text-chrono-text">
            Narratives written about
            <br />
            <em>your life</em>
          </h2>
          <p className="font-body font-normal max-w-md mx-auto text-sm leading-relaxed text-chrono-muted">
            Emotional, personal narratives crafted about your journey
          </p>
        </FadeUp>

        <AIStorySummary story={stories && stories.length > 0 ? stories[0] : demoStories[0]} index={0} />

        <FadeUp className="text-center mt-16">
          <Link
            href="/insights"
            className="px-6 py-3 md:px-10 md:py-4 text-sm font-body font-medium text-chrono-text border border-[var(--line-strong)] hover:border-[var(--line-hover)] hover:text-foreground rounded-full transition-all duration-500 inline-block"
          >
            View All Stories
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}

function UseCasesSection() {
  const useCases = [
    {
      persona: "The Designer",
      scenario: "Turning three years of scattered photos and memories into a cohesive, visual timeline of creative milestones.",
    },
    {
      persona: "The Engineer",
      scenario: "Mapping career growth, side projects, and conference talks into a year-in-review that reveals just how much was accomplished.",
    },
    {
      persona: "The Student",
      scenario: "Building a college timeline to share with family — every semester, study abroad trip, and graduation milestone in one place.",
    },
  ];

  return (
    <section className="relative py-[80px] md:py-[160px] px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-24">
          <span className="section-label mb-5 block">Example Use Cases</span>
          <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-chrono-text">
            How people use <em>Crohna</em>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {useCases.map((uc, i) => (
            <FadeUp key={uc.persona} delay={i * 0.12}>
              <div className="bg-[var(--card-bg)] p-6 sm:p-8 md:p-10 rounded-2xl border border-[var(--line)] shadow-[0_4px_20px_rgba(0,0,0,0.04)] h-full flex flex-col">
                <p className="text-sm font-body font-normal leading-relaxed mb-8 flex-1 text-chrono-muted">
                  {uc.scenario}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-chrono-accent/10 flex items-center justify-center text-xs font-body font-semibold text-chrono-accent">
                    {uc.persona.split(" ")[1][0]}
                  </div>
                  <div>
                    <div className="text-sm font-body font-medium text-chrono-text">{uc.persona}</div>
                    <div className="text-[10px] font-body font-medium text-chrono-muted/60 uppercase tracking-wider">Example scenario</div>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { data: session, status } = useSession();
  const isLoggedIn = status !== "loading" && !!session;

  const handleGetStarted = () => {
    if (isLoggedIn) {
      window.location.href = "/timeline";
    } else {
      signIn("google", { callbackUrl: "/timeline" });
    }
  };

  return (
    <section className="relative py-[80px] md:py-[160px] px-6">
      <FadeUp className="relative max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-6xl font-display font-semibold tracking-tight mb-8 text-chrono-text">
          Ready to map
          <br />
          <em>your story?</em>
        </h2>
        <p className="text-base font-body font-normal max-w-md mx-auto mb-14 leading-relaxed text-chrono-muted">
          Transform your memories into a beautiful, interactive timeline.
        </p>

        <div className="relative z-50 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleGetStarted}
            className="group relative inline-flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-xl px-10 py-4 text-base font-body font-medium tracking-wide transition-all duration-300 bg-chrono-accent text-white hover:opacity-90 active:scale-[0.98] shadow-[0_2px_12px_rgba(74,107,82,0.25)]"
          >
            Get Started
          </button>
          <a
            href="/insights"
            className="px-6 py-3 md:px-10 md:py-4 text-chrono-text hover:text-foreground border border-[var(--line-strong)] hover:border-[var(--line-hover)] rounded-xl transition-all duration-300 text-sm font-body font-medium inline-block cursor-pointer"
          >
            See a Demo
          </a>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1 }}
          className="flex items-center justify-center gap-8 mt-14 text-xs font-body font-medium text-chrono-muted"
        >
          <span>Free to start</span>
          <span className="w-px h-3 bg-[var(--line)]" />
          <span>No credit card</span>
          <span className="w-px h-3 bg-[var(--line)]" />
          <span>Your data stays private</span>
        </motion.div>
      </FadeUp>
    </section>
  );
}

export default function Home() {
  const { events: userEvents } = useEvents();
  const { stories: userStories } = useStories();

  return (
    <>
      <LoadingScreen />

      <HeroSection />
      <OnThisDayWidget events={userEvents} />
      <MarqueeTicker />
      <HowItWorksSection />
      <PlayYourStorySection events={userEvents} />
      <MarqueeTicker />
      <FeaturesSection />
      <TimelinePreview events={userEvents} />
      <MarqueeTicker />
      <MapPreview events={userEvents} />
      <StoriesPreview stories={userStories} />
      <UseCasesSection />
      <CTASection />
    </>
  );
}
