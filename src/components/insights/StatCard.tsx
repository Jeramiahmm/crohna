"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  color?: string;
  delay?: number;
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1.8;
          const startTime = Date.now();
          const step = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatCard({ label, value, suffix, delay = 0 }: StatCardProps) {
  const isNumeric = typeof value === "number";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      <div className="bg-chrono-bg p-8 md:p-10 card-hover overflow-hidden border border-[var(--line-strong)]">
        <div className="text-4xl md:text-5xl font-display font-bold text-chrono-text mb-3">
          {isNumeric ? <AnimatedNumber value={value} suffix={suffix} /> : value}
        </div>
        <div className="section-label">
          {label}
        </div>
      </div>
    </motion.div>
  );
}
