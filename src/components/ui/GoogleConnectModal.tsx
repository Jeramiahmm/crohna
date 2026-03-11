"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ConnectState = "idle" | "loading" | "success";

interface GoogleConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: "Google Photos" | "Google Calendar";
  onConnect: () => void;
  onDisconnect: () => void;
  isConnected: boolean;
}

export default function GoogleConnectModal({
  isOpen,
  onClose,
  service,
  onConnect,
  onDisconnect,
  isConnected,
}: GoogleConnectModalProps) {
  const [state, setState] = useState<ConnectState>(isConnected ? "success" : "idle");

  useEffect(() => {
    if (isOpen) {
      setState(isConnected ? "success" : "idle");
    }
  }, [isOpen, isConnected]);

  const handleConnect = () => {
    setState("loading");
    setTimeout(() => {
      setState("success");
      onConnect();
    }, 2000);
  };

  const handleDisconnect = () => {
    onDisconnect();
    setState("idle");
  };

  const successMessage =
    service === "Google Photos"
      ? "Connected — 1,842 photos found"
      : "Connected — calendar imported";

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md bg-chrono-surface border border-[var(--border)] rounded-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <h2 className="text-lg font-display font-bold text-chrono-text">{service}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-chrono-card flex items-center justify-center text-chrono-muted hover:text-chrono-text transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {state === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6"
                  >
                    <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-chrono-card flex items-center justify-center">
                      <svg className="w-7 h-7 text-chrono-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                      </svg>
                    </div>
                    <p className="text-sm font-body font-light text-chrono-muted mb-6 max-w-xs mx-auto">
                      Connect your Google account to import memories automatically
                    </p>
                    <button
                      onClick={handleConnect}
                      className="px-8 py-3 text-sm font-body font-medium bg-foreground text-background rounded-full hover:opacity-90 transition-opacity"
                    >
                      Connect {service}
                    </button>
                  </motion.div>
                )}

                {state === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-10"
                  >
                    <div className="w-10 h-10 mx-auto mb-5 border-2 border-chrono-muted/30 border-t-chrono-text rounded-full animate-spin" />
                    <p className="text-sm font-body font-light text-chrono-text">
                      Connecting to Google...
                    </p>
                  </motion.div>
                )}

                {state === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6"
                  >
                    <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-green-500/10 flex items-center justify-center">
                      <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-body font-light text-chrono-text mb-6">
                      {successMessage}
                    </p>
                    <button
                      onClick={handleDisconnect}
                      className="px-6 py-2 text-xs font-body font-light text-red-400/70 hover:text-red-400 border border-red-400/20 hover:border-red-400/40 rounded-full transition-all"
                    >
                      Disconnect
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
