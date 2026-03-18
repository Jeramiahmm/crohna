"use client";

import { motion } from "framer-motion";

interface CityData {
  city: string;
  count: number;
}

export default function CityChart({ data }: { data: CityData[] }) {
  const maxCount = data.length === 0 ? 1 : Math.max(...data.map((d) => d.count));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[var(--card-bg)] p-4 sm:p-6 md:p-8 border border-[var(--line-strong)]"
    >
      <h3 className="text-lg font-display font-bold text-chrono-text mb-6">
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
            <div className="min-w-[5rem] max-w-[8rem] text-sm font-body font-light text-chrono-muted truncate text-right flex-shrink-0" title={item.city}>
              {item.city}
            </div>
            <div className="flex-1 h-[2px] bg-chrono-bg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(item.count / maxCount) * 100}%` }}
                viewport={{ once: true }}
                transition={{
                  duration: 1,
                  delay: 0.3 + i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="h-full"
                style={{ background: "linear-gradient(to right, var(--line-strong), var(--chrono-accent))" }}
              />
            </div>
            <span className="text-sm font-body font-light text-chrono-text w-6 text-right">
              {item.count}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
