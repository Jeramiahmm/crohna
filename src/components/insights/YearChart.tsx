"use client";

import { motion } from "framer-motion";

interface YearData {
  year: number;
  count: number;
}

export default function YearChart({ data }: { data: YearData[] }) {
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="bg-chrono-card/40 p-6 md:p-8 border border-white/[0.12]"
    >
      <h3 className="text-lg font-display font-bold text-chrono-text mb-6">
        Events by Year
      </h3>

      <div className="flex items-end gap-4 h-48">
        {data.map((item, i) => (
          <div key={item.year} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-sm font-body font-light text-chrono-text">
              {item.count}
            </span>
            <div className="w-full relative" style={{ height: "100%" }}>
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: `${(item.count / maxCount) * 100}%` }}
                viewport={{ once: true }}
                transition={{
                  duration: 1.2,
                  delay: 0.3 + i * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/50 to-white/15"
              />
            </div>
            <span className="text-xs font-body font-light text-chrono-muted">{item.year}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
