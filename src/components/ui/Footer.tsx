"use client";

import Link from "next/link";

const productLinks: Record<string, string> = {
  Timeline: "/timeline",
  Stories: "/insights",
  Map: "/map",
  Insights: "/insights",
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.08] bg-chrono-bg">
      <div className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <span className="text-white/60 text-base leading-none select-none">&#x2022;</span>
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
              {Object.entries(productLinks).map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="text-sm font-body font-extralight hover:text-white cursor-pointer transition-colors duration-300"
                  style={{ color: "rgba(240,235,225,0.65)" }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="section-label mb-6">
              Connect
            </h4>
            <div className="flex flex-col gap-3">
              {["Twitter", "GitHub", "Discord", "Blog"].map((item) => (
                <button
                  key={item}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="text-sm font-body font-extralight hover:text-white cursor-pointer transition-colors duration-300 text-left"
                  style={{ color: "rgba(240,235,225,0.65)" }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-body font-extralight text-chrono-muted">
            &copy; {new Date().getFullYear()} Chrono. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <button
                key={item}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-xs font-body font-extralight text-chrono-muted hover:text-white cursor-pointer transition-colors duration-300"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
