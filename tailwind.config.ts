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
          bg: "#0F0F10",
          surface: "#131314",
          card: "#181819",
          border: "#1C1C1C",
          accent: "#C7C2BA",
          "accent-warm": "#B8B3AB",
          "accent-glow": "#C7C2BA",
          muted: "#5A5A5A",
          text: "#F2F2F2",
          "text-secondary": "#A1A1A1",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 1.2s ease-out forwards",
        "slide-up": "slideUp 1.2s ease-out forwards",
        "scale-in": "scaleIn 1s ease-out forwards",
        float: "float 10s ease-in-out infinite",
        "pulse-glow": "pulseGlow 5s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "constellation-drift": "constellationDrift 20s ease-in-out infinite",
        "node-pulse": "nodePulse 4s ease-in-out infinite",
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
        constellationDrift: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(3px, -5px)" },
          "50%": { transform: "translate(-2px, 3px)" },
          "75%": { transform: "translate(4px, 2px)" },
        },
        nodePulse: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.2)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
