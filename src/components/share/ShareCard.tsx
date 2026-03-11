"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback } from "react";

interface ShareCardProps {
  isOpen: boolean;
  onClose: () => void;
  type: "story" | "timeline" | "year-review";
  title: string;
  content: string;
  stats?: Record<string, string | number>;
  highlights?: string[];
}

export default function ShareCard({ isOpen, onClose, type, title, content, stats, highlights }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleCopy = useCallback(async () => {
    const text = `${title}\n\n${content}${highlights ? "\n\n" + highlights.map((h) => `- ${h}`).join("\n") : ""}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [title, content, highlights]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setExporting(false);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-[70] bg-chrono-surface border border-white/[0.08] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
              <h2 className="text-lg font-display font-light text-chrono-text">Share & Export</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-chrono-card flex items-center justify-center text-chrono-muted hover:text-chrono-text transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div
                ref={cardRef}
                className="relative bg-gradient-to-br from-chrono-bg via-chrono-surface to-chrono-bg p-6 border border-white/[0.08] overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded-full bg-white/[0.12]" />
                  <span className="text-[10px] text-chrono-muted uppercase tracking-[0.15em]">Chrono</span>
                  <span className="text-[10px] text-chrono-muted">
                    {type === "year-review" ? "Year in Review" : type === "story" ? "Story" : "Timeline"}
                  </span>
                </div>

                <h3 className="text-xl font-display font-light gradient-text mb-3">{title}</h3>
                <p className="text-sm text-chrono-text-secondary leading-relaxed line-clamp-4">{content}</p>

                {highlights && highlights.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    {highlights.slice(0, 3).map((h, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-white/30 mt-1.5 flex-shrink-0" />
                        <span className="text-xs text-chrono-text-secondary">{h}</span>
                      </div>
                    ))}
                  </div>
                )}

                {stats && (
                  <div className="flex gap-4 mt-4 pt-4 border-t border-white/[0.08]">
                    {Object.entries(stats).slice(0, 3).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-sm font-display font-bold text-chrono-text">{value}</div>
                        <div className="text-[9px] text-chrono-muted uppercase tracking-wider">{key}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 pb-6 grid grid-cols-3 gap-3">
              <button
                onClick={handleCopy}
                className="flex flex-col items-center gap-2 py-3 bg-chrono-card/40 border border-white/[0.08] hover:border-white/20 transition-all"
              >
                {copied ? (
                  <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-chrono-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                )}
                <span className="text-[10px] text-chrono-muted uppercase tracking-wider">
                  {copied ? "Copied" : "Copy"}
                </span>
              </button>

              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex flex-col items-center gap-2 py-3 bg-chrono-card/40 border border-white/[0.08] hover:border-white/20 transition-all disabled:opacity-50"
              >
                {exporting ? (
                  <div className="w-5 h-5 border-2 border-chrono-muted/30 border-t-white/50 rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 text-chrono-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                )}
                <span className="text-[10px] text-chrono-muted uppercase tracking-wider">Download</span>
              </button>

              <button className="flex flex-col items-center gap-2 py-3 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all">
                <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
                <span className="text-[10px] text-white/80 uppercase tracking-wider">Share</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
