"use client";

import { motion } from "framer-motion";

interface Category {
  name: string;
  count: number;
  color: string;
}

export default function CategoryChart({ categories }: { categories: Category[] }) {
  const maxCount = Math.max(...categories.map((c) => c.count));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="bg-chrono-card/40 rounded-2xl p-6 md:p-8 border border-chrono-border/20"
    >
      <h3 className="text-lg font-display font-semibold text-chrono-text mb-6">
        Events by Category
      </h3>

      <div className="space-y-4">
        {categories.map((category, i) => (
          <div key={category.name} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-chrono-text-secondary">
                {category.name}
              </span>
              <span className="text-sm font-medium text-chrono-text">
                {category.count}
              </span>
            </div>
            <div className="h-1.5 bg-chrono-bg rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(category.count / maxCount) * 100}%` }}
                viewport={{ once: true }}
                transition={{
                  duration: 1.2,
                  delay: 0.2 + i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="h-full rounded-full"
                style={{ backgroundColor: category.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
