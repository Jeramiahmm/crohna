"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  breathSpeed: number;
  breathOffset: number;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    // Respect prefers-reduced-motion: render a static frame instead of animating
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    const starCount = 60;
    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * w(),
      y: Math.random() * h(),
      radius: Math.random() * 1.2 + 0.3,
      baseOpacity: Math.random() * 0.4 + 0.1,
      breathSpeed: Math.random() * 0.0015 + 0.0005,
      breathOffset: Math.random() * Math.PI * 2,
    }));

    const draw = (time: number) => {
      const width = w();
      const height = h();
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        const breath = Math.sin(time * star.breathSpeed + star.breathOffset) * 0.5 + 0.5;
        const opacity = star.baseOpacity * (0.3 + breath * 0.7);
        const radius = star.radius * (0.85 + breath * 0.3);

        // Soft glow
        ctx.beginPath();
        ctx.arc(star.x, star.y, radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.04})`;
        ctx.fill();

        // Core dot — white
        ctx.beginPath();
        ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    if (prefersReducedMotion) {
      // Draw a single static frame
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
      style={{ opacity: 0.8 }}
    />
  );
}
