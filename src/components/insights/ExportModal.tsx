"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { TimelineEvent } from "@/data/demo";
import { formatDate } from "@/lib/utils";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: TimelineEvent[];
}

export default function ExportModal({ isOpen, onClose, events }: ExportModalProps) {
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleExportPDF = useCallback(async () => {
    setExporting(true);
    try {
      // Load jsPDF from CDN
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      document.head.appendChild(script);

      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load jsPDF"));
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF();

      // Dark-styled header
      doc.setFillColor(8, 8, 8);
      doc.rect(0, 0, 210, 297, "F");

      doc.setTextColor(240, 235, 225);
      doc.setFontSize(28);
      doc.text("CHRONO", 20, 30);

      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text("Your Life, Beautifully Mapped", 20, 38);

      doc.setDrawColor(50, 50, 50);
      doc.line(20, 44, 190, 44);

      let y = 55;
      const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      sortedEvents.forEach((evt) => {
        if (y > 270) {
          doc.addPage();
          doc.setFillColor(8, 8, 8);
          doc.rect(0, 0, 210, 297, "F");
          y = 20;
        }

        doc.setTextColor(240, 235, 225);
        doc.setFontSize(13);
        doc.text(evt.title, 20, y);
        y += 6;

        doc.setTextColor(120, 120, 120);
        doc.setFontSize(9);
        const meta = [formatDate(evt.date), evt.location, evt.category].filter(Boolean).join(" · ");
        doc.text(meta, 20, y);
        y += 5;

        if (evt.description) {
          doc.setTextColor(160, 160, 160);
          doc.setFontSize(9);
          const lines = doc.splitTextToSize(evt.description, 170);
          doc.text(lines.slice(0, 3), 20, y);
          y += Math.min(lines.length, 3) * 4.5;
        }

        y += 8;
      });

      doc.save("chrono-memories.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
    }
    setExporting(false);
  }, [events]);

  const handleExportBook = useCallback(() => {
    // Create print-specific styles
    const style = document.createElement("style");
    style.id = "chrono-print-styles";
    style.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        #chrono-print-content, #chrono-print-content * { visibility: visible !important; }
        #chrono-print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .chrono-print-page {
          page-break-after: always;
          padding: 60px 40px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: monospace;
        }
        .chrono-print-photo {
          width: 100%;
          height: 300px;
          background: #f0f0f0;
          border: 1px solid #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 14px;
          margin-bottom: 30px;
        }
        .chrono-print-title {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 20px;
          font-family: monospace;
        }
        .chrono-print-desc {
          font-size: 14px;
          line-height: 1.8;
          flex: 1;
          font-family: monospace;
        }
        .chrono-print-meta {
          font-size: 11px;
          color: #666;
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-family: monospace;
        }
      }
    `;
    document.head.appendChild(style);

    // Create print content
    const container = document.createElement("div");
    container.id = "chrono-print-content";

    const sorted = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    sorted.forEach((evt) => {
      const page = document.createElement("div");
      page.className = "chrono-print-page";
      page.innerHTML = `
        <div class="chrono-print-photo">[Photo: ${evt.title}]</div>
        <div class="chrono-print-title">${evt.title}</div>
        <div class="chrono-print-desc">${evt.description || ""}</div>
        <div class="chrono-print-meta">${formatDate(evt.date)}${evt.location ? " · " + evt.location : ""}</div>
      `;
      container.appendChild(page);
    });

    document.body.appendChild(container);
    window.print();

    // Cleanup after print
    setTimeout(() => {
      container.remove();
      style.remove();
    }, 1000);
  }, [events]);

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
            className="fixed inset-x-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-[70] bg-chrono-surface border border-white/[0.12] overflow-hidden"
            style={{ top: "50%", transform: "translate(-50%, -50%)" }}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
              <h2 className="text-lg font-display font-bold text-chrono-text">Export Memories</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-chrono-card flex items-center justify-center text-chrono-muted hover:text-chrono-text transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Option 1: PDF */}
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="w-full text-left p-5 bg-chrono-card/30 border border-white/[0.08] hover:border-white/20 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.1] transition-colors">
                    <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-bold text-chrono-text mb-1">Export as PDF</h3>
                    <p className="text-xs font-body font-extralight text-chrono-muted leading-relaxed">
                      Download a formatted PDF with all your memories — titles, dates, locations, and descriptions in a clean dark layout.
                    </p>
                  </div>
                  {exporting && (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin flex-shrink-0" />
                  )}
                </div>
              </button>

              {/* Option 2: Book */}
              <button
                onClick={handleExportBook}
                className="w-full text-left p-5 bg-chrono-card/30 border border-white/[0.08] hover:border-white/20 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.1] transition-colors">
                    <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-bold text-chrono-text mb-1">Export as Book Layout</h3>
                    <p className="text-xs font-body font-extralight text-chrono-muted leading-relaxed">
                      Open the print dialog with each memory as its own page — photo placeholder, title, description, and details in a monospace aesthetic.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
