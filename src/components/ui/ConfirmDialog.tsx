"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-sm bg-chrono-surface border border-[var(--border)] rounded-lg p-6"
            role="alertdialog"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
          >
            <h2
              id="confirm-title"
              className="text-lg font-display font-bold text-chrono-text mb-2"
            >
              {title}
            </h2>
            <p
              id="confirm-desc"
              className="text-sm font-body font-light text-chrono-muted mb-6"
            >
              {description}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2 text-sm font-body font-light text-chrono-muted border border-[var(--line-strong)] hover:border-[var(--line-hover)] hover:text-chrono-text rounded-full transition-all disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`px-5 py-2 text-sm font-body font-light rounded-full transition-all disabled:opacity-50 ${
                  destructive
                    ? "bg-red-500/90 text-white hover:bg-red-500"
                    : "bg-foreground text-background hover:opacity-90"
                }`}
              >
                {loading ? "..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
