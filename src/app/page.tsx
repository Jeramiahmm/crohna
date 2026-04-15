"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { Clock, MapPin, BookOpen, BarChart3, Layers, Shield, Zap, Camera, Calendar, Globe, ArrowRight, Play } from "lucide-react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import GradientBlob from "@/components/ui/GradientBlob";

const PHOTOS = [
  { src: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80", alt: "New York City" },
  { src: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&q=80", alt: "Los Angeles" },
  { src: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80", alt: "Golden Gate Bridge" },
  { src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80", alt: "Road trip" },
  { src: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80", alt: "Skiing in Vail" },
  { src: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800&q=80", alt: "San Francisco" },
];

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function SlideIn({ children, delay = 0, from = "left", className = "" }: { children: React.ReactNode; delay?: number; from?: "left" | "right"; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, x: from === "left" ? -60 : 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay, duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function ScaleIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end center"] });

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      setCount(Math.round(v * value));
    });
  }, [scrollYProgress, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const HERO_WORDS = ["beautifully", "elegantly"] as const;

function HeroSection() {
  const { data: session, status } = useSession();
  const [wordIdx, setWordIdx] = useState(0);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const t = setInterval(() => setWordIdx((i) => (i + 1) % HERO_WORDS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleCTA = () => {
    if (status !== "loading" && session) window.location.href = "/timeline";
    else signIn("google", { callbackUrl: "/timeline" });
  };

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <GradientBlob color="sage" size="lg" className="-top-40 -right-40 opacity-40" />
      <GradientBlob color="lavender" size="md" className="bottom-20 -left-40 opacity-20" />
      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }} className="flex items-center justify-center gap-3 mb-10">
          {[{ icon: Globe, label: "Web" }, { icon: Camera, label: "Photos" }, { icon: Calendar, label: "Calendar" }].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-chrono-surface border border-[var(--line)] text-xs font-body font-medium text-chrono-muted">
              <Icon size={13} strokeWidth={1.8} /> {label}
            </span>
          ))}
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="font-display tracking-tight text-chrono-text" style={{ fontSize: "clamp(3.5rem, 10vw, 7.5rem)", lineHeight: 1.05, fontWeight: 500 }}>
          <span className="block">Your life,</span>
          <span className="block">
            <span className="inline-block relative align-bottom overflow-visible" style={{ lineHeight: "inherit", paddingRight: "0.08em" }}>
              <span className="invisible italic">beautifully</span>
              <AnimatePresence mode="wait">
                <motion.span key={HERO_WORDS[wordIdx]} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 italic text-chrono-accent text-right" style={{ lineHeight: "inherit" }}>
                  {HERO_WORDS[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </span>{" "}
            <span className="font-black">mapped</span>
          </span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }} className="text-lg md:text-xl font-body max-w-lg mx-auto leading-relaxed text-chrono-text/60 mt-8">
          The visual timeline that turns memories into clear, beautiful stories.
        </motion.p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <button onClick={handleCTA} className="group inline-flex cursor-pointer items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-body font-medium bg-chrono-accent text-white hover:opacity-90 active:scale-[0.98] shadow-[0_2px_16px_rgba(61,90,68,0.3)] transition-all duration-300">
            Get Started <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          <Link href="/insights" className="px-8 py-3.5 text-chrono-text/70 hover:text-chrono-text border border-chrono-text/15 hover:border-chrono-text/30 rounded-xl transition-all text-sm font-body font-medium">
            View Insights
          </Link>
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mt-6 text-sm font-body text-chrono-text/40">Free to start. No credit card required.</motion.p>
      </motion.div>
    </section>
  );
}

function PhotoParallaxSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [80, -30]);

  return (
    <section ref={ref} className="relative py-20 md:py-32 px-6 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--line)] to-transparent" />
      <FadeUp className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-display tracking-tight text-chrono-text" style={{ fontWeight: 600 }}>
          <span className="italic text-chrono-accent">Every moment</span> deserves<br />a beautiful canvas
        </h2>
        <p className="text-base md:text-lg font-body text-chrono-text/55 mt-6 max-w-xl mx-auto leading-relaxed">
          Capture, organize, and relive — turning scattered moments into a cohesive life story.
        </p>
      </FadeUp>
      {/* Bento grid — organized, intentional layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-4 md:grid-cols-12 gap-3 md:gap-4 auto-rows-[160px] md:auto-rows-[200px]">
        <motion.div style={{ y: y1 }} whileHover={{ scale: 1.03 }} className="relative col-span-2 md:col-span-5 row-span-2 rounded-2xl overflow-hidden shadow-xl cursor-pointer group">
          <Image src={PHOTOS[0].src} alt={PHOTOS[0].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="40vw" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className="absolute bottom-4 left-4 text-white text-sm font-display font-semibold">{PHOTOS[0].alt}</span>
        </motion.div>
        <motion.div style={{ y: y2 }} whileHover={{ scale: 1.03 }} className="relative col-span-2 md:col-span-4 row-span-1 rounded-2xl overflow-hidden shadow-xl cursor-pointer group">
          <Image src={PHOTOS[1].src} alt={PHOTOS[1].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="33vw" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className="absolute bottom-4 left-4 text-white text-sm font-display font-semibold">{PHOTOS[1].alt}</span>
        </motion.div>
        <motion.div style={{ y: y1 }} whileHover={{ scale: 1.03 }} className="relative col-span-2 md:col-span-3 row-span-2 rounded-2xl overflow-hidden shadow-xl cursor-pointer group">
          <Image src={PHOTOS[2].src} alt={PHOTOS[2].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="25vw" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className="absolute bottom-4 left-4 text-white text-sm font-display font-semibold">{PHOTOS[2].alt}</span>
        </motion.div>
        <motion.div style={{ y: y2 }} whileHover={{ scale: 1.03 }} className="relative col-span-2 md:col-span-4 row-span-1 rounded-2xl overflow-hidden shadow-xl cursor-pointer group">
          <Image src={PHOTOS[3].src} alt={PHOTOS[3].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="33vw" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className="absolute bottom-4 left-4 text-white text-sm font-display font-semibold">{PHOTOS[3].alt}</span>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const xLeft = useTransform(scrollYProgress, [0, 1], [-30, 0]);
  const xRight = useTransform(scrollYProgress, [0, 1], [30, 0]);

  const features = [
    { icon: Clock, title: "Timeline", desc: "Every moment organized chronologically — a living record that grows with you.", photo: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80", gradient: "from-emerald-600 to-teal-700" },
    { icon: BookOpen, title: "Life Stories", desc: "Narratives crafted from your real experiences. Your story, told beautifully.", photo: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80", gradient: "from-violet-600 to-purple-700" },
    { icon: MapPin, title: "Life Map", desc: "See where your life happened — every pin is a memory on an interactive globe.", photo: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80", gradient: "from-amber-600 to-orange-700" },
    { icon: BarChart3, title: "Insights", desc: "Discover patterns you never saw — most active years, favorite places, milestones.", photo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80", gradient: "from-blue-600 to-indigo-700" },
  ];

  return (
    <section ref={ref} className="relative py-24 md:py-40 px-6 overflow-hidden bg-chrono-surface/30">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--line)] to-transparent" />
      <div className="max-w-6xl mx-auto">
        <FadeUp className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-display tracking-tight text-chrono-text" style={{ fontWeight: 700 }}>
            Everything you need
          </h2>
        </FadeUp>
        <div className="space-y-6">
          {features.map((f, i) => {
            const isEven = i % 2 === 0;
            return (
              <motion.div key={f.title} style={{ x: isEven ? xLeft : xRight }}>
                <FadeUp delay={i * 0.08}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={`group relative rounded-3xl overflow-hidden border border-[var(--line)] hover:border-chrono-accent/30 transition-all duration-500 ${isEven ? "md:flex-row" : "md:flex-row-reverse"} flex flex-col md:flex`}
                  >
                    {/* Photo side */}
                    <div className="relative w-full md:w-2/5 h-48 md:h-auto min-h-[240px] overflow-hidden">
                      <Image src={f.photo} alt={f.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="40vw" unoptimized />
                      <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-30 mix-blend-multiply`} />
                    </div>
                    {/* Content side */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-[var(--card-bg)]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.gradient} flex items-center justify-center`}>
                          <f.icon size={20} strokeWidth={2} className="text-white" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-display text-chrono-text tracking-tight" style={{ fontWeight: 700 }}>{f.title}</h3>
                      </div>
                      <p className="text-base md:text-lg font-body leading-relaxed text-chrono-text/60 max-w-md">{f.desc}</p>
                    </div>
                  </motion.div>
                </FadeUp>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const steps = [
    { icon: Camera, num: "01", title: "Add your memories", desc: "Import from photos, connect your calendar, or add events manually." },
    { icon: Layers, num: "02", title: "Watch your story unfold", desc: "See your life organized with maps, chapters, and interactive insights." },
    { icon: BookOpen, num: "03", title: "Discover your narrative", desc: "Personal narratives crafted from your life chapters — your story, told right." },
  ];
  return (
    <section ref={ref} className="relative py-24 md:py-44 px-6 overflow-hidden bg-[#1A2B1F] text-white">
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-900/30 to-transparent blur-3xl pointer-events-none" />
      <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <FadeUp>
            <span className="text-[13px] tracking-[0.12em] uppercase text-emerald-400/80 font-body font-medium mb-5 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-display tracking-tight text-white mb-12" style={{ fontWeight: 600 }}>Three steps to your <em className="text-emerald-300">life story</em></h2>
          </FadeUp>
          {steps.map((s, i) => (
            <SlideIn key={s.num} delay={i * 0.15} from="left">
              <div className="flex gap-5 mb-10 group">
                <motion.div whileHover={{ scale: 1.1, rotate: -5 }} className="w-14 h-14 rounded-2xl bg-emerald-400/15 border border-emerald-400/25 flex items-center justify-center shrink-0 transition-colors group-hover:bg-emerald-400/25">
                  <s.icon size={22} strokeWidth={1.8} className="text-emerald-300" />
                </motion.div>
                <div>
                  <span className="text-[11px] font-body font-bold text-emerald-400/50 tracking-widest uppercase">Step {s.num}</span>
                  <h3 className="text-xl font-display text-white mt-1 mb-1.5" style={{ fontWeight: 500 }}>{s.title}</h3>
                  <p className="text-sm font-body text-white/55 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </SlideIn>
          ))}
        </div>
        <motion.div style={{ y: imgY }} className="relative hidden md:block">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
              <Image src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80" alt="College memory" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl mt-12">
              <Image src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80" alt="Team celebration" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PhotoStripSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["-10%", "5%"]);

  const row1 = [
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80",
    "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=600&q=80",
    "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
    "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=600&q=80",
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&q=80",
  ];
  const row2 = [
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600&q=80",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80",
    "https://images.unsplash.com/photo-1546156929-a4c0ac411f47?w=600&q=80",
  ];

  return (
    <section ref={ref} className="relative py-8 md:py-12 overflow-hidden space-y-4">
      <motion.div style={{ x: x1 }} className="flex gap-4 px-4">
        {row1.map((src, i) => (
          <motion.div key={i} whileHover={{ scale: 1.05 }} className="relative w-[260px] md:w-[340px] aspect-[16/10] rounded-xl overflow-hidden shrink-0 shadow-lg">
            <Image src={src} alt={`Memory ${i + 1}`} fill className="object-cover" sizes="340px" unoptimized />
          </motion.div>
        ))}
      </motion.div>
      <motion.div style={{ x: x2 }} className="flex gap-4 px-4">
        {row2.map((src, i) => (
          <motion.div key={i} whileHover={{ scale: 1.05 }} className="relative w-[260px] md:w-[340px] aspect-[16/10] rounded-xl overflow-hidden shrink-0 shadow-lg">
            <Image src={src} alt={`Memory ${i + 7}`} fill className="object-cover" sizes="340px" unoptimized />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="relative py-24 md:py-36 px-6 overflow-hidden bg-chrono-surface/30">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--line)] to-transparent" />
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display tracking-tight text-chrono-text" style={{ fontWeight: 600 }}>
            Built for <em className="text-chrono-accent">real lives</em>
          </h2>
        </FadeUp>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: 10, suffix: "k+", label: "Memories tracked" },
            { value: 50, suffix: "+", label: "Cities mapped" },
            { value: 365, suffix: "", label: "Days of stories" },
            { value: 100, suffix: "%", label: "Private & secure" },
          ].map((stat, i) => (
            <ScaleIn key={stat.label} delay={i * 0.1}>
              <div className="text-center p-6 md:p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--line)]">
                <div className="text-4xl md:text-5xl font-display text-chrono-text mb-2" style={{ fontWeight: 700 }}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs font-body font-semibold text-chrono-text/45 uppercase tracking-[0.15em]">{stat.label}</div>
              </div>
            </ScaleIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilitiesStrip() {
  const caps = [
    { icon: Camera, label: "Google Photos Import" }, { icon: Calendar, label: "Calendar Sync" }, { icon: BookOpen, label: "Life Narratives" },
    { icon: MapPin, label: "Interactive Map" }, { icon: Shield, label: "Privacy First" }, { icon: Zap, label: "Instant Setup" },
  ];
  return (
    <section className="relative py-20 px-6">
      <FadeUp className="text-center mb-10"><span className="section-label block">Capabilities</span></FadeUp>
      <div className="flex flex-wrap items-center justify-center gap-3 max-w-5xl mx-auto">
        {caps.map(({ icon: Icon, label }, i) => (
          <ScaleIn key={label} delay={i * 0.06}>
            <motion.div whileHover={{ scale: 1.06, y: -2 }} className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--line)] hover:border-chrono-accent/30 text-sm font-body font-semibold text-chrono-text/80 transition-colors cursor-default">
              <Icon size={16} strokeWidth={2} className="text-chrono-accent" /> {label}
            </motion.div>
          </ScaleIn>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  const { data: session, status } = useSession();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.95, 1]);

  const handleCTA = () => {
    if (status !== "loading" && session) window.location.href = "/timeline";
    else signIn("google", { callbackUrl: "/timeline" });
  };

  return (
    <section ref={ref} className="relative py-24 md:py-48 px-6 overflow-hidden bg-[#1A2B1F] text-white">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      <motion.div style={{ scale }} className="relative max-w-3xl mx-auto text-center">
        <FadeUp>
          <h2 className="font-display tracking-tight mb-8 text-white" style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)", lineHeight: 1.05, fontWeight: 600 }}>
            Ready to map<br /><em className="text-emerald-300">your story?</em>
          </h2>
          <p className="text-lg font-body max-w-md mx-auto mb-14 leading-relaxed text-white/55">Transform your memories into a beautiful, interactive timeline.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={handleCTA} className="group inline-flex cursor-pointer items-center gap-2.5 rounded-xl px-10 py-4 text-base font-body font-bold bg-emerald-400 text-[#1A2B1F] hover:bg-emerald-300 shadow-[0_4px_24px_rgba(110,231,183,0.3)] transition-colors">
              <Play size={15} fill="currentColor" /> Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
            <Link href="/insights" className="px-10 py-4 text-white/70 hover:text-white border border-white/15 hover:border-white/30 rounded-xl transition-all text-sm font-body font-medium">See a Demo</Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-14 text-xs font-body font-medium text-white/35">
            <span className="flex items-center gap-1.5"><Zap size={12} /> Free to start</span>
            <span className="w-px h-3 bg-white/10" />
            <span className="flex items-center gap-1.5"><Shield size={12} /> No credit card</span>
            <span className="w-px h-3 bg-white/10" />
            <span className="flex items-center gap-1.5"><Shield size={12} /> Your data stays private</span>
          </div>
        </FadeUp>
      </motion.div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <HeroSection />
      <PhotoParallaxSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PhotoStripSection />
      <StatsSection />
      <CapabilitiesStrip />
      <CTASection />
    </>
  );
}
