"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { Clock, MapPin, BookOpen, BarChart3, Sparkles, Shield, Zap, Camera, Calendar, Globe, ArrowRight } from "lucide-react";
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
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
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
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="font-display tracking-tight text-chrono-text" style={{ fontSize: "clamp(3.5rem, 10vw, 7.5rem)", lineHeight: 1.05, fontWeight: 400 }}>
          <span className="block">Your life,</span>
          <span className="block">
            <span className="inline-block relative align-bottom overflow-visible" style={{ lineHeight: "inherit", paddingRight: "0.08em" }}>
              <span className="invisible italic">beautifully</span>
              <AnimatePresence mode="wait">
                <motion.span key={HERO_WORDS[wordIdx]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 italic text-chrono-accent text-right" style={{ lineHeight: "inherit" }}>
                  {HERO_WORDS[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </span>{" "}
            <span className="font-bold">mapped</span>
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
  const y1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [40, -80]);
  const y3 = useTransform(scrollYProgress, [0, 1], [80, -40]);

  return (
    <section ref={ref} className="relative py-20 md:py-32 px-6 overflow-hidden bg-chrono-surface/50">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--line)] to-transparent" />
      <FadeUp className="text-center mb-16 max-w-3xl mx-auto">
        <span className="section-label mb-4 block">Your Memories</span>
        <h2 className="text-4xl md:text-6xl font-display tracking-tight text-chrono-text">
          <span className="italic text-chrono-accent">Every moment</span> deserves<br />a beautiful canvas
        </h2>
        <p className="text-base md:text-lg font-body text-chrono-text/50 mt-6 max-w-xl mx-auto leading-relaxed">
          Crohna lets you capture, organize, and relive at the speed of thought — turning scattered moments into a cohesive life story.
        </p>
      </FadeUp>
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {PHOTOS.map((photo, i) => {
          const yVal = i % 3 === 0 ? y1 : i % 3 === 1 ? y2 : y3;
          return (
            <motion.div key={photo.alt} style={{ y: yVal }} className={`relative rounded-2xl overflow-hidden shadow-lg ${i === 0 ? "row-span-2 aspect-[3/4]" : "aspect-[4/3]"}`}>
              <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 text-white text-xs font-body font-medium bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">{photo.alt}</span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: Clock, title: "Timeline", desc: "Every moment organized chronologically. A living record of the events that shaped your story.", accent: "bg-emerald-500/10 text-emerald-600" },
    { icon: BookOpen, title: "AI Stories", desc: "Beautiful narratives of your life chapters, crafted from your real experiences by AI.", accent: "bg-violet-500/10 text-violet-600" },
    { icon: MapPin, title: "Life Map", desc: "See where your life happened on an interactive map with pins for every memory.", accent: "bg-amber-500/10 text-amber-600" },
    { icon: BarChart3, title: "Insights", desc: "Discover patterns — most active years, favorite cities, biggest milestones.", accent: "bg-blue-500/10 text-blue-600" },
  ];
  return (
    <section className="relative py-20 md:py-36 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-16">
          <span className="section-label mb-5 block">Features</span>
          <h2 className="text-4xl md:text-6xl font-display tracking-tight text-chrono-text">Everything you need to <em>relive your story</em></h2>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.1}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }} className="bg-[var(--card-bg)] rounded-2xl border border-[var(--line)] hover:border-chrono-accent/30 hover:shadow-[0_8px_32px_rgba(61,90,68,0.08)] transition-shadow duration-500 p-8 md:p-10 h-full">
                <div className={`w-12 h-12 rounded-xl ${f.accent} flex items-center justify-center mb-6`}><f.icon size={22} strokeWidth={1.8} /></div>
                <h3 className="text-2xl md:text-3xl font-display mb-4 text-chrono-text tracking-tight" style={{ fontWeight: 500 }}>{f.title}</h3>
                <p className="text-base font-body leading-relaxed text-chrono-text/55">{f.desc}</p>
              </motion.div>
            </FadeUp>
          ))}
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
    { icon: Sparkles, num: "02", title: "Watch your story unfold", desc: "See your life organized with maps, chapters, and interactive insights." },
    { icon: BookOpen, num: "03", title: "Discover your narrative", desc: "AI crafts personal narratives about your life chapters." },
  ];
  return (
    <section ref={ref} className="relative py-24 md:py-44 px-6 overflow-hidden bg-[#1A2B1F] text-white">
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-900/30 to-transparent blur-3xl pointer-events-none" />
      <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <FadeUp>
            <span className="text-[13px] tracking-[0.12em] uppercase text-emerald-400/80 font-body font-medium mb-5 block">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-display tracking-tight text-white mb-12">Three steps to your <em className="text-emerald-300/90">life story</em></h2>
          </FadeUp>
          {steps.map((s, i) => (
            <FadeUp key={s.num} delay={i * 0.12}>
              <div className="flex gap-5 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
                  <s.icon size={22} strokeWidth={1.5} className="text-emerald-300" />
                </div>
                <div>
                  <span className="text-[10px] font-body font-semibold text-emerald-400/40 tracking-widest uppercase">Step {s.num}</span>
                  <h3 className="text-xl font-display text-white mt-1 mb-1.5" style={{ fontWeight: 400 }}>{s.title}</h3>
                  <p className="text-sm font-body text-white/50 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </FadeUp>
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
  const x = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  const strip = [
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80",
    "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=600&q=80",
    "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
    "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=600&q=80",
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&q=80",
  ];

  return (
    <section ref={ref} className="relative py-4 overflow-hidden">
      <motion.div style={{ x }} className="flex gap-4 px-4">
        {strip.map((src, i) => (
          <div key={i} className="relative w-[280px] md:w-[360px] aspect-[16/10] rounded-xl overflow-hidden shrink-0 shadow-md">
            <Image src={src} alt={`Memory ${i + 1}`} fill className="object-cover" sizes="360px" unoptimized />
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function CapabilitiesStrip() {
  const caps = [
    { icon: Camera, label: "Google Photos Import" }, { icon: Calendar, label: "Calendar Sync" }, { icon: Sparkles, label: "AI Narratives" },
    { icon: MapPin, label: "Interactive Map" }, { icon: Shield, label: "Privacy First" }, { icon: Zap, label: "Instant Setup" },
  ];
  return (
    <section className="relative py-16 px-6">
      <FadeUp className="text-center mb-10"><span className="section-label block">Capabilities</span></FadeUp>
      <FadeUp delay={0.1}>
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-5xl mx-auto">
          {caps.map(({ icon: Icon, label }) => (
            <div key={label} className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--line)] text-sm font-body font-medium text-chrono-text/70">
              <Icon size={16} strokeWidth={1.8} className="text-chrono-accent" /> {label}
            </div>
          ))}
        </div>
      </FadeUp>
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
          <h2 className="font-display tracking-tight mb-8 text-white" style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)", lineHeight: 1.05, fontWeight: 400 }}>
            Ready to map<br /><em className="text-emerald-300/90">your story?</em>
          </h2>
          <p className="text-lg font-body max-w-md mx-auto mb-14 leading-relaxed text-white/50">Transform your memories into a beautiful, interactive timeline.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={handleCTA} className="group inline-flex cursor-pointer items-center gap-2 rounded-xl px-10 py-4 text-base font-body font-medium bg-emerald-400 text-[#1A2B1F] hover:bg-emerald-300 active:scale-[0.98] shadow-[0_2px_20px_rgba(110,231,183,0.2)] transition-all">
              Get Started <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
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
      <CapabilitiesStrip />
      <CTASection />
    </>
  );
}
