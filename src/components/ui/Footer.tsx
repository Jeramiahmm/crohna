"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-chrono-border/30 bg-chrono-bg">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="relative w-7 h-7">
                <div className="absolute inset-0 rounded-full bg-chrono-accent/30" />
                <div className="absolute inset-[2px] rounded-full bg-chrono-bg" />
                <div className="absolute inset-[5px] rounded-full bg-chrono-accent/20" />
              </div>
              <span className="text-lg font-display font-semibold">Chrono</span>
            </Link>
            <p className="text-chrono-muted text-sm max-w-sm leading-relaxed">
              Your life, beautifully mapped. Transform your memories into
              a stunning visual timeline.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-chrono-muted mb-4">
              Product
            </h4>
            <div className="flex flex-col gap-2">
              {["Timeline", "Stories", "Map", "Insights"].map((item) => (
                <span
                  key={item}
                  className="text-sm text-chrono-text-secondary hover:text-chrono-text cursor-pointer transition-colors"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-chrono-muted mb-4">
              Connect
            </h4>
            <div className="flex flex-col gap-2">
              {["Twitter", "GitHub", "Discord", "Blog"].map((item) => (
                <span
                  key={item}
                  className="text-sm text-chrono-text-secondary hover:text-chrono-text cursor-pointer transition-colors"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-chrono-border/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-chrono-muted">
            &copy; {new Date().getFullYear()} Chrono. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <span
                key={item}
                className="text-xs text-chrono-muted hover:text-chrono-text-secondary cursor-pointer transition-colors"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
