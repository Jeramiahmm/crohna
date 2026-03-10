"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { demoEvents, demoStories } from "@/data/demo";
import TimelineCard from "@/components/timeline/TimelineCard";
import AIStorySummary from "@/components/timeline/AIStorySummary";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

const ParticleField = dynamic(() => import("@/components/three/ParticleField"), {
  ssr: false,
});

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
      <div className="absolute inset-0 bg-gradient-radial from-chrono-accent/5 via-transparent to-transparent z-[1]" />

      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-chrono-accent animate-pulse-glow" />
          <span className="text-xs text-chrono-text-secondary tracking-wider uppercase">
            AI-Powered Life Timeline
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.95] mb-6"
        >
          <span className="block">Your life.</span>
          <span className="block gradient-text mt-2">Beautifully mapped.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-lg md:text-xl text-chrono-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Transform your memories into a stunning visual timeline.
          AI-generated stories, interactive maps, and cinematic experiences
          — all from your life events.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/timeline">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-chrono-accent to-chrono-accent-warm text-white rounded-full font-medium text-base overflow-hidden transition-all hover:shadow-lg hover:shadow-chrono-accent/20">
              <span className="relative z-10">Create Your Timeline</span>
              <div className="absolute inset-0 bg-gradient-to-r from-chrono-accent-warm to-chrono-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </Link>
          <Link href="/insights">
            <button className="px-8 py-4 text-chrono-text-secondary hover:text-chrono-text border border-chrono-border/50 hover:border-chrono-border rounded-full transition-all text-base">
              View AI Insights
            </button>
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-12 flex items-center justify-center gap-2"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-chrono-bg"
                style={{
                  background: `linear-gradient(135deg, ${
                    ["#a78bfa", "#f9a8d4", "#67e8f9", "#fbbf24"][i - 1]
                  }, ${["#c4b5fd", "#fbcfe8", "#a5f3fc", "#fde68a"][i - 1]})`,
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
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border border-chrono-border/50 flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-chrono-accent/60 rounded-full" />
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
      color: "#a78bfa",
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
      color: "#f9a8d4",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Discover your narrative",
      description: "AI generates personal, emotional stories about your life chapters. Share them with the world.",
      color: "#67e8f9",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative py-32 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-chrono-accent/[0.02] to-transparent" />
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-xs uppercase tracking-widest text-chrono-accent mb-4 block">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Three steps to your
            <br />
            <span className="gradient-text">life story</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7 }}
              className="relative text-center group"
            >
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] right-[-40%] h-px bg-gradient-to-r from-chrono-border/40 to-transparent" />
              )}

              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundColor: `${step.color}12`, color: step.color }}
              >
                {step.icon}
              </div>
              <div className="text-xs font-display font-bold mb-2" style={{ color: step.color }}>
                {step.number}
              </div>
              <h3 className="text-lg font-display font-semibold text-chrono-text mb-2">
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
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      title: "Smart Detection",
      description: "Automatically detects life events from Google Calendar, Photos, emails, and location history.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      ),
      title: "AI Life Stories",
      description: "Generate beautiful, emotional summaries of your life chapters powered by artificial intelligence.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
      ),
      title: "Interactive Map",
      description: "See where your life happened on a beautiful, animated map with pins for every memory.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      title: "Deep Insights",
      description: "Discover patterns in your life — most active years, favorite cities, biggest milestones.",
    },
  ];

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-xs uppercase tracking-widest text-chrono-accent mb-4 block">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
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
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group relative bg-chrono-card/40 rounded-2xl p-8 border border-chrono-border/30 card-hover overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-chrono-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-chrono-accent/10 flex items-center justify-center text-chrono-accent mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-display font-semibold mb-2 text-chrono-text">
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
    <section className="relative py-32 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-chrono-accent/[0.02] to-transparent" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-chrono-accent-warm mb-4 block">
            Timeline
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Your life in motion
          </h2>
          <p className="text-chrono-text-secondary max-w-lg mx-auto">
            Every event becomes a beautifully crafted card on your personal timeline
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
            <button className="px-8 py-3 text-sm text-chrono-accent border border-chrono-accent/30 hover:bg-chrono-accent/10 rounded-full transition-all">
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
    <section className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-chrono-accent mb-4 block">
            Life Map
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            See where your
            <br />
            <span className="gradient-text">story happened</span>
          </h2>
          <p className="text-chrono-text-secondary max-w-lg mx-auto">
            Every memory pinned to the places that matter most
          </p>
        </motion.div>

        {/* Map preview card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-chrono-card/30 rounded-3xl p-8 border border-chrono-border/30 overflow-hidden"
        >
          <div className="relative h-64 md:h-80 flex items-center justify-center">
            {/* Simplified map visualization */}
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
                    <div className="w-3 h-3 rounded-full bg-chrono-accent" />
                    <div className="absolute inset-0 rounded-full bg-chrono-accent animate-ping opacity-20" />
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg bg-chrono-card/90 border border-chrono-border/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <p className="text-[10px] text-chrono-text font-medium">{loc.name}</p>
                    <p className="text-[9px] text-chrono-muted">{loc.count} events</p>
                  </div>
                </motion.div>
              ))}

              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                <motion.line
                  x1="28%" y1="38%" x2="15%" y2="40%"
                  stroke="rgba(167,139,250,0.15)" strokeWidth="1"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }} transition={{ delay: 0.5, duration: 1 }}
                />
                <motion.line
                  x1="28%" y1="38%" x2="78%" y2="36%"
                  stroke="rgba(167,139,250,0.1)" strokeWidth="1"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }} transition={{ delay: 0.7, duration: 1 }}
                />
                <motion.line
                  x1="15%" y1="40%" x2="16%" y2="28%"
                  stroke="rgba(167,139,250,0.12)" strokeWidth="1"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }} transition={{ delay: 0.6, duration: 1 }}
                />
              </svg>
            </div>
          </div>

          {/* Location stats */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-chrono-border/20">
            <div className="text-center">
              <div className="text-lg font-display font-bold text-chrono-text">7</div>
              <div className="text-[10px] text-chrono-muted uppercase tracking-wider">Cities</div>
            </div>
            <div className="w-px h-8 bg-chrono-border/30" />
            <div className="text-center">
              <div className="text-lg font-display font-bold text-chrono-text">6</div>
              <div className="text-[10px] text-chrono-muted uppercase tracking-wider">States</div>
            </div>
            <div className="w-px h-8 bg-chrono-border/30" />
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
          className="text-center mt-8"
        >
          <Link href="/map">
            <button className="px-8 py-3 text-sm text-chrono-accent border border-chrono-accent/30 hover:bg-chrono-accent/10 rounded-full transition-all">
              Explore Life Map
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function AIPreview() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-chrono-accent mb-4 block">
            AI Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Stories written about
            <br />
            <span className="gradient-text">your life</span>
          </h2>
          <p className="text-chrono-text-secondary max-w-lg mx-auto">
            AI analyzes your events and crafts emotional, personal narratives about your journey
          </p>
        </motion.div>

        <AIStorySummary story={demoStories[0]} index={0} />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/insights">
            <button className="px-8 py-3 text-sm text-chrono-accent border border-chrono-accent/30 hover:bg-chrono-accent/10 rounded-full transition-all">
              View All AI Insights
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
      quote: "Chrono turned three years of scattered photos and memories into the most beautiful timeline. I cried reading my AI life story.",
      color: "#a78bfa",
    },
    {
      name: "Marcus T.",
      role: "Engineer",
      quote: "I never realized how much I accomplished until Chrono showed me. The year-in-review feature is incredible.",
      color: "#f9a8d4",
    },
    {
      name: "Aisha R.",
      role: "Student",
      quote: "Shared my college timeline with my parents and they were blown away. This is the future of digital memories.",
      color: "#67e8f9",
    },
  ];

  return (
    <section className="relative py-32 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-chrono-accent/[0.02] to-transparent" />
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-chrono-accent-warm mb-4 block">
            Loved by Users
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold">
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
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="bg-chrono-card/40 rounded-2xl p-7 border border-chrono-border/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}80)` }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-chrono-text">{t.name}</div>
                  <div className="text-xs text-chrono-muted">{t.role}</div>
                </div>
              </div>
              <p className="text-sm text-chrono-text-secondary leading-relaxed italic">
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
    <section className="relative py-32 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-chrono-accent/[0.03] to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative max-w-4xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
          Ready to map
          <br />
          <span className="gradient-text">your story?</span>
        </h2>
        <p className="text-lg text-chrono-text-secondary max-w-xl mx-auto mb-10">
          Join thousands of people who have already transformed their memories
          into beautiful, interactive timelines.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/timeline">
            <button className="group relative px-10 py-5 bg-gradient-to-r from-chrono-accent to-chrono-accent-warm text-white rounded-full font-medium text-lg overflow-hidden transition-all hover:shadow-xl hover:shadow-chrono-accent/20">
              <span className="relative z-10">Get Started Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-chrono-accent-warm to-chrono-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </Link>
          <Link href="/insights">
            <button className="px-8 py-4 text-chrono-text-secondary hover:text-chrono-text border border-chrono-border/50 hover:border-chrono-border rounded-full transition-all">
              See a Demo
            </button>
          </Link>
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-8 mt-12 text-xs text-chrono-muted"
        >
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Free to start
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            No credit card
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
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
      <AIPreview />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
