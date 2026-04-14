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
      className="w-8 h-8 rounded-xl flex items-center justify-center text-chrono-muted hover:text-chrono-text hover:bg-[var(--line)] transition-all duration-300"
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
            <Moon size={16} strokeWidth={1.8} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Sun size={16} strokeWidth={1.8} />
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
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const updateSearchParam = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      if (q) {
        params.set("q", q);
      } else {
        params.delete("q");
      }
      const paramStr = params.toString();
      router.replace(`${pathname}${paramStr ? `?${paramStr}` : ""}`, { scroll: false });
    }, 300);
  }, [router, pathname]);

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
        className="w-8 h-8 rounded-xl flex items-center justify-center text-chrono-muted hover:text-chrono-text hover:bg-[var(--line)] transition-all duration-300"
        aria-label="Search memories"
        data-search-bar
      >
        <Search size={16} strokeWidth={1.8} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            data-search-bar
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-20 left-0 right-0 z-50 overflow-hidden px-6"
          >
            <div className="max-w-xl mx-auto bg-[var(--card-bg)] rounded-2xl border border-[var(--line)] shadow-[0_8px_32px_rgba(0,0,0,0.06)] px-5 py-4">
              <div className="flex items-center gap-3">
                <Search size={16} className="text-chrono-muted flex-shrink-0" strokeWidth={1.8} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    updateSearchParam(e.target.value);
                  }}
                  placeholder="Search memories..."
                  maxLength={200}
                  className="flex-1 bg-transparent text-sm text-chrono-text placeholder:text-chrono-muted outline-none font-body font-normal"
                />
                <button
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                    updateSearchParam("");
                  }}
                  className="text-chrono-muted hover:text-chrono-text transition-colors"
                >
                  <X size={16} strokeWidth={1.8} />
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
        className="px-5 py-2 text-sm font-body font-medium text-white bg-chrono-accent hover:opacity-90 rounded-xl transition-all duration-300"
      >
        Sign In
      </button>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-8 h-8 rounded-xl overflow-hidden border border-[var(--line)] hover:border-[var(--line-hover)] transition-colors"
      >
        {session.user.image ? (
          <Image src={session.user.image} alt={session.user.name || "Profile"} width={32} height={32} className="w-full h-full object-cover" />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-xs font-body text-chrono-muted bg-chrono-surface">
            {session.user.name?.[0] || session.user.email?.[0]?.toUpperCase() || "U"}
          </span>
        )}
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-52 bg-[var(--card-bg)] border border-[var(--line)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-[var(--line)]">
              <div className="text-sm font-body font-medium text-chrono-text truncate">{session.user.name}</div>
              <div className="text-xs font-body text-chrono-muted truncate">{session.user.email}</div>
            </div>
            <Link href="/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-body text-chrono-muted hover:text-chrono-text hover:bg-[var(--line)] transition-all duration-200">
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left px-4 py-2.5 text-sm font-body text-red-500/70 hover:text-red-500 hover:bg-[var(--line)] transition-all duration-200"
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

      {/* Mobile: hamburger nav */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 md:hidden transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-xl bg-[var(--card-bg)]/90 border-b border-[var(--line)] py-3"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-[18px] font-body font-bold tracking-[-0.01em] text-chrono-text">
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
                className="w-5 h-[1.5px] bg-chrono-text block rounded-full"
              />
              <motion.span
                animate={{ opacity: mobileOpen ? 0 : 1 }}
                className="w-5 h-[1.5px] bg-chrono-text block rounded-full"
              />
              <motion.span
                animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -6 : 0 }}
                className="w-5 h-[1.5px] bg-chrono-text block rounded-full"
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
            className="fixed inset-0 z-40 bg-chrono-bg/98 backdrop-blur-2xl pt-24 px-8 md:hidden"
          >
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block text-2xl font-display py-3 ${
                      pathname === item.href
                        ? "text-chrono-accent"
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
                      <Image src={session.user.image} alt={session.user.name || "Profile"} width={40} height={40} className="w-10 h-10 rounded-xl" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl border border-[var(--line)] flex items-center justify-center text-chrono-muted bg-chrono-surface">
                        {session.user.name?.[0] || "U"}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-body font-medium text-chrono-text">{session.user.name}</div>
                      <div className="text-xs font-body text-chrono-muted">{session.user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="w-full py-3 text-sm font-body text-red-500/70 border border-[var(--line)] rounded-xl"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setMobileOpen(false); signIn("google", { callbackUrl: "/timeline" }); }}
                  className="w-full py-3 text-sm font-body font-medium bg-chrono-accent text-white rounded-xl"
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
