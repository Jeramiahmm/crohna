"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { demoEvents, demoStories } from "@/data/demo";
import TimelineCard from "@/components/timeline/TimelineCard";
import AIStorySummary from "@/components/timeline/AIStorySummary";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import ParticleField from "@/components/three/ParticleField";

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <ParticleField />
      <div className="absolute inset-0 bg-gradient-to-b from-chrono-bg/80 via-transparent to-chrono-bg z-[1]" />

      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-10"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-chrono-accent/60 animate-pulse-glow" />
          <span className="text-xs text-chrono-text-secondary tracking-wider uppercase">
            A new way to remember
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.92] tracking-tight mb-8"
        >
          <span className="block text-chrono-text">Your life,</span>
          <span className="block gradient-text mt-2">beautifully mapped.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="text-lg md:text-xl text-chrono-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Transform your memories into a stunning visual timeline.
          Stories, interactive maps, and cinematic experiences
          — all from your life events.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/timeline">
            <button className="px-8 py-4 bg-chrono-text text-chrono-bg rounded-full font-medium text-base hover:bg-chrono-accent transition-colors duration-300">
              Create Your Timeline
            </button>
          </Link>
          <Link href="/insights">
            <button className="px-8 py-4 text-chrono-text-secondary hover:text-chrono-text border border-chrono-border/50 hover:border-chrono-border rounded-full transition-all duration-300 text-base">
              View Insights
            </button>
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 1 }}
          className="mt-16 flex items-center justify-center gap-2"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-chrono-bg bg-chrono-card"
                style={{
                  background: `linear-gradient(135deg, ${
                    ["#D6CFC7", "#BFC3C7", "#7A8A96", "#9A9590"][i - 1]
                  }40, ${["#D6CFC7", "#BFC3C7", "#7A8A96", "#9A9590"][i - 1]}20)`,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-chrono-muted ml-1">
            Join 2,400+ people mapping their stories
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border border-chrono-border/40 flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-chrono-accent/40 rounded-full" />
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
      description: "Create events manually, import from Google Photos, or connect your calendar. Every moment matters.",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Watch your story unfold",
      description: "See your life organized beautifully by year on an interactive timeline with maps and insights.",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Discover your narrative",
      description: "Chrono generates personal, emotional stories about your life chapters. Share them with the world.",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative py-40 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-chrono-muted mb-4 block">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            Three steps to your
            <br />
            <span className="gradient-text">life story</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.8 }}
              className="relative text-center group"
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] right-[-40%] h-px bg-chrono-border/20" />
              )}

              <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-transform duration-500 group-hover:scale-105 bg-chrono-card/60 border border-chrono-border/30 text-chrono-accent">
                {step.icon}
              </div>
              <div className="text-xs font-display font-bold mb-2 text-chrono-muted">
                {step.number}
              </div>
              <h3 className="text-lg font-display font-semibold text-chrono-text mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-chrono-text-secondary leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      title: "Timeline",
      description: "Every moment organized chronologically. A living record of the events that shaped your story.",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      title: "Stories",
      description: "Beautiful, emotional summaries of your life chapters. Narratives crafted from your real experiences.",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
      ),
      title: "Places",
      description: "See where your life happened on a beautiful, animated map with pins for every memory.",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      title: "Insights",
      description: "Discover patterns in your life — most active years, favorite cities, biggest milestones.",
    },
  ];

  return (
    <section className="relative py-40 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-chrono-muted mb-4 block">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            Everything you need to
            <br />
            <span className="gradient-text">relive your story</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
              className="group relative bg-chrono-card/40 rounded-2xl p-8 border border-chrono-border/20 card-hover"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-chrono-border/20 flex items-center justify-center text-chrono-accent mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-display font-semibold mb-3 text-chrono-text">
                  {feature.title}
                </h3>
                <p className="text-sm text-chrono-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelinePreview() {
  const previewEvents = demoEvents.slice(0, 3);

  return (
    <section className="relative py-40 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-chrono-muted mb-4 block">
            Timeline
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
            Your life in motion
          </h2>
          <p className="text-chrono-text-secondary max-w-lg mx-auto">
            Every event becomes a beautifully crafted card on your personal timeline
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {previewEvents.map((event, i) => (
            <TimelineCard key={event.id} event={event} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/timeline">
            <button className="px-8 py-3 text-sm text-chrono-text-secondary border border-chrono-border/40 hover:border-chrono-border hover:text-chrono-text rounded-full transition-all duration-300">
              Explore Full Timeline
            </button>
          </Link>
        </motion.div>
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
    <section className="relative py-40 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-chrono-muted mb-4 block">
            Places
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
            See where your
            <br />
            <span className="gradient-text">story happened</span>
          </h2>
          <p className="text-chrono-text-secondary max-w-lg mx-auto">
            Every memory pinned to the places that matter most
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-chrono-card/30 rounded-3xl p-8 border border-chrono-border/20 overflow-hidden"
        >
          <div className="relative h-64 md:h-80 flex items-center justify-center">
            <div className="relative w-full h-full">
              {locations.map((loc, i) => (
                <motion.div
                  key={loc.name}
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 200 }}
                  className="absolute group cursor-pointer"
                  style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                >
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-chrono-accent/70" />
                    <div className="absolute inset-0 rounded-full bg-chrono-accent/30 animate-ping opacity-20" />
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg bg-chrono-card/90 border border-chrono-border/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <p className="text-[10px] text-chrono-text font-medium">{loc.name}</p>
                    <p className="text-[9px] text-chrono-muted">{loc.count} events</p>
                  </div>
                </motion.div>
              ))}

              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                <motion.line
                  x1="28%" y1="38%" x2="15%" y2="40%"
                  stroke="rgba(214,207,199,0.1)" strokeWidth="1"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }} transition={{ delay: 0.5, duration: 1.2 }}
                />
                <motion.line
                  x1="28%" y1="38%" x2="78%" y2="36%"
                  stroke="rgba(214,207,199,0.07)" strokeWidth="1"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }} transition={{ delay: 0.7, duration: 1.2 }}
                />
                <motion.line
                  x1="15%" y1="40%" x2="16%" y2="28%"
                  stroke="rgba(214,207,199,0.08)" strokeWidth="1"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }} transition={{ delay: 0.6, duration: 1.2 }}
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-chrono-border/15">
            <div className="text-center">
              <div className="text-lg font-display font-bold text-chrono-text">7</div>
              <div className="text-[10px] text-chrono-muted uppercase tracking-wider">Cities</div>
            </div>
            <div className="w-px h-8 bg-chrono-border/20" />
            <div className="text-center">
              <div className="text-lg font-display font-bold text-chrono-text">6</div>
              <div className="text-[10px] text-chrono-muted uppercase tracking-wider">States</div>
            </div>
            <div className="w-px h-8 bg-chrono-border/20" />
            <div className="text-center">
              <div className="text-lg font-display font-bold text-chrono-text">16</div>
              <div className="text-[10px] text-chrono-muted uppercase tracking-wider">Memories</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link href="/map">
            <button className="px-8 py-3 text-sm text-chrono-text-secondary border border-chrono-border/40 hover:border-chrono-border hover:text-chrono-text rounded-full transition-all duration-300">
              Explore Life Map
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function StoriesPreview() {
  return (
    <section className="relative py-40 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-chrono-muted mb-4 block">
            Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
            Narratives written about
            <br />
            <span className="gradient-text">your life</span>
          </h2>
          <p className="text-chrono-text-secondary max-w-lg mx-auto">
            Chrono crafts emotional, personal narratives about your journey
          </p>
        </motion.div>

        <AIStorySummary story={demoStories[0]} index={0} />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link href="/insights">
            <button className="px-8 py-3 text-sm text-chrono-text-secondary border border-chrono-border/40 hover:border-chrono-border hover:text-chrono-text rounded-full transition-all duration-300">
              View All Insights
            </button>
          </Link>
        </motion.div>
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
      quote: "I never realized how much I accomplished until Chrono showed me. The year-in-review feature is incredible.",
    },
    {
      name: "Aisha R.",
      role: "Student",
      quote: "Shared my college timeline with my parents and they were blown away. This is the future of digital memories.",
    },
  ];

  return (
    <section className="relative py-40 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-chrono-muted mb-4 block">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            What people are saying
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
              className="bg-chrono-card/40 rounded-2xl p-8 border border-chrono-border/20"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium bg-chrono-border/30 text-chrono-text">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-chrono-text">{t.name}</div>
                  <div className="text-xs text-chrono-muted">{t.role}</div>
                </div>
              </div>
              <p className="text-sm text-chrono-text-secondary leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative py-40 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative max-w-4xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-8">
          Ready to map
          <br />
          <span className="gradient-text">your story?</span>
        </h2>
        <p className="text-lg text-chrono-text-secondary max-w-xl mx-auto mb-12">
          Join thousands of people who have already transformed their memories
          into beautiful, interactive timelines.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/timeline">
            <button className="px-10 py-5 bg-chrono-text text-chrono-bg rounded-full font-medium text-lg hover:bg-chrono-accent transition-colors duration-300">
              Get Started Free
            </button>
          </Link>
          <Link href="/insights">
            <button className="px-8 py-4 text-chrono-text-secondary hover:text-chrono-text border border-chrono-border/50 hover:border-chrono-border rounded-full transition-all duration-300">
              See a Demo
            </button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-8 mt-14 text-xs text-chrono-muted"
        >
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-chrono-accent" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Free to start
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-chrono-accent" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            No credit card
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-chrono-accent" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Your data stays private
          </span>
        </motion.div>
      </motion.div>
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
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingWizard onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TimelinePreview />
      <MapPreview />
      <StoriesPreview />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
