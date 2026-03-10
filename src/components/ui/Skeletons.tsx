"use client";

import { motion } from "framer-motion";

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <div className="absolute inset-0 bg-chrono-card/60" />
      <motion.div
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-chrono-border/20 to-transparent"
      />
    </div>
  );
}

export function TimelineCardSkeleton() {
  return (
    <div className="bg-chrono-card/40 rounded-2xl overflow-hidden border border-chrono-border/20">
      <Shimmer className="h-48" />
      <div className="p-6 space-y-3">
        <Shimmer className="h-3 w-24" />
        <Shimmer className="h-5 w-3/4" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-2/3" />
        <Shimmer className="h-3 w-20 mt-4" />
      </div>
    </div>
  );
}

export function StoryCardSkeleton() {
  return (
    <div className="bg-chrono-card/40 rounded-3xl p-8 md:p-10 border border-chrono-border/20">
      <div className="flex items-center gap-3 mb-6">
        <Shimmer className="h-6 w-24 rounded-full" />
        <Shimmer className="h-4 w-16" />
      </div>
      <Shimmer className="h-8 w-2/3 mb-4" />
      <div className="space-y-2 mb-6">
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-4 w-3/4" />
      </div>
      <div className="space-y-2 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-1 h-1 rounded-full bg-chrono-border/40" />
            <Shimmer className="h-3 w-3/4" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-chrono-bg/30 rounded-xl p-4">
            <Shimmer className="h-5 w-12 mb-2" />
            <Shimmer className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-chrono-card/40 rounded-2xl p-6 border border-chrono-border/20">
      <Shimmer className="h-8 w-16 mb-2" />
      <Shimmer className="h-3 w-24" />
    </div>
  );
}

export function AIStoryLoadingSkeleton() {
  return (
    <div className="relative bg-chrono-card/40 rounded-3xl p-8 md:p-10 border border-chrono-border/20 overflow-hidden">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="relative w-16 h-16 mb-6"
        >
          <div className="absolute inset-0 rounded-full border-2 border-chrono-border/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-chrono-accent" />
          <div className="absolute inset-[6px] rounded-full border-2 border-transparent border-t-chrono-accent-warm" style={{ animationDelay: "0.5s" }} />
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm text-chrono-text-secondary font-display"
        >
          AI is crafting your story...
        </motion.p>
        <p className="text-xs text-chrono-muted mt-2">Analyzing your events and memories</p>
      </div>
    </div>
  );
}
