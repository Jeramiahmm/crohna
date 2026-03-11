"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
  message: string;
  isVisible: boolean;
}

export default function Toast({ message, isVisible }: ToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div className="px-5 py-3 bg-[rgba(15,15,15,0.95)] backdrop-blur-xl border border-white/[0.15] rounded-full shadow-xl">
            <span className="text-sm font-body font-light text-white/90">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
