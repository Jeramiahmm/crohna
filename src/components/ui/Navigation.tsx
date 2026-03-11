"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Clock, BarChart3, Map, Settings } from "lucide-react";
import { NavBar } from "./tubelight-navbar";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/timeline", label: "Timeline" },
  { href: "/insights", label: "Insights" },
  { href: "/map", label: "Map" },
  { href: "/settings", label: "Settings" },
];

const tubelightItems = [
  { name: "Home", url: "/", icon: Home },
  { name: "Timeline", url: "/timeline", icon: Clock },
  { name: "Insights", url: "/insights", icon: BarChart3 },
  { name: "Map", url: "/map", icon: Map },
  { name: "Settings", url: "/settings", icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Desktop: Tubelight Navbar */}
      <div className="hidden md:block">
        <NavBar items={tubelightItems} />
      </div>

      {/* Mobile: hamburger nav with fullscreen overlay */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 md:hidden transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-xl bg-chrono-bg/90 border-b border-white/[0.12] py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-white/60 text-base leading-none select-none">&#x2022;</span>
            <span className="text-[13px] font-display font-bold tracking-[0.25em] uppercase text-chrono-text">
              Chrono
            </span>
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex flex-col gap-1.5 p-2"
          >
            <motion.span
              animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 6 : 0 }}
              className="w-5 h-[1px] bg-white/80 block"
            />
            <motion.span
              animate={{ opacity: mobileOpen ? 0 : 1 }}
              className="w-5 h-[1px] bg-white/80 block"
            />
            <motion.span
              animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -6 : 0 }}
              className="w-5 h-[1px] bg-white/80 block"
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Fullscreen Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-chrono-bg/98 backdrop-blur-2xl pt-24 px-8 md:hidden"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block text-3xl font-display font-bold py-3 ${
                      pathname === item.href
                        ? "text-white"
                        : "text-chrono-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-12 flex flex-col gap-4">
              <button className="w-full py-3 text-sm font-body font-light text-chrono-muted border border-white/[0.12] rounded-full">
                Sign In
              </button>
              <button className="w-full py-3 text-sm font-body font-light bg-white text-black rounded-full">
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
