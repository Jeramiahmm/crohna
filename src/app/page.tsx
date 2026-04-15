"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { FadeImage } from "@/components/ui/FadeImage";
import { ScrollRevealText } from "@/components/ui/ScrollRevealText";

/* ─── HERO ─────────────────────────────────────────────────────────── */

const HERO_WORD = "CROHNA";

const heroSideImages = [
  { src: "https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=1000", alt: "Mountain hiking adventure", position: "left" },
  { src: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=1000", alt: "Camping under stars", position: "left" },
  { src: "https://images.unsplash.com/photo-1533873984035-25970ab07461?q=80&w=1000", alt: "Forest exploration", position: "right" },
  { src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?q=80&w=1000", alt: "Lake camping view", position: "right" },
];

function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { data: session, status } = useSession();

  useEffect(() => {
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
  }, []);

  const handleCTA = () => {
    if (status !== "loading" && session) window.location.href = "/timeline";
    else signIn("google", { callbackUrl: "/timeline" });
  };

  const textOpacity = Math.max(0, 1 - (scrollProgress / 0.2));
  const imageProgress = Math.max(0, Math.min(1, (scrollProgress - 0.2) / 0.8));
  const centerWidth = 100 - (imageProgress * 58);
  const centerHeight = 100 - (imageProgress * 30);
  const sideWidth = imageProgress * 22;
  const sideOpacity = imageProgress;
  const sideTranslateLeft = -100 + (imageProgress * 100);
  const sideTranslateRight = 100 - (imageProgress * 100);
  const borderRadius = imageProgress * 24;
  const gap = imageProgress * 16;
  const sideTranslateY = -(imageProgress * 15);

  return (
    <section ref={sectionRef} className="relative bg-chrono-bg">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="flex h-full w-full items-center justify-center">
          <div
            className="relative flex h-full w-full items-stretch justify-center"
            style={{ gap: `${gap}px`, padding: `${imageProgress * 16}px`, paddingBottom: `${60 + (imageProgress * 40)}px` }}
          >
            {/* Left Column */}
            <div
              className="flex flex-col will-change-transform"
              style={{ width: `${sideWidth}%`, gap: `${gap}px`, transform: `translateX(${sideTranslateLeft}%) translateY(${sideTranslateY}%)`, opacity: sideOpacity }}
            >
              {heroSideImages.filter(img => img.position === "left").map((img, idx) => (
                <div key={idx} className="relative overflow-hidden will-change-transform" style={{ flex: 1, borderRadius: `${borderRadius}px` }}>
                  <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="22vw" unoptimized />
                </div>
              ))}
            </div>

            {/* Center */}
            <div
              className="relative overflow-hidden will-change-transform"
              style={{ width: `${centerWidth}%`, height: `${centerHeight}%`, flex: "0 0 auto", borderRadius: `${borderRadius}px` }}
            >
              <Image
                src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2000"
                alt="Adventure landscape"
                fill
                className="object-cover"
                priority
                unoptimized
              />

              {/* Overlay Text */}
              <div className="absolute inset-0 flex items-end overflow-hidden" style={{ opacity: textOpacity }}>
                <h1 className="w-full text-[22vw] font-medium leading-[0.8] tracking-tighter text-white">
                  {HERO_WORD.split("").map((letter, index) => (
                    <span
                      key={index}
                      className="inline-block animate-[slideUp_0.8s_ease-out_forwards] opacity-0"
                      style={{ animationDelay: `${index * 0.08}s` }}
                    >
                      {letter}
                    </span>
                  ))}
                </h1>
              </div>
            </div>

            {/* Right Column */}
            <div
              className="flex flex-col will-change-transform"
              style={{ width: `${sideWidth}%`, gap: `${gap}px`, transform: `translateX(${sideTranslateRight}%) translateY(${sideTranslateY}%)`, opacity: sideOpacity }}
            >
              {heroSideImages.filter(img => img.position === "right").map((img, idx) => (
                <div key={idx} className="relative overflow-hidden will-change-transform" style={{ flex: 1, borderRadius: `${borderRadius}px` }}>
                  <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="22vw" unoptimized />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll space */}
      <div className="h-[200vh]" />

      {/* Tagline */}
      <div className="px-6 pt-32 pb-28 md:pt-48 md:px-12 md:pb-36 lg:px-20 lg:pt-56 lg:pb-44">
        <p className="mx-auto max-w-2xl text-center text-2xl leading-relaxed text-chrono-muted md:text-3xl lg:text-[2.5rem] lg:leading-snug">
          Your life, beautifully mapped.
          <br />
          Every memory, perfectly preserved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <button onClick={handleCTA} className="group inline-flex cursor-pointer items-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium bg-chrono-text text-chrono-bg hover:opacity-80 transition-all duration-300">
            Get Started <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
          <Link href="/insights" className="px-8 py-3.5 text-chrono-muted hover:text-chrono-text border border-[var(--line)] hover:border-[var(--line-hover)] rounded-full transition-all text-sm font-medium">
            View Demo
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── PHILOSOPHY (slide-in cards) ──────────────────────────────────── */

function PhilosophySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [leftX, setLeftX] = useState(-100);
  const [rightX, setRightX] = useState(100);
  const [titleOpacity, setTitleOpacity] = useState(1);
  const rafRef = useRef<number | null>(null);

  const update = useCallback(() => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const range = sectionRef.current.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, -rect.top / range));
    setLeftX((1 - progress) * -100);
    setRightX((1 - progress) * 100);
    setTitleOpacity(1 - progress);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => { window.removeEventListener("scroll", onScroll); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [update]);

  return (
    <section className="bg-chrono-bg">
      <div ref={sectionRef} className="relative" style={{ height: "200vh" }}>
        <div className="sticky top-0 h-screen flex items-center justify-center">
          <div className="relative w-full">
            {/* Title behind cards */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0" style={{ opacity: titleOpacity }}>
              <h2 className="text-[12vw] font-medium leading-[0.95] tracking-tighter text-chrono-text md:text-[10vw] lg:text-[8vw] text-center px-6">
                Timeline & Stories.
              </h2>
            </div>

            {/* Cards */}
            <div className="relative z-10 grid grid-cols-1 gap-4 px-6 md:grid-cols-2 md:px-12 lg:px-20">
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-2xl"
                style={{ transform: `translate3d(${leftX}%, 0, 0)`, WebkitTransform: `translate3d(${leftX}%, 0, 0)`, backfaceVisibility: "hidden" }}
              >
                <Image src="https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1000" alt="Your Timeline" fill className="object-cover" unoptimized />
              </div>
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-2xl"
                style={{ transform: `translate3d(${rightX}%, 0, 0)`, WebkitTransform: `translate3d(${rightX}%, 0, 0)`, backfaceVisibility: "hidden" }}
              >
                <Image src="https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?q=80&w=1000" alt="Life Stories" fill className="object-cover" unoptimized />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 py-20 md:px-12 md:py-28 lg:px-20 lg:py-36 lg:pb-14">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-chrono-muted">How it works</p>
          <p className="mt-8 leading-relaxed text-chrono-muted text-3xl text-center max-w-3xl mx-auto">
            Add your memories — photos, milestones, adventures. Crohna organizes them into a beautiful, interactive timeline you can explore and share.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── FEATURES GRID (3-col) ────────────────────────────────────────── */

const features = [
  { title: "Visual Timeline", description: "Organize", image: "https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=800" },
  { title: "AI Life Stories", description: "Narrate", image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=800" },
  { title: "Interactive Map", description: "Explore", image: "https://images.unsplash.com/photo-1533873984035-25970ab07461?q=80&w=800" },
  { title: "Photo Memories", description: "Capture", image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?q=80&w=800" },
  { title: "Smart Insights", description: "Discover", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800" },
  { title: "Calendar Sync", description: "Connect", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800" },
];

function FeaturesGrid() {
  return (
    <section className="bg-chrono-bg">
      <div className="px-6 py-20 text-center md:px-12 md:py-28 lg:px-20 lg:py-32 lg:pb-20">
        <h2 className="text-3xl font-medium tracking-tight text-chrono-text md:text-4xl lg:text-5xl">
          Everything you need
          <br />
          to remember everything.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-sm text-chrono-muted">Features</p>
      </div>

      <div className="grid grid-cols-1 gap-4 px-6 pb-20 md:grid-cols-3 md:px-12 lg:px-20">
        {features.map((f) => (
          <div key={f.title} className="group">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <FadeImage src={f.image} alt={f.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
            </div>
            <div className="py-6">
              <p className="mb-2 text-xs uppercase tracking-widest text-chrono-muted">{f.description}</p>
              <h3 className="text-chrono-text text-xl font-semibold">{f.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── TECHNOLOGY (second bento + scroll reveal text) ───────────────── */

const techSideImages = [
  { src: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1000", alt: "Forest trail", position: "left" },
  { src: "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?q=80&w=1000", alt: "Mountain peak", position: "left" },
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000", alt: "Alpine landscape", position: "right" },
  { src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000", alt: "Snow mountain", position: "right" },
];

function TechnologySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollableHeight = window.innerHeight * 2;
      const scrolled = -rect.top;
      setScrollProgress(Math.max(0, Math.min(1, scrolled / scrollableHeight)));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const imageProgress = Math.max(0, Math.min(1, (scrollProgress - 0.2) / 0.8));
  const centerWidth = 100 - (imageProgress * 58);
  const sideWidth = imageProgress * 22;
  const sideOpacity = imageProgress;
  const sideTranslateLeft = -100 + (imageProgress * 100);
  const sideTranslateRight = 100 - (imageProgress * 100);
  const borderRadius = imageProgress * 24;
  const gap = imageProgress * 16;

  return (
    <section ref={sectionRef} className="relative bg-chrono-text">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="flex h-full w-full items-center justify-center">
          <div className="relative flex h-full w-full items-stretch justify-center" style={{ gap: `${gap}px`, padding: `${imageProgress * 16}px` }}>
            <div className="flex flex-col will-change-transform" style={{ width: `${sideWidth}%`, gap: `${gap}px`, transform: `translateX(${sideTranslateLeft}%)`, opacity: sideOpacity }}>
              {techSideImages.filter(img => img.position === "left").map((img, idx) => (
                <div key={idx} className="relative overflow-hidden will-change-transform" style={{ flex: 1, borderRadius: `${borderRadius}px` }}>
                  <Image src={img.src} alt={img.alt} fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>

            <div className="relative overflow-hidden will-change-transform" style={{ width: `${centerWidth}%`, height: "100%", flex: "0 0 auto", borderRadius: `${borderRadius}px` }}>
              <Image src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2000" alt="Aerial view of wilderness" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <h2 className="max-w-3xl font-medium leading-tight tracking-tight text-white md:text-5xl lg:text-7xl text-5xl">
                  {["Your", "Story,", "Visualized."].map((word, index) => {
                    const wordFadeStart = index * 0.07;
                    const wordFadeEnd = wordFadeStart + 0.07;
                    const wp = Math.max(0, Math.min(1, (scrollProgress - wordFadeStart) / (wordFadeEnd - wordFadeStart)));
                    return (
                      <span key={index} className="inline-block" style={{ opacity: 1 - wp, filter: `blur(${wp * 10}px)`, transition: "opacity 0.1s, filter 0.1s", marginRight: index < 2 ? "0.3em" : "0" }}>
                        {word}{index === 1 && <br />}
                      </span>
                    );
                  })}
                </h2>
              </div>
            </div>

            <div className="flex flex-col will-change-transform" style={{ width: `${sideWidth}%`, gap: `${gap}px`, transform: `translateX(${sideTranslateRight}%)`, opacity: sideOpacity }}>
              {techSideImages.filter(img => img.position === "right").map((img, idx) => (
                <div key={idx} className="relative overflow-hidden will-change-transform" style={{ flex: 1, borderRadius: `${borderRadius}px` }}>
                  <Image src={img.src} alt={img.alt} fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="h-[200vh]" />

      {/* Scroll Reveal Text */}
      <div className="relative overflow-hidden bg-chrono-bg px-6 py-24 md:px-12 md:py-32 lg:px-20 lg:py-40">
        <div className="relative z-10 mx-auto max-w-4xl">
          <ScrollRevealText text="Crohna transforms scattered memories into a stunning visual timeline. Import photos, sync your calendar, and watch your life story unfold — organized, interactive, and beautiful. From mountain peaks to quiet mornings, every moment finds its place." />
        </div>
      </div>
    </section>
  );
}

/* ─── GALLERY (horizontal scroll) ──────────────────────────────────── */

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=1200", alt: "Mountain hiking" },
  { src: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=1200", alt: "Starry night camping" },
  { src: "https://images.unsplash.com/photo-1533873984035-25970ab07461?q=80&w=1200", alt: "Forest path" },
  { src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?q=80&w=1200", alt: "Mountain lake" },
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200", alt: "Alpine vista" },
  { src: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1200", alt: "Golden trail" },
  { src: "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?q=80&w=1200", alt: "Peak summit" },
  { src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200", alt: "Snow mountains" },
];

function GallerySection() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sectionHeight, setSectionHeight] = useState("100vh");
  const [translateX, setTranslateX] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const calc = () => {
      if (!containerRef.current) return;
      const cw = containerRef.current.scrollWidth;
      const vw = window.innerWidth;
      setSectionHeight(`${window.innerHeight + (cw - vw)}px`);
    };
    const t = setTimeout(calc, 100);
    window.addEventListener("resize", calc);
    return () => { clearTimeout(t); window.removeEventListener("resize", calc); };
  }, []);

  const updateTransform = useCallback(() => {
    if (!galleryRef.current || !containerRef.current) return;
    const rect = galleryRef.current.getBoundingClientRect();
    const dist = containerRef.current.scrollWidth - window.innerWidth;
    const scrolled = Math.max(0, -rect.top);
    setTranslateX(Math.min(1, scrolled / dist) * -dist);
  }, []);

  useEffect(() => {
    const onScroll = () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(updateTransform); };
    window.addEventListener("scroll", onScroll, { passive: true });
    updateTransform();
    return () => { window.removeEventListener("scroll", onScroll); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [updateTransform]);

  return (
    <section id="gallery" ref={galleryRef} className="relative bg-chrono-bg" style={{ height: sectionHeight }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="flex h-full items-center">
          <div
            ref={containerRef}
            className="flex gap-6 px-6"
            style={{ transform: `translate3d(${translateX}px, 0, 0)`, WebkitTransform: `translate3d(${translateX}px, 0, 0)`, backfaceVisibility: "hidden", touchAction: "pan-y" }}
          >
            {galleryImages.map((img, i) => (
              <div key={i} className="relative h-[70vh] w-[85vw] flex-shrink-0 overflow-hidden rounded-2xl md:w-[60vw] lg:w-[45vw]" style={{ transform: "translateZ(0)" }}>
                <Image src={img.src} alt={img.alt} fill className="object-cover" priority={i < 3} unoptimized />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── STATS GRID ───────────────────────────────────────────────────── */

const stats = [
  { label: "Memories", value: "10k+" },
  { label: "Cities mapped", value: "50+" },
  { label: "Stories told", value: "365" },
  { label: "Privacy", value: "100%" },
];

function StatsSection() {
  return (
    <section className="bg-chrono-bg">
      <div className="grid grid-cols-2 border-t border-[var(--line)] md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border-b border-r border-[var(--line)] p-8 text-center last:border-r-0 md:border-b-0">
            <p className="mb-2 text-xs uppercase tracking-widest text-chrono-muted">{s.label}</p>
            <p className="font-medium text-chrono-text text-4xl">{s.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── LARGE STATEMENT + IMAGE ──────────────────────────────────────── */

function StatementSection() {
  return (
    <section className="bg-chrono-bg">
      <div className="px-6 py-24 md:px-12 md:py-32 lg:px-20 lg:py-40">
        <p className="mx-auto max-w-5xl text-2xl leading-relaxed text-chrono-text md:text-3xl lg:text-[2.5rem] lg:leading-snug">
          Crohna combines beautiful design with powerful organization —
          built for people who believe their memories deserve more than a camera roll.
        </p>
      </div>

      <div className="relative aspect-[16/9] w-full">
        <Image
          src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2000"
          alt="Wilderness at sunrise"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--chrono-bg)] via-[var(--chrono-bg)]/60 to-transparent" />
      </div>
    </section>
  );
}

/* ─── CTA ──────────────────────────────────────────────────────────── */

function CTASection() {
  const { data: session, status } = useSession();
  const handleCTA = () => {
    if (status !== "loading" && session) window.location.href = "/timeline";
    else signIn("google", { callbackUrl: "/timeline" });
  };

  return (
    <section className="bg-chrono-bg border-t border-[var(--line)]">
      <div className="px-6 py-24 md:px-12 md:py-32 lg:px-20 lg:py-40 text-center">
        <h2 className="text-4xl font-medium tracking-tight text-chrono-text md:text-5xl lg:text-6xl">
          Start mapping your story.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-chrono-muted leading-relaxed">
          Free to start. No credit card required. Your memories stay private.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={handleCTA} className="group inline-flex cursor-pointer items-center gap-2.5 rounded-full px-10 py-4 text-sm font-medium bg-chrono-text text-chrono-bg hover:opacity-80 transition-all">
            Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
          <Link href="/insights" className="px-10 py-4 text-chrono-muted hover:text-chrono-text border border-[var(--line)] hover:border-[var(--line-hover)] rounded-full transition-all text-sm font-medium">
            See a Demo
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── PAGE ─────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <HeroSection />
      <PhilosophySection />
      <FeaturesGrid />
      <TechnologySection />
      <GallerySection />
      <StatsSection />
      <StatementSection />
      <CTASection />
    </>
  );
}
