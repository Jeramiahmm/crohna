"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { TimelineEvent } from "@/data/demo";

interface MemoryStreakTrackerProps {
  events: TimelineEvent[];
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function MemoryStreakTracker({ events }: MemoryStreakTrackerProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; title: string; date: string; category: string } | null>(null);

  const { grid, monthLabels } = useMemo(() => {
    const year = new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const startDay = startDate.getDay(); // 0=Sun

    // Build map of date -> events
    const dateMap: Record<string, TimelineEvent[]> = {};
    events.forEach((evt) => {
      const d = evt.date.slice(0, 10);
      if (d.startsWith(String(year))) {
        if (!dateMap[d]) dateMap[d] = [];
        dateMap[d].push(evt);
      }
    });

    // Also add some simulated data for the current year to make it look good
    // since demo data is 2022-2024, let's map some to current year for display
    events.forEach((evt) => {
      const origDate = new Date(evt.date);
      const mapped = `${year}-${String(origDate.getMonth() + 1).padStart(2,"0")}-${String(origDate.getDate()).padStart(2,"0")}`;
      if (!dateMap[mapped]) dateMap[mapped] = [];
      if (!dateMap[mapped].find(e => e.id === evt.id)) {
        dateMap[mapped].push(evt);
      }
    });

    // Build grid: 53 columns x 7 rows
    const cells: { date: string; count: number; events: TimelineEvent[]; col: number; row: number }[] = [];
    const mLabels: { label: string; col: number }[] = [];
    let lastMonth = -1;

    for (let col = 0; col < 53; col++) {
      for (let row = 0; row < 7; row++) {
        const dayOffset = col * 7 + row - startDay;
        const d = new Date(year, 0, 1 + dayOffset);
        if (d.getFullYear() !== year) {
          cells.push({ date: "", count: 0, events: [], col, row });
          continue;
        }
        const dateStr = `${year}-${String(d.getMonth() + 1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
        const dayEvents = dateMap[dateStr] || [];

        if (d.getMonth() !== lastMonth && d.getDate() <= 7) {
          mLabels.push({ label: MONTHS[d.getMonth()], col });
          lastMonth = d.getMonth();
        }

        cells.push({ date: dateStr, count: dayEvents.length, events: dayEvents, col, row });
      }
    }

    return { grid: cells, monthLabels: mLabels };
  }, [events]);

  const getOpacity = (count: number): string => {
    if (count === 0) return "rgba(255,255,255,0.06)";
    if (count === 1) return "rgba(255,255,255,0.3)";
    if (count === 2) return "rgba(255,255,255,0.6)";
    return "rgba(255,255,255,1)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
    >
      <span className="section-label mb-6 block">Your Memory Map</span>

      <div className="relative overflow-x-auto pb-2 -mx-2 px-2" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="relative" style={{ minWidth: "900px" }}>
          {/* Month labels */}
          <div className="flex mb-2" style={{ paddingLeft: "0px" }}>
            {monthLabels.map((m, i) => (
              <div
                key={`${m.label}-${i}`}
                className="text-[10px] font-mono text-white/40 absolute"
                style={{ left: `${m.col * 17}px` }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="relative mt-5" style={{ height: `${7 * 17}px` }}>
            {grid.map((cell, i) => {
              if (!cell.date) return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${cell.col * 17}px`,
                    top: `${cell.row * 17}px`,
                    width: "14px",
                    height: "14px",
                  }}
                />
              );
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${cell.col * 17}px`,
                    top: `${cell.row * 17}px`,
                    width: "14px",
                    height: "14px",
                    backgroundColor: getOpacity(cell.count),
                    borderRadius: "2px",
                    cursor: cell.count > 0 ? "pointer" : "default",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (cell.count > 0) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        x: rect.left + rect.width / 2,
                        y: rect.top - 8,
                        title: cell.events[0].title + (cell.count > 1 ? ` +${cell.count - 1} more` : ""),
                        date: cell.date,
                        category: cell.events[0].category || "",
                      });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="px-3 py-2 bg-[rgba(15,15,15,0.95)] backdrop-blur-xl border border-white/[0.15] rounded-lg shadow-xl">
            <p className="text-xs font-mono text-white/90 mb-0.5">{tooltip.title}</p>
            <p className="text-[10px] font-mono text-white/50">{tooltip.date}</p>
            {tooltip.category && (
              <p className="text-[10px] font-mono text-white/40 mt-0.5">{tooltip.category}</p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
