"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Home, Clock, BarChart3, Map, Settings, Search, Sun, Moon, X } from "lucide-react";
import { NavBar } from "./tubelight-navbar";
import { useTheme } from "./ThemeProvider";
import { useSession, signIn, signOut } from "next-auth/react";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Timeline", href: "/timeline", icon: Clock },
  { label: "Insights", href: "/insights", icon: BarChart3 },
  { label: "Map", href: "/map", icon: Map },
  { label: "Settings", href: "/settings", icon: Settings },
];

const tubelightItems = NAV_ITEMS.map((item) => ({
  name: item.label,
  url: item.href,
  icon: item.icon,
}));

function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 rounded-full flex items-center justify-center text-chrono-muted hover:text-chrono-text transition-colors"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Moon size={16} strokeWidth={2} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Sun size={16} strokeWidth={2} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

function SearchButton() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Sync local query state with URL on mount
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    if (urlQuery) {
      setQuery(urlQuery);
      setOpen(true);
    }
  }, [searchParams]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const updateSearchParam = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) {
        params.set("q", q);
      } else {
        params.delete("q");
      }
      const paramStr = params.toString();
      router.replace(`${pathname}${paramStr ? `?${paramStr}` : ""}`, { scroll: false });
    }, 300);
  }, [router, pathname, searchParams]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-search-bar]")) {
        setOpen(false);
        setQuery("");
        updateSearchParam("");
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        updateSearchParam("");
      }
    };
    window.addEventListener("keydown", handleEsc);
    window.addEventListener("click", handleClickOutside, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleEsc);
      window.removeEventListener("click", handleClickOutside, { capture: true });
    };
  }, [open, updateSearchParam]);

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="w-8 h-8 rounded-full flex items-center justify-center text-chrono-muted hover:text-chrono-text transition-colors"
        aria-label="Search memories"
        data-search-bar
      >
        <Search size={16} strokeWidth={2} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            data-search-bar
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-16 sm:top-20 left-0 right-0 z-50 overflow-hidden"
          >
            <div className="glass-strong px-6 py-4">
              <div className="max-w-xl mx-auto flex items-center gap-3">
                <Search size={16} className="text-chrono-muted flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    updateSearchParam(e.target.value);
                  }}
                  placeholder="Search memories..."
                  className="flex-1 bg-transparent text-sm text-chrono-text placeholder:text-chrono-muted outline-none font-body font-light"
                />
                <button
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                    updateSearchParam("");
                  }}
                  className="text-chrono-muted hover:text-chrono-text transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function UserMenu() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("click", handler, { capture: true });
    return () => window.removeEventListener("click", handler, { capture: true });
  }, [menuOpen]);

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn("google")}
        className="px-4 py-1.5 text-xs font-body font-light text-chrono-muted border border-[var(--line-strong)] hover:border-[var(--line-hover)] hover:text-chrono-text rounded-full transition-all"
      >
        Sign In
      </button>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-8 h-8 rounded-full overflow-hidden border border-[var(--line-strong)] hover:border-[var(--line-hover)] transition-colors"
      >
        {session.user.image ? (
          <Image src={session.user.image} alt={session.user.name || "Profile"} width={32} height={32} className="w-full h-full object-cover" />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-xs font-body text-chrono-muted">
            {session.user.name?.[0] || session.user.email?.[0]?.toUpperCase() || "U"}
          </span>
        )}
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-48 bg-[var(--card-bg)] border border-[var(--line-strong)] shadow-lg z-50"
          >
            <div className="px-4 py-3 border-b border-[var(--line)]">
              <div className="text-sm font-body font-light text-chrono-text truncate">{session.user.name}</div>
              <div className="text-xs font-body font-light text-chrono-muted truncate">{session.user.email}</div>
            </div>
            <Link href="/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-body font-light text-chrono-muted hover:text-chrono-text hover:bg-[var(--muted)] transition-colors">
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left px-4 py-2.5 text-sm font-body font-light text-red-400/70 hover:text-red-400 hover:bg-[var(--muted)] transition-colors"
            >
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = useCallback(() => setScrolled(window.scrollY > 60), []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const extraActions = (
    <>
      <SearchButton />
      <ThemeToggle />
      <UserMenu />
    </>
  );

  return (
    <>
      {/* Desktop: Tubelight Navbar */}
      <div className="hidden md:block">
        <NavBar items={tubelightItems} extraActions={extraActions} />
      </div>

      {/* Mobile: hamburger nav with fullscreen overlay */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 md:hidden transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-xl bg-chrono-bg/90 border-b border-[var(--line-strong)] py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-chrono-muted text-base leading-none select-none">&#x2022;</span>
            <span className="text-[13px] font-display font-bold tracking-[0.25em] uppercase text-chrono-text">
              Crohna
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <SearchButton />
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex flex-col gap-1.5 p-2"
            >
              <motion.span
                animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 6 : 0 }}
                className="w-5 h-[1px] bg-chrono-text block"
              />
              <motion.span
                animate={{ opacity: mobileOpen ? 0 : 1 }}
                className="w-5 h-[1px] bg-chrono-text block"
              />
              <motion.span
                animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -6 : 0 }}
                className="w-5 h-[1px] bg-chrono-text block"
              />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Fullscreen Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 backdrop-blur-2xl pt-24 px-8 md:hidden"
            style={{ background: "color-mix(in srgb, var(--chrono-bg) 98%, transparent)" }}
          >
            <div className="flex flex-col gap-4">
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block text-xl sm:text-2xl font-display font-bold py-3 ${
                      pathname === item.href
                        ? "text-chrono-text"
                        : "text-chrono-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-12 flex flex-col gap-4">
              {session?.user ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    {session.user.image ? (
                      <Image src={session.user.image} alt={session.user.name || "Profile"} width={40} height={40} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full border border-[var(--line-strong)] flex items-center justify-center text-chrono-muted">
                        {session.user.name?.[0] || "U"}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-body font-light text-chrono-text">{session.user.name}</div>
                      <div className="text-xs font-body font-light text-chrono-muted">{session.user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="w-full py-3 text-sm font-body font-light text-red-400/70 border border-[var(--line-strong)] rounded-full"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setMobileOpen(false); signIn("google", { callbackUrl: "/timeline" }); }}
                  className="w-full py-3 text-sm font-body font-light bg-foreground text-background rounded-full"
                >
                  Get Started
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
