"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-[var(--line-strong)] bg-chrono-bg">
      <div className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <span className="text-chrono-muted text-base leading-none select-none">&#x2022;</span>
              <span className="text-[13px] font-display font-bold tracking-[0.25em] uppercase text-chrono-text">
                Chrono
              </span>
            </Link>
            <p className="text-chrono-muted text-sm font-body font-extralight max-w-sm leading-relaxed">
              A visual timeline of your memories,
              milestones, and places — rendered with care.
            </p>
          </div>

          <div>
            <h4 className="section-label mb-6">
              Product
            </h4>
            <div className="flex flex-col gap-3">
              {["Timeline", "Stories", "Map", "Insights"].map((item) => (
                <span
                  key={item}
                  className="text-sm font-body font-extralight text-chrono-muted hover:text-chrono-text cursor-pointer transition-colors duration-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="section-label mb-6">
              Connect
            </h4>
            <div className="flex flex-col gap-3">
              {["Twitter", "GitHub", "Discord", "Blog"].map((item) => (
                <span
                  key={item}
                  className="text-sm font-body font-extralight text-chrono-muted hover:text-chrono-text cursor-pointer transition-colors duration-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-[var(--line)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-body font-extralight text-chrono-muted">
            &copy; {new Date().getFullYear()} Chrono. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <span
                key={item}
                className="text-xs font-body font-extralight text-chrono-muted hover:text-chrono-text cursor-pointer transition-colors duration-300"
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
