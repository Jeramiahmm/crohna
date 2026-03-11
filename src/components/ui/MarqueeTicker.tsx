"use client";

import { useEffect, useRef } from "react";

const TICKER_TEXT =
  "MEMORIES \u00B7 MILESTONES \u00B7 PLACES \u00B7 2022 \u00B7 2023 \u00B7 2024 \u00B7 YOUR STORY \u00B7 ";

export default function MarqueeTicker() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  return (
    <div className="w-full overflow-hidden py-8 select-none">
      <div ref={trackRef} className="flex whitespace-nowrap will-change-transform">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="font-display font-thin text-[11px] tracking-[0.4em] uppercase"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            {TICKER_TEXT}
          </span>
        ))}
      </div>
    </div>
  );
}
