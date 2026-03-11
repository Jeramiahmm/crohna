"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

interface OAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  onConnect: () => void;
}

export default function OAuthModal({ isOpen, onClose, serviceName, onConnect }: OAuthModalProps) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConnecting(false);
      setConnected(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setConnecting(false);
    setConnected(true);
    onConnect();
    setTimeout(() => onClose(), 1500);
  }, [onConnect, onClose]);

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
            className="fixed inset-x-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-sm z-[70] bg-chrono-surface border border-white/[0.12] overflow-hidden"
            style={{ top: "50%", transform: "translate(-50%, -50%)" }}
          >
            <div className="p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </div>

              <h3 className="text-lg font-display font-bold text-chrono-text mb-2">
                Connect {serviceName}
              </h3>
              <p className="text-xs font-body font-extralight text-chrono-muted mb-6 leading-relaxed">
                Chrono will request read-only access to import your data. You can disconnect at any time.
              </p>

              {connected ? (
                <div className="flex items-center justify-center gap-2 text-white/80">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-body font-light">Connected</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="w-full py-3 text-sm font-body font-light bg-white text-black rounded-full hover:bg-white/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {connecting && (
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    )}
                    {connecting ? "Connecting..." : `Connect ${serviceName}`}
                  </button>
                  <button
                    onClick={onClose}
                    className="text-sm font-body font-light text-white/40 hover:text-white/60 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
