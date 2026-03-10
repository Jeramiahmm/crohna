"use client";

import { motion } from "framer-motion";

interface CityData {
  city: string;
  count: number;
}

export default function CityChart({ data }: { data: CityData[] }) {
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="bg-chrono-card/40 rounded-2xl p-6 md:p-8 border border-chrono-border/20"
    >
      <h3 className="text-lg font-display font-semibold text-chrono-text mb-6">
        Most Visited Cities
      </h3>

      <div className="space-y-3">
        {data.map((item, i) => (
          <motion.div
            key={item.city}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="flex items-center gap-4"
          >
            <div className="w-24 md:w-32 text-sm text-chrono-text-secondary truncate text-right flex-shrink-0">
              {item.city}
            </div>
            <div className="flex-1 h-2 bg-chrono-bg rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(item.count / maxCount) * 100}%` }}
                viewport={{ once: true }}
                transition={{
                  duration: 1,
                  delay: 0.3 + i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="h-full rounded-full bg-gradient-to-r from-chrono-accent-warm/60 to-chrono-accent/60"
              />
            </div>
            <span className="text-sm font-medium text-chrono-text w-6 text-right">
              {item.count}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
