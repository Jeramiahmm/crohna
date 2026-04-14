import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        chrono: {
          bg: "var(--chrono-bg)",
          surface: "var(--chrono-surface)",
          card: "var(--chrono-card)",
          border: "var(--border)",
          accent: "var(--chrono-accent)",
          "accent-warm": "var(--chrono-accent)",
          "accent-glow": "var(--chrono-glow)",
          muted: "var(--chrono-muted)",
          text: "var(--chrono-text)",
          "text-secondary": "var(--chrono-muted)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        muted: "var(--muted)",
        border: "var(--border)",
      },
      fontFamily: {
        display: ["'EB Garamond'", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        full: "9999px",
      },
      animation: {
        "fade-in": "fadeIn 1s ease-out forwards",
        "slide-up": "slideUp 0.8s ease-out forwards",
        "scale-in": "scaleIn 0.8s ease-out forwards",
        float: "float 12s ease-in-out infinite",
        "pulse-glow": "pulseGlow 6s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "star-twinkle": "starTwinkle 4s ease-in-out infinite",
        "white-pulse": "whitePulse 3s ease-in-out infinite",
        "marker-ring": "markerRing 2s ease-out infinite",
        "shimmer-slide": "shimmerSlide 8s ease-in-out infinite",
        "spin-around": "spinAround 13s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
        starTwinkle: {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.9)" },
          "50%": { opacity: "0.5", transform: "scale(1.1)" },
        },
        whitePulse: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(74,107,82,0.1)" },
          "50%": { boxShadow: "0 0 20px rgba(74,107,82,0.2)" },
        },
        markerRing: {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        shimmerSlide: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        spinAround: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
