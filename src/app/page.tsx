"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import {
  Clock,
  MapPin,
  BookOpen,
  BarChart3,
  Sparkles,
  Shield,
  Zap,
  Camera,
  Calendar,
  Globe,
  Layers,
  TrendingUp,
  ArrowRight,
  Play,
  ChevronRight,
} from "lucide-react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import GradientBlob from "@/components/ui/GradientBlob";

/* ─── Shared animation wrapper ─── */
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

/* ─── Animated hero word swap ─── */
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

/* ─── Hero CTA buttons ─── */
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
        className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-body font-medium tracking-wide transition-all duration-300 bg-chrono-accent text-white hover:opacity-90 active:scale-[0.98] shadow-[0_2px_16px_rgba(61,90,68,0.3)]"
      >
        Get Started
        <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
      </button>
      <Link
        href="/insights"
        className="px-8 py-3.5 text-chrono-text/70 hover:text-chrono-text border border-chrono-text/15 hover:border-chrono-text/30 rounded-xl transition-all duration-300 text-sm font-body font-medium inline-block cursor-pointer"
      >
        View Insights
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. HERO SECTION — Clean, minimal, Wispr Flow-inspired
   ───────────────────────────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
      <GradientBlob color="sage" size="lg" className="-top-40 -right-40 opacity-40" />
      <GradientBlob color="lavender" size="md" className="bottom-20 -left-40 opacity-20" />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Platform badges — like Wispr Flow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          {[
            { icon: Globe, label: "Web" },
            { icon: Camera, label: "Photos" },
            { icon: Calendar, label: "Calendar" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-chrono-surface border border-[var(--line)] text-xs font-body font-medium text-chrono-muted"
            >
              <Icon size={13} strokeWidth={1.8} />
              {label}
            </span>
          ))}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-display tracking-tight text-chrono-text"
          style={{ fontSize: "clamp(3.5rem, 10vw, 7.5rem)", lineHeight: 1.05, fontWeight: 400 }}
        >
          <span className="block">Your life,</span>
          <span className="block">
            <AnimatedWord />{" "}
            <span className="font-bold">mapped</span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.2 }}
          className="text-lg md:text-xl font-body font-normal max-w-lg mx-auto leading-relaxed text-chrono-text/60 mt-8"
        >
          The visual timeline that turns memories
          <br className="hidden sm:block" />
          into clear, beautiful stories.
        </motion.p>

        <HeroButtons />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="mt-6 text-sm font-body text-chrono-text/40"
        >
          Free to start. No credit card required.
        </motion.p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. TRUST / SOCIAL PROOF MARQUEE — Like Wispr Flow's company logos
   ───────────────────────────────────────────────────────────────────────────── */
function TrustMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let raf: number;
    let x = 0;
    const speed = 0.3;

    const animate = () => {
      if (!trackRef.current) return;
      x -= speed;
      const half = trackRef.current.scrollWidth / 2;
      if (Math.abs(x) >= half) x += half;
      trackRef.current.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const phrases = [
    "memories",
    "milestones",
    "places",
    "stories",
    "chapters",
    "your journey",
    "beautifully mapped",
    "adventures",
    "reflections",
    "growth",
  ];

  return (
    <div className="w-full overflow-hidden py-8 border-y border-[var(--line)] bg-chrono-surface/40">
      <div ref={trackRef} className="flex whitespace-nowrap will-change-transform">
        {Array.from({ length: 4 }).map((_, setIdx) => (
          <div key={setIdx} className="flex items-center">
            {phrases.map((phrase) => (
              <span key={`${setIdx}-${phrase}`} className="flex items-center mx-6">
                <span className="w-1.5 h-1.5 rounded-full bg-chrono-accent/30 mr-6" />
                <span className="font-display italic text-sm tracking-widest text-chrono-text/25 uppercase">
                  {phrase}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. BOLD STAT — Like Wispr Flow's "4x faster than typing"
   ───────────────────────────────────────────────────────────────────────────── */
function BoldStatSection() {
  return (
    <section className="relative py-[100px] md:py-[160px] px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        <FadeUp>
          <h2
            className="font-display tracking-tight text-chrono-text mb-8"
            style={{ fontSize: "clamp(2.8rem, 8vw, 6rem)", lineHeight: 1.1, fontWeight: 400 }}
          >
            <span className="relative">
              <span className="text-chrono-accent italic">Every moment</span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-chrono-accent/20" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M0 8 Q50 0 100 8 Q150 16 200 8" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
            </span>
            {" "}deserves
            <br />
            a beautiful canvas
          </h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className="text-base md:text-lg font-body font-normal max-w-xl mx-auto leading-relaxed text-chrono-text/50 mb-16">
            Voice that finally works is here for your memories. Crohna lets you capture, organize,
            and relive at the speed of thought — turning scattered moments into a cohesive life story.
          </p>
        </FadeUp>

        <FadeUp delay={0.2}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              href="/timeline"
              className="group inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-chrono-accent text-white text-sm font-body font-medium hover:opacity-90 transition-all duration-300 shadow-[0_2px_16px_rgba(61,90,68,0.2)]"
            >
              <Play size={14} fill="currentColor" />
              Try Crohna
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl border border-chrono-text/15 text-chrono-text/70 hover:text-chrono-text hover:border-chrono-text/30 text-sm font-body font-medium transition-all duration-300"
            >
              Explore the Map
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. FEATURES GRID — Icon-based cards like Wispr Flow
   ───────────────────────────────────────────────────────────────────────────── */
function FeaturesSection() {
  const features = [
    {
      icon: Clock,
      title: "Timeline",
      description: "Every moment organized chronologically. A living record of the events that shaped your story.",
      accent: "bg-emerald-500/10 text-emerald-600",
    },
    {
      icon: BookOpen,
      title: "AI Stories",
      description: "Beautiful, emotional summaries of your life chapters. Narratives crafted from your real experiences.",
      accent: "bg-violet-500/10 text-violet-600",
    },
    {
      icon: MapPin,
      title: "Life Map",
      description: "See where your life happened on an interactive map with pins for every memory you've created.",
      accent: "bg-amber-500/10 text-amber-600",
    },
    {
      icon: BarChart3,
      title: "Insights",
      description: "Discover patterns in your life — most active years, favorite cities, biggest milestones.",
      accent: "bg-blue-500/10 text-blue-600",
    },
  ];

  return (
    <section className="relative py-[80px] md:py-[140px] px-6 overflow-hidden bg-chrono-surface/50">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--line)] to-transparent" />

      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-16">
          <span className="section-label mb-5 block">Features</span>
          <h2 className="text-4xl md:text-6xl font-display tracking-tight text-chrono-text">
            Everything you need to
            <br />
            <em>relive your story</em>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((feature, i) => (
            <FadeUp key={feature.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="group bg-[var(--card-bg)] rounded-2xl border border-[var(--line)] hover:border-chrono-accent/30 hover:shadow-[0_8px_32px_rgba(61,90,68,0.08)] transition-shadow duration-500 h-full p-8 md:p-10"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.accent} flex items-center justify-center mb-6`}>
                  <feature.icon size={22} strokeWidth={1.8} />
                </div>
                <h3 className="text-2xl md:text-3xl font-display mt-1 mb-4 text-chrono-text tracking-tight" style={{ fontWeight: 500 }}>
                  {feature.title}
                </h3>
                <p className="text-base font-body font-normal leading-relaxed text-chrono-text/55">
                  {feature.description}
                </p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   5. HOW IT WORKS — Dark section with icon steps
   ───────────────────────────────────────────────────────────────────────────── */
function HowItWorksSection() {
  const steps = [
    {
      icon: Camera,
      number: "01",
      title: "Add your memories",
      description: "Import from photos, connect your calendar, or add events manually. It all starts with your moments.",
    },
    {
      icon: Layers,
      number: "02",
      title: "Watch your story unfold",
      description: "See your life organized chronologically with maps, chapters, and interactive insights.",
    },
    {
      icon: Sparkles,
      number: "03",
      title: "Discover your narrative",
      description: "Crohna crafts personal narratives about your life chapters using AI that understands your journey.",
    },
  ];

  return (
    <section className="relative py-[100px] md:py-[180px] px-6 overflow-hidden bg-[#1A2B1F] text-white">
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-900/30 via-green-900/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-emerald-900/20 via-teal-900/10 to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        <FadeUp className="text-center mb-20">
          <span className="text-[13px] tracking-[0.12em] uppercase text-emerald-400/80 font-body font-medium mb-5 block">How It Works</span>
          <h2 className="text-4xl md:text-6xl font-display tracking-tight text-white">
            Three steps to your
            <br />
            <em className="text-emerald-300/90">life story</em>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, i) => (
            <FadeUp key={step.number} delay={i * 0.15} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] right-[-40%] h-px bg-white/10" />
              )}

              <div className="w-16 h-16 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-6">
                <step.icon size={24} strokeWidth={1.5} className="text-emerald-300" />
              </div>
              <span className="text-xs font-body font-semibold text-emerald-400/40 tracking-widest uppercase mb-3 block">
                Step {step.number}
              </span>
              <h3 className="text-xl md:text-2xl font-display text-white mb-3" style={{ fontWeight: 400 }}>
                {step.title}
              </h3>
              <p className="text-sm font-body font-normal leading-relaxed max-w-xs mx-auto text-white/50">
                {step.description}
              </p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   6. PRODUCT SHOWCASE — Abstract mockup with stats, no stock photos
   ───────────────────────────────────────────────────────────────────────────── */
function ShowcaseSection() {
  return (
    <section className="relative py-[100px] md:py-[180px] px-6 overflow-hidden bg-[#1A2B1F] text-white">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="relative max-w-5xl mx-auto text-center">
        <FadeUp>
          <span className="text-[13px] tracking-[0.12em] uppercase text-emerald-400/80 font-body font-medium mb-5 block">Built Different</span>
          <h2
            className="font-display tracking-tight text-white mb-8"
            style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", lineHeight: 1.1, fontWeight: 400 }}
          >
            Not just another
            <br />
            <em className="text-emerald-300/90">journaling app</em>
          </h2>
          <p className="text-base md:text-lg font-body font-normal max-w-lg mx-auto leading-relaxed text-white/50 mb-16">
            Crohna is a living canvas for your entire life. Every memory becomes
            part of a beautiful, interactive narrative you can explore, share, and relive.
          </p>
        </FadeUp>

        {/* Abstract product mockup — no stock photos */}
        <FadeUp delay={0.15}>
          <div className="relative mb-16 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 md:p-12">
            <div className="grid grid-cols-3 gap-4 md:gap-6 mb-8">
              {/* Fake timeline cards */}
              {[
                { month: "Jan", title: "Started new chapter", cat: "Life" },
                { month: "Mar", title: "Explored new cities", cat: "Travel" },
                { month: "Jun", title: "Reached a milestone", cat: "Career" },
              ].map((card, i) => (
                <motion.div
                  key={card.month}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.6 }}
                  className="bg-white/5 rounded-xl border border-white/10 p-4 md:p-6 text-left"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-400/15 flex items-center justify-center">
                      <Clock size={14} className="text-emerald-300" />
                    </div>
                    <span className="text-[11px] font-body font-medium text-white/40 uppercase tracking-wider">{card.month}</span>
                  </div>
                  <div className="text-sm font-display text-white/80 mb-1">{card.title}</div>
                  <span className="text-[10px] font-body text-emerald-400/60 uppercase tracking-wider">{card.cat}</span>
                </motion.div>
              ))}
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center">
                  <Sparkles size={12} className="text-emerald-300" />
                </div>
                <span className="text-xs font-body text-white/50">Your timeline, visualized</span>
              </div>
              <ChevronRight size={14} className="text-white/30" />
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.25}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/10">
            {[
              { value: "\u221E", label: "Memories", icon: Camera },
              { value: "AI", label: "Narratives", icon: Sparkles },
              { value: "360\u00B0", label: "Life Map", icon: Globe },
              { value: "24/7", label: "Your Data", icon: Shield },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#1A2B1F] px-6 py-10 md:py-14 flex flex-col items-center"
              >
                <stat.icon size={20} strokeWidth={1.5} className="text-emerald-400/40 mb-3" />
                <div className="text-3xl md:text-4xl font-display text-emerald-300/90 mb-2" style={{ fontWeight: 500 }}>
                  {stat.value}
                </div>
                <div className="text-[11px] font-body font-semibold text-white/45 uppercase tracking-[0.15em]">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   7. USE CASES — Clean icon cards, no stock photos
   ───────────────────────────────────────────────────────────────────────────── */
function UseCasesSection() {
  const useCases = [
    {
      icon: TrendingUp,
      persona: "The Professional",
      scenario: "Map career growth, projects, and milestones into a year-in-review that reveals just how much was accomplished.",
      accent: "bg-blue-500/10 text-blue-500",
    },
    {
      icon: Globe,
      persona: "The Explorer",
      scenario: "Turn scattered travel photos and memories into a cohesive, visual timeline of adventures around the world.",
      accent: "bg-emerald-500/10 text-emerald-500",
    },
    {
      icon: BookOpen,
      persona: "The Student",
      scenario: "Build a college timeline to share with family — every semester, study abroad trip, and graduation milestone in one place.",
      accent: "bg-violet-500/10 text-violet-500",
    },
  ];

  return (
    <section className="relative py-[80px] md:py-[160px] px-6 bg-chrono-surface/50">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--line)] to-transparent" />
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-16">
          <span className="section-label mb-5 block">Use Cases</span>
          <h2 className="text-4xl md:text-6xl font-display tracking-tight text-chrono-text">
            How people use <em>Crohna</em>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {useCases.map((uc, i) => (
            <FadeUp key={uc.persona} delay={i * 0.12}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[var(--card-bg)] rounded-2xl border border-[var(--line)] hover:border-chrono-accent/30 hover:shadow-[0_8px_32px_rgba(61,90,68,0.08)] transition-shadow duration-500 h-full flex flex-col p-6 sm:p-8"
              >
                <div className={`w-12 h-12 rounded-xl ${uc.accent} flex items-center justify-center mb-6`}>
                  <uc.icon size={22} strokeWidth={1.8} />
                </div>
                <h3 className="text-lg font-display font-medium text-chrono-text mb-3">{uc.persona}</h3>
                <p className="text-sm font-body font-normal leading-relaxed flex-1 text-chrono-text/55">
                  {uc.scenario}
                </p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   8. CAPABILITIES STRIP — Compact feature badges
   ───────────────────────────────────────────────────────────────────────────── */
function CapabilitiesStrip() {
  const caps = [
    { icon: Camera, label: "Google Photos Import" },
    { icon: Calendar, label: "Calendar Sync" },
    { icon: Sparkles, label: "AI Narratives" },
    { icon: MapPin, label: "Interactive Map" },
    { icon: Shield, label: "Privacy First" },
    { icon: Zap, label: "Instant Setup" },
  ];

  return (
    <section className="relative py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-10">
          <span className="section-label block">Capabilities</span>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {caps.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--line)] text-sm font-body font-medium text-chrono-text/70"
              >
                <Icon size={16} strokeWidth={1.8} className="text-chrono-accent" />
                {label}
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   9. CTA SECTION — Final call to action
   ───────────────────────────────────────────────────────────────────────────── */
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
    <section className="relative py-[100px] md:py-[200px] px-6 overflow-hidden bg-[#1A2B1F] text-white">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent pointer-events-none" />

      <FadeUp className="relative max-w-3xl mx-auto text-center">
        <h2
          className="font-display tracking-tight mb-8 text-white"
          style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)", lineHeight: 1.05, fontWeight: 400 }}
        >
          Ready to map
          <br />
          <em className="text-emerald-300/90">your story?</em>
        </h2>
        <p className="text-lg font-body font-normal max-w-md mx-auto mb-14 leading-relaxed text-white/50">
          Transform your memories into a beautiful, interactive timeline.
        </p>

        <div className="relative z-50 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleGetStarted}
            className="group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl px-10 py-4 text-base font-body font-medium tracking-wide transition-all duration-300 bg-emerald-400 text-[#1A2B1F] hover:bg-emerald-300 active:scale-[0.98] shadow-[0_2px_20px_rgba(110,231,183,0.2)]"
          >
            Get Started
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
          <Link
            href="/insights"
            className="px-6 py-3 md:px-10 md:py-4 text-white/70 hover:text-white border border-white/15 hover:border-white/30 rounded-xl transition-all duration-300 text-sm font-body font-medium inline-block cursor-pointer"
          >
            See a Demo
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1 }}
          className="flex items-center justify-center gap-8 mt-14 text-xs font-body font-medium text-white/35"
        >
          <span className="flex items-center gap-1.5"><Zap size={12} /> Free to start</span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1.5"><Shield size={12} /> No credit card</span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1.5"><Shield size={12} /> Your data stays private</span>
        </motion.div>
      </FadeUp>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE EXPORT
   ───────────────────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      <LoadingScreen />
      <HeroSection />
      <TrustMarquee />
      <BoldStatSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ShowcaseSection />
      <CapabilitiesStrip />
      <UseCasesSection />
      <CTASection />
    </>
  );
}
