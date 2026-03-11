import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        chrono: {
          bg: "#080808",
          surface: "#0F0F0F",
          card: "#141414",
          border: "#1A1A1A",
          accent: "rgba(255,255,255,0.8)",
          "accent-warm": "rgba(255,255,255,0.9)",
          "accent-glow": "rgba(255,255,255,0.3)",
          muted: "rgba(240,235,225,0.45)",
          text: "#F0EBE1",
          "text-secondary": "rgba(240,235,225,0.65)",
        },
        background: "#080808",
        foreground: "#F0EBE1",
        primary: "rgba(255,255,255,0.8)",
        muted: "rgba(255,255,255,0.06)",
        border: "rgba(255,255,255,0.12)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 1.2s ease-out forwards",
        "slide-up": "slideUp 1s ease-out forwards",
        "scale-in": "scaleIn 1s ease-out forwards",
        float: "float 10s ease-in-out infinite",
        "pulse-glow": "pulseGlow 5s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "star-twinkle": "starTwinkle 3s ease-in-out infinite",
        "white-pulse": "whitePulse 2.5s ease-in-out infinite",
        "marker-ring": "markerRing 2s ease-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "0.6" },
        },
        starTwinkle: {
          "0%, 100%": { opacity: "0.15", transform: "scale(0.8)" },
          "50%": { opacity: "0.7", transform: "scale(1.2)" },
        },
        whitePulse: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(255,255,255,0.2)" },
          "50%": { boxShadow: "0 0 25px rgba(255,255,255,0.5)" },
        },
        markerRing: {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      borderRadius: {
        full: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
