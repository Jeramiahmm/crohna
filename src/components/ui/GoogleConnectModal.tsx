"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useFocusTrap } from "@/hooks/useFocusTrap";

type ConnectState = "idle" | "loading" | "success" | "error";

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
  const modalRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ConnectState>(isConnected ? "success" : "idle");
  const [importCount, setImportCount] = useState<number | null>(null);
  const [importWarning, setImportWarning] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  useFocusTrap(modalRef, isOpen);

  useEffect(() => {
    if (isOpen) {
      setState(isConnected ? "success" : "idle");
      setImportCount(null);
      setImportWarning(null);
      setErrorMessage("");
    }
  }, [isOpen, isConnected]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleConnect = async () => {
    setState("loading");
    setErrorMessage("");

    const endpoint = service === "Google Calendar"
      ? "/api/google/calendar"
      : "/api/google/photos";

    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setErrorMessage(data.error || "Connection failed. Please try again.");
        toast.error(data.error || "Connection failed");
        return;
      }

      setImportCount(data.imported || 0);
      if (data.warning) {
        setImportWarning(data.warning);
      }
      setState("success");
      onConnect();
      toast.success(`Imported ${data.imported || 0} items from ${service}`);
    } catch {
      setState("error");
      setErrorMessage("Connection failed. Please check your internet and try again.");
      toast.error("Connection failed");
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
    setState("idle");
    setImportCount(null);
    toast.success(`${service} disconnected`);
  };

  const successMessage = importCount !== null
    ? `Connected — ${importCount} ${service === "Google Photos" ? "photos" : "events"} imported`
    : service === "Google Photos"
      ? "Connected — photos synced"
      : "Connected — calendar synced";

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
            ref={modalRef}
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
                    <p className="text-sm font-body font-light text-chrono-muted mb-4 max-w-xs mx-auto">
                      {service === "Google Photos"
                        ? "Import your recent photos as timeline events automatically"
                        : "Import your calendar events into your life timeline"}
                    </p>
                    <p className="text-xs font-body font-light text-chrono-muted/60 mb-6 max-w-xs mx-auto">
                      {service === "Google Photos"
                        ? "Up to 500 photos from the last 2 years will be imported"
                        : "Calendar events will be imported and deduplicated"}
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
                      {service === "Google Photos"
                        ? "Importing your photos..."
                        : "Importing calendar events..."}
                    </p>
                    <p className="text-xs font-body font-light text-chrono-muted mt-2">
                      {service === "Google Photos"
                        ? "Fetching up to 500 photos — this may take a moment"
                        : "Syncing your calendar — this may take a moment"}
                    </p>
                    <div className="mt-4 w-48 mx-auto h-1 bg-[var(--line-strong)] rounded-full overflow-hidden">
                      <div className="h-full bg-chrono-text/30 rounded-full animate-pulse" style={{ width: "60%" }} />
                    </div>
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
                    <p className="text-sm font-body font-light text-chrono-text mb-2">
                      {successMessage}
                    </p>
                    <p className="text-xs font-body font-light text-chrono-muted mb-2">
                      Events are now in your timeline
                    </p>
                    {importWarning && (
                      <p className="text-xs font-body font-light text-yellow-500/80 mb-4 max-w-xs mx-auto">
                        {importWarning}
                      </p>
                    )}
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={handleConnect}
                        className="px-5 py-2 text-xs font-body font-light border border-[var(--line-strong)] text-chrono-muted hover:text-chrono-text hover:border-[var(--line-hover)] rounded-full transition-all"
                      >
                        Sync again
                      </button>
                      <button
                        onClick={handleDisconnect}
                        className="px-5 py-2 text-xs font-body font-light text-red-400/70 hover:text-red-400 border border-red-400/20 hover:border-red-400/40 rounded-full transition-all"
                      >
                        Disconnect
                      </button>
                    </div>
                  </motion.div>
                )}

                {state === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6"
                  >
                    <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-500/10 flex items-center justify-center">
                      <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                    </div>
                    <p className="text-sm font-body font-light text-chrono-text mb-2">
                      Connection failed
                    </p>
                    <p className="text-xs font-body font-light text-chrono-muted mb-6 max-w-xs mx-auto">
                      {errorMessage}
                    </p>
                    <button
                      onClick={handleConnect}
                      className="px-8 py-3 text-sm font-body font-medium bg-foreground text-background rounded-full hover:opacity-90 transition-opacity"
                    >
                      Try again
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
