"use client";

import Link from "next/link";

const productLinks = [
  { label: "Timeline", href: "/timeline" },
  { label: "Stories", href: "/insights" },
  { label: "Map", href: "/map" },
  { label: "Insights", href: "/insights" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-[var(--line-strong)] bg-chrono-bg">
      <div className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <span className="text-chrono-muted text-base leading-none select-none">&#x2022;</span>
              <span className="text-[13px] font-display font-bold tracking-[0.25em] uppercase text-chrono-text">
                Crohna
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
              {productLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-body font-extralight text-chrono-muted hover:text-chrono-text transition-colors duration-300"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="section-label mb-6">
              Navigate
            </h4>
            <div className="flex flex-col gap-3">
              <Link href="/settings" className="text-sm font-body font-extralight text-chrono-muted hover:text-chrono-text transition-colors duration-300">
                Settings
              </Link>
              <Link href="/" className="text-sm font-body font-extralight text-chrono-muted hover:text-chrono-text transition-colors duration-300">
                Home
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-[var(--line)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-body font-extralight text-chrono-muted">
            &copy; {new Date().getFullYear()} Crohna. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
