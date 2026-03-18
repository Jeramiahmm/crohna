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
    const text = `${title}\n${"=".repeat(title.length)}\n\n${content}${highlights ? "\n\nHighlights:\n" + highlights.map((h) => `  - ${h}`).join("\n") : ""}${stats ? "\n\nStats:\n" + Object.entries(stats).map(([k, v]) => `  ${k}: ${v}`).join("\n") : ""}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crohna-${type}-${title.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }, [title, content, highlights, stats, type]);

  const handleShare = useCallback(async () => {
    const text = `${title}\n\n${content}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
      } catch {
        // User cancelled or share failed, fall back to copy
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [title, content]);

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
            className="fixed inset-x-4 top-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-[70] bg-chrono-surface border border-[var(--line-strong)] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-[var(--line-strong)]">
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
                className="relative bg-gradient-to-br from-chrono-bg via-chrono-surface to-chrono-bg p-6 border border-[var(--line-strong)] overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--line-hover)] to-transparent" />

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded-full bg-[var(--muted)]" />
                  <span className="text-[10px] text-chrono-muted uppercase tracking-[0.15em]">Crohna</span>
                  <span className="text-[10px] text-chrono-muted">
                    {type === "year-review" ? "Year in Review" : type === "story" ? "Story" : "Timeline"}
                  </span>
                </div>

                <h3 className="text-xl font-display font-light gradient-text mb-3">{title}</h3>
                <p className="text-sm text-chrono-muted leading-relaxed line-clamp-4">{content}</p>

                {highlights && highlights.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    {highlights.slice(0, 3).map((h, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-chrono-glow mt-1.5 flex-shrink-0" />
                        <span className="text-xs text-chrono-muted">{h}</span>
                      </div>
                    ))}
                  </div>
                )}

                {stats && (
                  <div className="flex gap-4 mt-4 pt-4 border-t border-[var(--line-strong)]">
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

            <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleCopy}
                className="flex flex-col items-center gap-2 py-3 bg-[var(--card-bg)] border border-[var(--line-strong)] hover:border-[var(--line-hover)] transition-all"
              >
                {copied ? (
                  <svg className="w-5 h-5 text-chrono-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-chrono-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                className="flex flex-col items-center gap-2 py-3 bg-[var(--card-bg)] border border-[var(--line-strong)] hover:border-[var(--line-hover)] transition-all disabled:opacity-50"
              >
                {exporting ? (
                  <div className="w-5 h-5 border-2 border-chrono-muted/30 border-t-chrono-text rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 text-chrono-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                )}
                <span className="text-[10px] text-chrono-muted uppercase tracking-wider">Download</span>
              </button>

              <button
                onClick={handleShare}
                className="flex flex-col items-center gap-2 py-3 bg-[var(--muted)] border border-[var(--line-strong)] hover:bg-[var(--card-bg)] transition-all"
              >
                <svg className="w-5 h-5 text-chrono-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
                <span className="text-[10px] text-chrono-accent uppercase tracking-wider">Share</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
