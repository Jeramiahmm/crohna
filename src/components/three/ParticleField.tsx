"use client";

import { useEffect, useRef } from "react";

interface Orb {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  breathSpeed: number;
  breathOffset: number;
  hue: number;
  drift: number;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDark = document.documentElement.classList.contains("dark");

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const orbCount = 5;
    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    const orbs: Orb[] = Array.from({ length: orbCount }, (_, i) => ({
      x: (w() * (i + 1)) / (orbCount + 1) + (Math.random() - 0.5) * w() * 0.2,
      y: h() * 0.3 + Math.random() * h() * 0.4,
      radius: Math.random() * 120 + 80,
      baseOpacity: Math.random() * 0.03 + 0.02,
      breathSpeed: Math.random() * 0.0003 + 0.0002,
      breathOffset: Math.random() * Math.PI * 2,
      hue: 140 + Math.random() * 30,
      drift: Math.random() * 0.08 + 0.02,
    }));

    const draw = (time: number) => {
      const width = w();
      const height = h();
      ctx.clearRect(0, 0, width, height);

      for (const orb of orbs) {
        const breath = Math.sin(time * orb.breathSpeed + orb.breathOffset) * 0.5 + 0.5;
        const opacity = orb.baseOpacity * (0.4 + breath * 0.6);
        const radius = orb.radius * (0.9 + breath * 0.2);
        const offsetY = Math.sin(time * orb.drift * 0.01 + orb.breathOffset) * 15;

        const gradient = ctx.createRadialGradient(
          orb.x, orb.y + offsetY, 0,
          orb.x, orb.y + offsetY, radius
        );

        if (isDark) {
          gradient.addColorStop(0, `hsla(${orb.hue}, 25%, 65%, ${opacity * 1.5})`);
          gradient.addColorStop(0.5, `hsla(${orb.hue}, 20%, 50%, ${opacity * 0.5})`);
          gradient.addColorStop(1, `hsla(${orb.hue}, 15%, 40%, 0)`);
        } else {
          gradient.addColorStop(0, `hsla(${orb.hue}, 30%, 75%, ${opacity})`);
          gradient.addColorStop(0.5, `hsla(${orb.hue}, 25%, 80%, ${opacity * 0.4})`);
          gradient.addColorStop(1, `hsla(${orb.hue}, 20%, 85%, 0)`);
        }

        ctx.beginPath();
        ctx.arc(orb.x, orb.y + offsetY, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    if (prefersReducedMotion) {
      draw(0);
    } else {
      animationRef.current = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}
