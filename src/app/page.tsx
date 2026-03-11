"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { demoEvents, demoStories, getEventsByYear } from "@/data/demo";
import TimelineCard from "@/components/timeline/TimelineCard";
import AIStorySummary from "@/components/timeline/AIStorySummary";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import ParticleField from "@/components/three/ParticleField";
import MarqueeTicker from "@/components/ui/MarqueeTicker";
import LoadingScreen from "@/components/ui/LoadingScreen";

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const HERO_WORDS = ["beautifully", "elegantly", "perfectly", "intimately", "vividly", "honestly", "timelessly"];

function AnimatedWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block relative overflow-hidden align-bottom" style={{ height: "1.15em", width: "auto" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={HERO_WORDS[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block italic"
          style={{ fontSize: "1.35em", lineHeight: "0.85" }}
        >
          {HERO_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.97]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: "#080808" }}>
      <ParticleField />

      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 1.5 }}
          className="section-label mb-8"
        >
          A Digital Life Archive
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold leading-[0.95] tracking-tight mb-10 text-white"
          style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}
        >
          <span className="block">Your life,</span>
          <span className="block mt-2">
            <AnimatedWord /> mapped
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.2 }}
          className="text-base md:text-lg font-body font-extralight max-w-lg mx-auto mb-16 leading-relaxed"
          style={{ color: "rgba(240,235,225,0.65)" }}
        >
          A visual timeline of your memories, milestones, and places.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/timeline">
            <button className="px-10 py-4 bg-white text-black rounded-full font-body font-light text-sm tracking-wide hover:bg-white/90 transition-colors duration-500">
              Get Started
            </button>
          </Link>
          <Link href="/insights">
            <button className="px-10 py-4 text-white/80 hover:text-white border border-white/[0.12] hover:border-white/30 rounded-full transition-all duration-500 text-sm font-body font-light tracking-wide">
              View Insights
            </button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1.5 }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-9 border border-white/[0.12] rounded-full flex justify-center pt-2"
          >
            <div className="w-0.5 h-1.5 bg-white/30 rounded-full" />
          </motion.div>
        </motion.div>
      </motion.div>
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
      description: "Chrono crafts personal narratives about your life chapters.",
    },
  ];

  return (
    <section className="relative py-[80px] md:py-[160px] px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-28">
          <span className="section-label mb-5 block">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white">
            Three steps to your
            <br />
            <em>life story</em>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {steps.map((step, i) => (
            <FadeUp key={step.number} delay={i * 0.15} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-4 left-[60%] right-[-40%] h-px bg-white/[0.06]" />
              )}

              <div className="text-[11px] font-body font-extralight mb-4 text-white/80 tracking-[0.3em]">
                {step.number}
              </div>
              <h3 className="text-lg font-display font-bold text-chrono-text mb-3">
                {step.title}
              </h3>
              <p className="text-sm font-body font-extralight leading-relaxed max-w-xs mx-auto" style={{ color: "rgba(240,235,225,0.65)" }}>
                {step.description}
              </p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlayYourStorySection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentYearIndex, setCurrentYearIndex] = useState(-1);
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);
  const [showEvent, setShowEvent] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const eventsByYear = getEventsByYear(demoEvents);
  const years = Object.keys(eventsByYear);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
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
        setTimeout(() => {
          setCurrentEventIndex((prev) => prev + 1);
          setShowEvent(true);
        }, 200);
      }, 1200);
      timerRef.current = t;
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setShowEvent(false);
      setTimeout(() => {
        setCurrentYearIndex((prev) => prev + 1);
        setCurrentEventIndex(-1);
      }, 300);
    }, 1200);
    timerRef.current = t;
    return () => clearTimeout(t);
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
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-5 text-white">
            Play your
            <br />
            <em>story</em>
          </h2>
          <p className="font-body font-extralight max-w-md mx-auto text-sm leading-relaxed" style={{ color: "rgba(240,235,225,0.65)" }}>
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
              className="group flex items-center gap-4 px-10 py-5 bg-chrono-card/30 border border-white/[0.08] rounded-full card-hover"
            >
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors duration-500">
                <svg className="w-5 h-5 text-white/60 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-base font-display font-bold text-chrono-text">Play Your Story</div>
                <div className="text-xs font-body font-extralight text-chrono-muted">{years[0]} — {years[years.length - 1]}</div>
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
                  <div className="text-7xl md:text-[8rem] font-display font-bold text-white leading-none">
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
                      <div className="text-lg md:text-xl font-display font-bold text-chrono-text mb-1">
                        {currentEvent.title}
                      </div>
                      {currentEvent.location && (
                        <div className="text-xs font-body font-extralight text-chrono-muted">
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
                    className={`h-[1px] transition-all duration-500 ${
                      i < currentYearIndex
                        ? "w-8 bg-white/30"
                        : i === currentYearIndex
                        ? "w-12 bg-white/60"
                        : "w-6 bg-white/10"
                    }`}
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
              <div className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Your story continues
              </div>
              <button
                onClick={play}
                className="mt-4 px-6 py-2.5 text-sm font-body font-light text-chrono-muted border border-white/[0.12] hover:border-white/30 hover:text-chrono-text rounded-full transition-all duration-500"
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
      href: "/timeline",
    },
    {
      title: "Stories",
      description: "Beautiful, emotional summaries of your life chapters. Narratives crafted from your real experiences.",
      href: "/insights",
    },
    {
      title: "Places",
      description: "See where your life happened on an animated map with pins for every memory.",
      href: "/map",
    },
    {
      title: "Insights",
      description: "Discover patterns in your life — most active years, favorite cities, biggest milestones.",
      href: "/insights",
    },
  ];

  return (
    <section className="relative py-[80px] md:py-[160px] px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-28">
          <span className="section-label mb-5 block">Features</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white">
            Everything you need to
            <br />
            <em>relive your story</em>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-white/[0.08]">
          {features.map((feature, i) => (
            <FadeUp key={feature.title} delay={i * 0.1}>
              <Link href={feature.href}>
                <div className="group bg-chrono-bg p-10 card-hover h-full cursor-pointer">
                  <h3 className="text-lg font-display font-bold mb-3 text-chrono-text tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm font-body font-extralight leading-relaxed" style={{ color: "rgba(240,235,225,0.65)" }}>
                    {feature.description}
                  </p>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelinePreview() {
  const previewEvents = demoEvents.slice(0, 3);

  return (
    <section className="relative py-[80px] md:py-[160px] px-6">
      <div className="relative max-w-6xl mx-auto">
        <span className="watermark right-0 top-0">Timeline</span>

        <FadeUp className="text-center mb-24">
          <span className="section-label mb-5 block">Chapters of Your Life</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-5 text-white">
            Your life <em>in motion</em>
          </h2>
          <p className="font-body font-extralight max-w-md mx-auto text-sm leading-relaxed" style={{ color: "rgba(240,235,225,0.65)" }}>
            Every event becomes a card on your personal timeline
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {previewEvents.map((event, i) => (
            <TimelineCard key={event.id} event={event} index={i} />
          ))}
        </div>

        <FadeUp className="text-center">
          <Link href="/timeline">
            <button className="px-10 py-4 text-sm font-body font-light text-white/80 border border-white/[0.12] hover:border-white/30 hover:text-white rounded-full transition-all duration-500">
              Explore Full Timeline
            </button>
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}

function MapPreview() {
  const locations = [
    { name: "Boulder, CO", count: 7, x: 28, y: 38 },
    { name: "San Francisco", count: 3, x: 15, y: 40 },
    { name: "New York", count: 1, x: 78, y: 36 },
    { name: "Seattle", count: 2, x: 16, y: 28 },
    { name: "Denver", count: 1, x: 30, y: 40 },
  ];

  return (
    <section className="relative py-[80px] md:py-[160px] px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-24">
          <span className="section-label mb-5 block">A Record of Where You&apos;ve Been</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-5 text-white">
            See where your
            <br />
            <em>story happened</em>
          </h2>
          <p className="font-body font-extralight max-w-md mx-auto text-sm leading-relaxed" style={{ color: "rgba(240,235,225,0.65)" }}>
            Every memory pinned to the places that matter most
          </p>
        </FadeUp>

        <FadeUp>
          <div className="relative bg-chrono-card/20 p-10 border border-white/[0.12] overflow-hidden">
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
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.12)",
                          border: "1.5px solid rgba(255,255,255,0.8)",
                          boxShadow: "0 0 20px rgba(255,255,255,0.4)",
                        }}
                      />
                      <div className="absolute inset-[-4px] rounded-full border border-white/20 animate-white-pulse" />
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-[rgba(5,5,5,0.95)] border border-white/[0.12] opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                      <p className="text-[10px] font-body font-extralight text-chrono-text">{loc.name}</p>
                      <p className="text-[9px] font-body font-extralight text-chrono-muted">{loc.count} events</p>
                    </div>
                  </motion.div>
                ))}

                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                  <motion.line
                    x1="28%" y1="38%" x2="15%" y2="40%"
                    stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"
                    initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }} transition={{ delay: 0.5, duration: 1.5 }}
                  />
                  <motion.line
                    x1="28%" y1="38%" x2="78%" y2="36%"
                    stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"
                    initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }} transition={{ delay: 0.7, duration: 1.5 }}
                  />
                  <motion.line
                    x1="15%" y1="40%" x2="16%" y2="28%"
                    stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"
                    initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }} transition={{ delay: 0.6, duration: 1.5 }}
                  />
                  <motion.line
                    x1="28%" y1="38%" x2="30%" y2="40%"
                    stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"
                    initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }} transition={{ delay: 0.8, duration: 1.5 }}
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-white/[0.06]">
              <div className="text-center">
                <div className="text-lg font-display font-bold text-chrono-text">7</div>
                <div className="text-[10px] font-body font-extralight text-chrono-muted uppercase tracking-[0.15em]">Cities</div>
              </div>
              <div className="w-px h-8 bg-white/[0.08]" />
              <div className="text-center">
                <div className="text-lg font-display font-bold text-chrono-text">6</div>
                <div className="text-[10px] font-body font-extralight text-chrono-muted uppercase tracking-[0.15em]">States</div>
              </div>
              <div className="w-px h-8 bg-white/[0.08]" />
              <div className="text-center">
                <div className="text-lg font-display font-bold text-chrono-text">16</div>
                <div className="text-[10px] font-body font-extralight text-chrono-muted uppercase tracking-[0.15em]">Memories</div>
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp className="text-center mt-14">
          <Link href="/map">
            <button className="px-10 py-4 text-sm font-body font-light text-white/80 border border-white/[0.12] hover:border-white/30 hover:text-white rounded-full transition-all duration-500">
              Explore Life Map
            </button>
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}

function StoriesPreview() {
  return (
    <section className="relative py-[80px] md:py-[160px] px-6">
      <div className="max-w-4xl mx-auto">
        <FadeUp className="text-center mb-24">
          <span className="section-label mb-5 block">Patterns in Your Story</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-5 text-white">
            Narratives written about
            <br />
            <em>your life</em>
          </h2>
          <p className="font-body font-extralight max-w-md mx-auto text-sm leading-relaxed" style={{ color: "rgba(240,235,225,0.65)" }}>
            Emotional, personal narratives crafted about your journey
          </p>
        </FadeUp>

        <AIStorySummary story={demoStories[0]} index={0} />

        <FadeUp className="text-center mt-16">
          <Link href="/insights">
            <button className="px-10 py-4 text-sm font-body font-light text-white/80 border border-white/[0.12] hover:border-white/30 hover:text-white rounded-full transition-all duration-500">
              View All Stories
            </button>
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah K.",
      role: "Designer",
      quote: "Chrono turned three years of scattered photos and memories into the most beautiful timeline. I was moved reading my life story.",
    },
    {
      name: "Marcus T.",
      role: "Engineer",
      quote: "I never realized how much I accomplished until I saw it all laid out. The year-in-review feature is incredible.",
    },
    {
      name: "Aisha R.",
      role: "Student",
      quote: "Shared my college timeline with my parents and they were blown away. This is the future of digital memories.",
    },
  ];

  return (
    <section className="relative py-[80px] md:py-[160px] px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-24">
          <span className="section-label mb-5 block">Testimonials</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white">
            What people are <em>saying</em>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-white/[0.08]">
          {testimonials.map((t, i) => (
            <FadeUp key={t.name} delay={i * 0.12}>
              <div className="bg-chrono-bg p-10 h-full flex flex-col">
                <p className="text-lg font-display font-bold italic leading-relaxed mb-8 flex-1" style={{ color: "rgba(240,235,225,0.65)" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-body font-light border border-white/[0.12] text-white/80">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-body font-light text-chrono-text">{t.name}</div>
                    <div className="text-xs font-body font-extralight text-chrono-muted">{t.role}</div>
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
  return (
    <section className="relative py-[80px] md:py-[160px] px-6">
      <FadeUp className="relative max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-8 text-white">
          Ready to map
          <br />
          <em>your story?</em>
        </h2>
        <p className="text-base font-body font-extralight max-w-md mx-auto mb-14 leading-relaxed" style={{ color: "rgba(240,235,225,0.65)" }}>
          Transform your memories into a beautiful, interactive timeline.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/timeline">
            <button className="px-12 py-4 bg-white text-black rounded-full font-body font-light text-base hover:bg-white/90 transition-colors duration-500">
              Get Started
            </button>
          </Link>
          <Link href="/insights">
            <button className="px-10 py-4 text-white/80 hover:text-white border border-white/[0.12] hover:border-white/30 rounded-full transition-all duration-500 text-sm font-body font-light">
              See a Demo
            </button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1 }}
          className="flex items-center justify-center gap-8 mt-16 text-xs font-body font-extralight text-chrono-muted"
        >
          <span>Free to start</span>
          <span className="w-px h-3 bg-white/[0.1]" />
          <span>No credit card</span>
          <span className="w-px h-3 bg-white/[0.1]" />
          <span>Your data stays private</span>
        </motion.div>
      </FadeUp>
    </section>
  );
}

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("chrono-onboarding-complete");
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = (choice: "demo" | "manual" | "import") => {
    localStorage.setItem("chrono-onboarding-complete", "true");
    localStorage.setItem("chrono-start-mode", choice);
    setShowOnboarding(false);
  };

  return (
    <>
      <LoadingScreen />

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingWizard onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      <HeroSection />
      <MarqueeTicker />
      <HowItWorksSection />
      <PlayYourStorySection />
      <MarqueeTicker />
      <FeaturesSection />
      <TimelinePreview />
      <MarqueeTicker />
      <MapPreview />
      <StoriesPreview />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
