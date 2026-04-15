"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { Clock, MapPin, BookOpen, BarChart3, Layers, Shield, Zap, Camera, Calendar, Globe, ArrowRight, Play } from "lucide-react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { ScrollRevealText } from "@/components/ui/ScrollRevealText";

const HERO_CENTER_IMAGE = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2000";

const HERO_SIDE_IMAGES = [
  { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000", alt: "Portrait moment", position: "left" },
  { src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000", alt: "Celebration", position: "left" },
  { src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000", alt: "City lights", position: "right" },
  { src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000", alt: "Friends together", position: "right" },
];

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
  "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800&q=80",
  "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
  "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&q=80",
  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
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

  return <span ref={ref} aria-live="polite" aria-atomic="true">{count}{suffix}</span>;
}

const HERO_TEXT = "Your life, beautifully mapped";

function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return prefersReduced;
}

function HeroSection() {
  const { data: session, status } = useSession();
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setScrollProgress(1);
      return;
    }
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollableHeight = window.innerHeight * 2;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prefersReducedMotion]);

  const handleCTA = () => {
    if (status !== "loading" && session) window.location.href = "/timeline";
    else signIn("google", { callbackUrl: "/timeline" });
  };

  // Text fades out first (0 to 0.2)
  const textOpacity = Math.max(0, 1 - (scrollProgress / 0.2));
  // Image transforms start after text fades (0.2 to 1)
  const imageProgress = Math.max(0, Math.min(1, (scrollProgress - 0.2) / 0.8));
  // Smooth interpolations matching template exactly
  const centerWidth = 100 - (imageProgress * 58); // 100% to 42%
  const centerHeight = 100 - (imageProgress * 30); // 100% to 70%
  const sideWidth = imageProgress * 22; // 0% to 22%
  const sideOpacity = imageProgress;
  const sideTranslateLeft = -100 + (imageProgress * 100);
  const sideTranslateRight = 100 - (imageProgress * 100);
  const borderRadius = imageProgress * 24;
  const gap = imageProgress * 16;
  const sideTranslateY = -(imageProgress * 15);

  return (
    <section ref={sectionRef} className="relative bg-chrono-bg">
      {/* Sticky container for scroll animation */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="flex h-full w-full items-center justify-center">
          {/* Bento Grid Container */}
          <div
            className="relative flex h-full w-full items-stretch justify-center"
            style={{ gap: `${gap}px`, padding: `${imageProgress * 16}px`, paddingBottom: `${60 + (imageProgress * 40)}px` }}
          >
            {/* Left Column */}
            <div
              className="flex flex-col will-change-transform"
              style={{
                width: `${sideWidth}%`,
                gap: `${gap}px`,
                transform: `translateX(${sideTranslateLeft}%) translateY(${sideTranslateY}%)`,
                opacity: sideOpacity,
              }}
            >
              {HERO_SIDE_IMAGES.filter(img => img.position === "left").map((img, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden will-change-transform"
                  style={{ flex: 1, borderRadius: `${borderRadius}px` }}
                >
                  <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="(max-width: 768px) 40vw, 22vw" unoptimized />
                </div>
              ))}
            </div>

            {/* Main Hero Image - Center */}
            <div
              className="relative overflow-hidden will-change-transform"
              style={{
                width: `${centerWidth}%`,
                height: `${centerHeight}%`,
                flex: "0 0 auto",
                borderRadius: `${borderRadius}px`,
              }}
            >
              <Image
                src={HERO_CENTER_IMAGE}
                alt="Life moments collage"
                fill
                className="object-cover"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

              {/* Overlay Text - Fades out first */}
              <div
                className="absolute inset-0 flex items-end overflow-hidden"
                style={{ opacity: textOpacity }}
              >
                <h1 className="w-full text-[12vw] md:text-[10vw] lg:text-[8vw] font-display font-medium leading-[0.85] tracking-tighter text-white pb-8 px-6">
                  {HERO_TEXT.split("").map((letter, index) => (
                    <span
                      key={index}
                      className="inline-block animate-[slideUp_0.8s_ease-out_forwards] opacity-0"
                      style={{
                        animationDelay: `${index * 0.04}s`,
                        transition: "all 1.5s",
                        transitionTimingFunction: "cubic-bezier(0.86, 0, 0.07, 1)",
                      }}
                    >
                      {letter === " " ? "\u00A0" : letter}
                    </span>
                  ))}
                </h1>
              </div>
            </div>

            {/* Right Column */}
            <div
              className="flex flex-col will-change-transform"
              style={{
                width: `${sideWidth}%`,
                gap: `${gap}px`,
                transform: `translateX(${sideTranslateRight}%) translateY(${sideTranslateY}%)`,
                opacity: sideOpacity,
              }}
            >
              {HERO_SIDE_IMAGES.filter(img => img.position === "right").map((img, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden will-change-transform"
                  style={{ flex: 1, borderRadius: `${borderRadius}px` }}
                >
                  <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="(max-width: 768px) 40vw, 22vw" unoptimized />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll space to enable animation */}
      <div className="h-[200vh]" />

      {/* Tagline Section with CTA */}
      <div className="px-6 pt-32 pb-28 md:pt-48 md:px-12 md:pb-36 lg:px-20 lg:pt-56 lg:pb-44">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3 mb-10">
            {[{ icon: Globe, label: "Web" }, { icon: Camera, label: "Photos" }, { icon: Calendar, label: "Calendar" }].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-chrono-surface border border-[var(--line)] text-xs font-body font-medium text-chrono-muted">
                <Icon size={13} strokeWidth={1.8} /> {label}
              </span>
            ))}
          </div>
          <p className="text-2xl leading-relaxed text-chrono-muted md:text-3xl lg:text-[2.5rem] lg:leading-snug font-body">
            The visual timeline that turns memories into clear, beautiful stories.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
            <button onClick={handleCTA} className="group inline-flex cursor-pointer items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-body font-medium bg-chrono-accent text-white hover:opacity-90 active:scale-[0.98] shadow-[0_2px_16px_rgba(61,90,68,0.3)] transition-all duration-300">
              Get Started <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <Link href="/insights" className="px-8 py-3.5 text-chrono-text/70 hover:text-chrono-text border border-chrono-text/15 hover:border-chrono-text/30 rounded-xl transition-all text-sm font-body font-medium">
              View Insights
            </Link>
          </div>
          <p className="mt-6 text-sm font-body text-chrono-text/40">Free to start. No credit card required.</p>
        </div>
      </div>
    </section>
  );
}

function MomentsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [leftTranslateX, setLeftTranslateX] = useState(-100);
  const [rightTranslateX, setRightTranslateX] = useState(100);
  const [titleOpacity, setTitleOpacity] = useState(1);
  const rafRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const updateTransforms = useCallback(() => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const sectionHeight = sectionRef.current.offsetHeight;
    const scrollableRange = sectionHeight - windowHeight;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollableRange));
    setLeftTranslateX((1 - progress) * -100);
    setRightTranslateX((1 - progress) * 100);
    setTitleOpacity(1 - progress);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setLeftTranslateX(0);
      setRightTranslateX(0);
      setTitleOpacity(0);
      return;
    }
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateTransforms);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    updateTransforms();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateTransforms, prefersReducedMotion]);

  return (
    <section className="bg-chrono-bg">
      {/* Scroll-Animated Card Grid */}
      <div ref={sectionRef} className="relative" style={{ height: "200vh" }}>
        <div className="sticky top-0 h-screen flex items-center justify-center">
          <div className="relative w-full">
            {/* Title - positioned behind the cards */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
              style={{ opacity: titleOpacity }}
            >
              <h2 className="text-[12vw] md:text-[10vw] lg:text-[8vw] font-display font-medium leading-[0.95] tracking-tighter text-chrono-text text-center px-6">
                Your moments,<br />beautifully organized.
              </h2>
            </div>

            {/* Card Grid */}
            <div className="relative z-10 grid grid-cols-1 gap-4 px-6 md:grid-cols-2 md:px-12 lg:px-20">
              {/* Left Card - comes from left */}
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-2xl"
                style={{
                  transform: `translate3d(${leftTranslateX}%, 0, 0)`,
                  WebkitTransform: `translate3d(${leftTranslateX}%, 0, 0)`,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  perspective: 1000,
                  touchAction: "pan-y",
                }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80"
                  alt="A cozy home moment"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <span className="backdrop-blur-md px-4 py-2 text-sm font-body font-medium rounded-full bg-[rgba(255,255,255,0.2)] text-white">
                    First Apartment — 2019
                  </span>
                </div>
              </div>

              {/* Right Card - comes from right */}
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-2xl"
                style={{
                  transform: `translate3d(${rightTranslateX}%, 0, 0)`,
                  WebkitTransform: `translate3d(${rightTranslateX}%, 0, 0)`,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  perspective: 1000,
                  touchAction: "pan-y",
                }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800&q=80"
                  alt="Adventure travel"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <span className="backdrop-blur-md px-4 py-2 text-sm font-body font-medium rounded-full bg-[rgba(255,255,255,0.2)] text-white">
                    Summer Road Trip — 2023
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description with ScrollRevealText */}
      <div className="px-6 py-20 md:px-12 md:py-28 lg:px-20 lg:py-36">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-widest text-chrono-muted font-body mb-8">Your Timeline</p>
          <ScrollRevealText
            text="Capture, organize, and relive — turning scattered moments into a cohesive life story. Every photo, every milestone, every adventure, beautifully connected."
            className="font-display"
          />
        </div>
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

function GalleryScrollSection() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sectionHeight, setSectionHeight] = useState("100vh");
  const [translateX, setTranslateX] = useState(0);
  const rafRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setSectionHeight("auto");
      return;
    }
    const calculateHeight = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.scrollWidth;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const totalHeight = viewportHeight + (containerWidth - viewportWidth);
      setSectionHeight(`${totalHeight}px`);
    };
    const timer = setTimeout(calculateHeight, 100);
    window.addEventListener("resize", calculateHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateHeight);
    };
  }, [prefersReducedMotion]);

  const updateTransform = useCallback(() => {
    if (!galleryRef.current || !containerRef.current) return;
    const rect = galleryRef.current.getBoundingClientRect();
    const containerWidth = containerRef.current.scrollWidth;
    const viewportWidth = window.innerWidth;
    const totalScrollDistance = containerWidth - viewportWidth;
    const scrolled = Math.max(0, -rect.top);
    const progress = Math.min(1, scrolled / totalScrollDistance);
    setTranslateX(progress * -totalScrollDistance);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateTransform);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    updateTransform();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateTransform, prefersReducedMotion]);

  return (
    <section
      ref={galleryRef}
      className="relative bg-chrono-bg"
      style={{ height: prefersReducedMotion ? "auto" : sectionHeight }}
    >
      <div className={prefersReducedMotion ? "overflow-x-auto py-12" : "sticky top-0 h-screen overflow-hidden"}>
        <div className={prefersReducedMotion ? "flex items-center" : "flex h-full items-center"}>
          <div
            ref={containerRef}
            className="flex gap-6 px-6"
            style={{
              transform: `translate3d(${translateX}px, 0, 0)`,
              backfaceVisibility: "hidden",
              touchAction: "pan-y",
            }}
          >
            {GALLERY_IMAGES.map((src, index) => (
              <div
                key={index}
                className="relative h-[70vh] w-[85vw] flex-shrink-0 overflow-hidden rounded-2xl md:w-[60vw] lg:w-[45vw]"
                style={{ transform: "translateZ(0)" }}
              >
                <Image
                  src={src}
                  alt={`Memory ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 85vw, (max-width: 1024px) 60vw, 45vw"
                  priority={index < 3}
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      </div>
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
      <MomentsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <GalleryScrollSection />
      <StatsSection />
      <CapabilitiesStrip />
      <CTASection />
    </>
  );
}
