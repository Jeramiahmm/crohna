"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";

interface OnboardingWizardProps {
  onComplete: (choice: "demo" | "manual" | "import") => void;
}

const steps = [
  { id: "welcome", title: "Welcome" },
  { id: "explain", title: "How it works" },
  { id: "choose", title: "Get started" },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
};

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    if (step < steps.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }, [step]);

  const prev = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }, [step]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-chrono-bg flex items-center justify-center"
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-chrono-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-chrono-accent-warm/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-2xl mx-auto px-6">
        {/* Progress bar */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3">
              <button
                onClick={() => {
                  setDirection(i > step ? 1 : -1);
                  setStep(i);
                }}
                className="flex items-center gap-2"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-500 ${
                    i <= step
                      ? "bg-chrono-accent text-white"
                      : "bg-chrono-card border border-chrono-border text-chrono-muted"
                  }`}
                >
                  {i < step ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-xs hidden sm:block transition-colors ${i <= step ? "text-chrono-text" : "text-chrono-muted"}`}>
                  {s.title}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div className={`w-12 h-px transition-colors duration-500 ${i < step ? "bg-chrono-accent" : "bg-chrono-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="relative min-h-[420px] flex items-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {step === 0 && <WelcomeStep />}
              {step === 1 && <ExplainStep />}
              {step === 2 && <ChooseStep onComplete={onComplete} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={prev}
            className={`px-6 py-2.5 text-sm rounded-full transition-all ${
              step === 0
                ? "opacity-0 pointer-events-none"
                : "text-chrono-text-secondary hover:text-chrono-text border border-chrono-border/50 hover:border-chrono-border"
            }`}
          >
            Back
          </button>

          {step < steps.length - 1 && (
            <button
              onClick={next}
              className="px-8 py-2.5 text-sm bg-gradient-to-r from-chrono-accent to-chrono-accent-warm text-white rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function WelcomeStep() {
  return (
    <div className="text-center">
      {/* Logo animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
        className="mx-auto mb-8 relative w-20 h-20"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-chrono-accent to-chrono-accent-warm opacity-80" />
        <div className="absolute inset-[4px] rounded-full bg-chrono-bg" />
        <div className="absolute inset-[8px] rounded-full bg-gradient-to-br from-chrono-accent to-chrono-accent-warm opacity-60" />
        <div className="absolute inset-0 rounded-full animate-pulse-glow" style={{ boxShadow: "0 0 40px rgba(167,139,250,0.3)" }} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-5xl font-display font-bold mb-4"
      >
        Welcome to <span className="gradient-text">Chrono</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="text-lg text-chrono-text-secondary max-w-md mx-auto leading-relaxed"
      >
        Your life is a story worth telling. Chrono transforms your memories, milestones, and moments into a beautiful, interactive timeline.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-6 mt-10"
      >
        {[
          { label: "AI Stories", icon: "sparkles" },
          { label: "Interactive Maps", icon: "map" },
          { label: "Life Insights", icon: "chart" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="flex items-center gap-2 text-xs text-chrono-muted"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-chrono-accent" />
            {item.label}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function ExplainStep() {
  const steps = [
    {
      number: "01",
      title: "Add your memories",
      description: "Create events manually, import photos, or connect your calendar. Every moment counts.",
      color: "#a78bfa",
    },
    {
      number: "02",
      title: "Watch your timeline come alive",
      description: "See your life organized beautifully by year, with interactive maps and category breakdowns.",
      color: "#f9a8d4",
    },
    {
      number: "03",
      title: "Discover your story",
      description: "AI generates emotional, personalized narratives about your life chapters and milestones.",
      color: "#67e8f9",
    },
  ];

  return (
    <div>
      <div className="text-center mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-display font-bold mb-3"
        >
          How Chrono works
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-chrono-text-secondary"
        >
          Three steps to your personal life story
        </motion.p>
      </div>

      <div className="space-y-4">
        {steps.map((s, i) => (
          <motion.div
            key={s.number}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.12 }}
            className="flex items-start gap-5 bg-chrono-card/40 rounded-2xl p-5 border border-chrono-border/30"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-display font-bold flex-shrink-0"
              style={{ backgroundColor: `${s.color}15`, color: s.color }}
            >
              {s.number}
            </div>
            <div>
              <h3 className="font-display font-semibold text-chrono-text mb-1">{s.title}</h3>
              <p className="text-sm text-chrono-text-secondary leading-relaxed">{s.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ChooseStep({ onComplete }: { onComplete: (choice: "demo" | "manual" | "import") => void }) {
  const options = [
    {
      id: "demo" as const,
      title: "Explore with demo data",
      description: "See Chrono in action with a sample life timeline. You can always clear this later.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      color: "#a78bfa",
      recommended: true,
    },
    {
      id: "manual" as const,
      title: "Start from scratch",
      description: "Create your timeline manually by adding events one by one. Full control over your story.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
      color: "#f9a8d4",
      recommended: false,
    },
    {
      id: "import" as const,
      title: "Import later",
      description: "Skip setup for now. You can import photos, connect Google Calendar, or add events anytime.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      ),
      color: "#67e8f9",
      recommended: false,
    },
  ];

  return (
    <div>
      <div className="text-center mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-display font-bold mb-3"
        >
          How would you like to start?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-chrono-text-secondary"
        >
          You can always change this later
        </motion.p>
      </div>

      <div className="space-y-3">
        {options.map((option, i) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            onClick={() => onComplete(option.id)}
            className="w-full group relative bg-chrono-card/40 rounded-2xl p-5 border border-chrono-border/30 hover:border-chrono-border/60 transition-all text-left flex items-start gap-5 card-hover"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" style={{ background: `linear-gradient(135deg, ${option.color}05, transparent)` }} />
            <div
              className="relative w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${option.color}15`, color: option.color }}
            >
              {option.icon}
            </div>
            <div className="relative flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-chrono-text">{option.title}</h3>
                {option.recommended && (
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-chrono-accent/20 text-chrono-accent font-medium uppercase tracking-wider">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-sm text-chrono-text-secondary leading-relaxed mt-1">{option.description}</p>
            </div>
            <svg className="relative w-5 h-5 text-chrono-muted group-hover:text-chrono-text transition-colors flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
