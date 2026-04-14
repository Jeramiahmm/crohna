"use client";

import { useEffect, useRef } from "react";

const TICKER_TEXT =
  "memories \u00B7 milestones \u00B7 places \u00B7 stories \u00B7 chapters \u00B7 your journey \u00B7 ";

export default function MarqueeTicker() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let raf: number;
    let x = 0;
    const speed = 0.25;

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

  return (
    <div className="w-full overflow-hidden py-10 select-none">
      <div ref={trackRef} className="flex whitespace-nowrap will-change-transform">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="font-display italic text-[13px] tracking-[0.2em] text-[var(--line-hover)]"
          >
            {TICKER_TEXT}
          </span>
        ))}
      </div>
    </div>
  );
}
