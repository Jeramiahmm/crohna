"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";

interface ShareTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export default function ShareTimelineModal({ isOpen, onClose, onToast }: ShareTimelineModalProps) {
  const [shareId, setShareId] = useState("");
  const [accessMode, setAccessMode] = useState<"view" | "collab">("view");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      let id = localStorage.getItem("chrono-share-id");
      if (!id) {
        id = generateId();
        localStorage.setItem("chrono-share-id", id);
      }
      setShareId(id);
      setCopied(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleCopy = useCallback(async () => {
    const url = `chrono.app/view/${shareId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    onToast("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  }, [shareId, onToast]);

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
            className="fixed inset-x-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-[70] bg-chrono-surface border border-white/[0.12] overflow-hidden"
            style={{ top: "50%", transform: "translate(-50%, -50%)" }}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
              <h2 className="text-lg font-display font-bold text-chrono-text">Share Timeline</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-chrono-card flex items-center justify-center text-chrono-muted hover:text-chrono-text transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-2">Share Link</label>
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={`chrono.app/view/${shareId}`}
                    readOnly
                    className="flex-1 bg-chrono-card/40 px-4 py-3 text-sm font-mono text-chrono-text border border-white/[0.08] outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-4 py-3 bg-white text-black text-sm font-body font-light hover:bg-white/90 transition-colors flex items-center gap-1.5"
                  >
                    {copied ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      "Copy"
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-3">Access Mode</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAccessMode("view")}
                    className={`flex-1 py-2.5 text-sm font-body font-light text-center transition-all border rounded-full ${
                      accessMode === "view"
                        ? "bg-white/[0.08] border-white/20 text-white"
                        : "border-white/[0.08] text-white/50 hover:border-white/15"
                    }`}
                  >
                    View Only
                  </button>
                  <button
                    onClick={() => setAccessMode("collab")}
                    className={`flex-1 py-2.5 text-sm font-body font-light text-center transition-all border rounded-full ${
                      accessMode === "collab"
                        ? "bg-white/[0.08] border-white/20 text-white"
                        : "border-white/[0.08] text-white/50 hover:border-white/15"
                    }`}
                  >
                    Collaborative
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
