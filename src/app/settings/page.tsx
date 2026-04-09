"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { toast } from "sonner";
import { useTheme } from "@/components/ui/ThemeProvider";
import GoogleConnectModal from "@/components/ui/GoogleConnectModal";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { theme, toggle: toggleTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectModal, setConnectModal] = useState<"Google Photos" | "Google Calendar" | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>({});
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [accountDeleteConfirm, setAccountDeleteConfirm] = useState(false);
  const [accountDeleting, setAccountDeleting] = useState(false);

  // Privacy preferences (server-backed with localStorage cache)
  const [privacySettings, setPrivacySettings] = useState({
    shareableStories: true,
    showLocationOnShared: true,
  });

  // Load from localStorage immediately, then sync from server
  useEffect(() => {
    const stored = localStorage.getItem("chrono-privacy");
    if (stored) {
      try { setPrivacySettings(JSON.parse(stored)); } catch { /* ignore */ }
    }
    if (!session) return;
    fetch("/api/user")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const prefs = data?.user?.preferences;
        if (prefs && typeof prefs === "object") {
          const merged = {
            shareableStories: prefs.shareableStories ?? true,
            showLocationOnShared: prefs.showLocationOnShared ?? true,
          };
          setPrivacySettings(merged);
          localStorage.setItem("chrono-privacy", JSON.stringify(merged));
        }
      })
      .catch(() => {});
  }, [session]);

  // Save to both localStorage and server
  const updatePrivacy = (update: Partial<typeof privacySettings>) => {
    setPrivacySettings((prev) => {
      const next = { ...prev, ...update };
      localStorage.setItem("chrono-privacy", JSON.stringify(next));
      // Fire-and-forget save to server
      fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: next }),
      }).catch(() => {});
      return next;
    });
  };

  useEffect(() => {
    if (session?.user) {
      setDisplayName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  // Load connection status from DB
  useEffect(() => {
    if (!session) return;
    fetch("/api/google/status")
      .then((res) => res.ok ? res.json() : { calendar: false, photos: false })
      .then((data) => {
        setConnectedAccounts({
          "Google Calendar": data.calendar,
          "Google Photos": data.photos,
        });
      })
      .catch(() => {});
  }, [session]);

  const refreshConnectionStatus = () => {
    fetch("/api/google/status")
      .then((res) => res.ok ? res.json() : { calendar: false, photos: false })
      .then((data) => {
        setConnectedAccounts({
          "Google Calendar": data.calendar,
          "Google Photos": data.photos,
        });
      })
      .catch(() => {});
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName }),
      });
      if (res.ok) {
        setSaved(true);
        toast.success("Changes saved");
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save changes.");
      }
    } catch {
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearOnboarding = () => {
    localStorage.removeItem("chrono-onboarding-complete");
    localStorage.removeItem("chrono-start-mode");
    toast.success("Onboarding reset");
  };

  const fetchExportData = async () => {
    const [eventsRes, storiesRes] = await Promise.all([
      fetch("/api/events"),
      fetch("/api/stories"),
    ]);
    if (!eventsRes.ok || !storiesRes.ok) {
      throw new Error("Failed to fetch data");
    }
    const eventsData = await eventsRes.json();
    const storiesData = await storiesRes.json();
    return {
      events: eventsData.events || [],
      stories: storiesData.stories || [],
    };
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = async () => {
    try {
      const data = await fetchExportData();
      const exportData = { exportedAt: new Date().toISOString(), ...data };
      downloadFile(
        JSON.stringify(exportData, null, 2),
        `crohna-export-${new Date().toISOString().split("T")[0]}.json`,
        "application/json"
      );
      toast.success("Data exported as JSON");
    } catch {
      toast.error("Failed to export data. Please try again.");
    }
  };

  const handleExportCSV = async () => {
    try {
      const data = await fetchExportData();
      const headers = ["id", "title", "date", "endDate", "location", "latitude", "longitude", "category", "source", "description"];
      const rows = data.events.map((e: Record<string, unknown>) =>
        headers.map((h) => {
          const val = e[h];
          if (val === undefined || val === null) return "";
          const str = String(val);
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        }).join(",")
      );
      const csv = [headers.join(","), ...rows].join("\n");
      downloadFile(
        csv,
        `crohna-events-${new Date().toISOString().split("T")[0]}.csv`,
        "text/csv"
      );
      toast.success("Events exported as CSV");
    } catch {
      toast.error("Failed to export data. Please try again.");
    }
  };

  const handleDeleteAllEvents = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 5000);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/events", { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        setDeleteConfirm(false);
        toast.success(`Deleted ${data.deleted} events.`);
      } else {
        toast.error("Failed to delete events.");
      }
    } catch {
      toast.error("Failed to delete events. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!accountDeleteConfirm) {
      setAccountDeleteConfirm(true);
      setTimeout(() => setAccountDeleteConfirm(false), 5000);
      return;
    }
    setAccountDeleting(true);
    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE_MY_ACCOUNT" }),
      });
      if (res.ok) {
        toast.success("Account deleted. Goodbye.");
        signOut({ callbackUrl: "/" });
      } else {
        toast.error("Failed to delete account.");
      }
    } catch {
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setAccountDeleting(false);
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen pt-24 pb-32 flex items-center justify-center">
        <div className="text-sm font-body font-light text-chrono-muted animate-pulse">Loading...</div>
      </div>
    );
  }

  // Not authenticated — show sign-in prompt (NOT a redirect to homepage)
  if (!session) {
    return (
      <div className="min-h-screen pt-24 pb-32">
        <section className="relative py-16 md:py-28 px-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-lg mx-auto text-center"
          >
            <span className="section-label mb-5 block">Account</span>
            <h1 className="text-3xl sm:text-5xl font-display font-bold mb-6 tracking-tight">
              <em className="text-chrono-text">Settings</em>
            </h1>
            <p className="text-base font-body font-light text-chrono-muted max-w-md mx-auto mb-12 leading-relaxed">
              Sign in to access your account settings, preferences, and connected services.
            </p>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/settings" })}
              className="relative z-10 px-8 py-3 text-sm font-body font-light bg-foreground text-background rounded-full hover:opacity-90 transition-all duration-500 cursor-pointer"
            >
              Sign in with Google
            </button>
          </motion.div>
        </section>
      </div>
    );
  }

  const userInitial = session.user?.name?.[0] || session.user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen pt-24 pb-32">
      <section className="relative py-16 md:py-28 px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <span className="section-label mb-5 block">Account</span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight">
            <em className="text-chrono-text">Settings</em>
          </h1>
        </motion.div>
      </section>

      <section className="px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--card-bg)] p-7 border border-[var(--line-strong)]"
          >
            <h3 className="text-sm font-display font-light text-chrono-text mb-4">Profile</h3>
            <div className="flex items-center gap-4 mb-6">
              {session.user?.image ? (
                <Image src={session.user.image} alt={session.user.name || "Profile"} width={64} height={64} className="w-16 h-16 rounded-full border border-[var(--line-strong)]" />
              ) : (
                <div className="w-16 h-16 border border-[var(--line-strong)] flex items-center justify-center text-chrono-accent text-xl font-display font-light rounded-full">
                  {userInitial}
                </div>
              )}
              <div>
                <div className="text-chrono-text font-body font-light">{session.user?.name || "User"}</div>
                <div className="text-sm font-body font-light text-chrono-muted">{session.user?.email || ""}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="section-label block mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={200}
                  className="w-full bg-[var(--input-bg)] px-4 py-2.5 text-sm font-body font-light text-chrono-text border border-[var(--line-strong)] outline-none focus:border-[var(--line-hover)] transition-colors"
                />
              </div>
              <div>
                <label className="section-label block mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-[var(--input-bg)] px-4 py-2.5 text-sm font-body font-light text-chrono-muted border border-[var(--line-strong)] outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--card-bg)] p-7 border border-[var(--line-strong)]"
          >
            <h3 className="text-sm font-display font-light text-chrono-text mb-4">Appearance</h3>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-body font-light text-chrono-text">Theme</div>
                <div className="text-xs font-body font-light text-chrono-muted mt-0.5">
                  Switch between dark and light mode
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="relative w-14 h-7 rounded-full border border-[var(--line-strong)] transition-colors"
                style={{ background: theme === "dark" ? "var(--card-bg)" : "var(--muted)" }}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                <motion.div
                  animate={{ x: theme === "dark" ? 2 : 24 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 w-6 h-6 rounded-full bg-foreground flex items-center justify-center"
                >
                  <span className="text-background text-[10px]">
                    {theme === "dark" ? "D" : "L"}
                  </span>
                </motion.div>
              </button>
            </div>
          </motion.div>

          {/* Connected Accounts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[var(--card-bg)] p-7 border border-[var(--line-strong)]"
          >
            <h3 className="text-sm font-display font-light text-chrono-text mb-4">Connected Accounts</h3>
            <div className="space-y-3">
              {(["Google Calendar", "Google Photos"] as const).map((name) => {
                const isConnected = !!connectedAccounts[name];
                return (
                  <div key={name} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[var(--input-bg)] border border-[var(--line)] flex items-center justify-center">
                        <svg className="w-4 h-4 text-chrono-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-body font-light text-chrono-text">{name}</div>
                        <div className="text-xs font-body font-light text-chrono-muted">
                          {isConnected ? "Connected" : "Not connected"}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setConnectModal(name)}
                      className="px-4 py-1.5 text-xs font-body font-light border border-[var(--line-strong)] text-chrono-muted hover:text-chrono-text hover:border-[var(--line-hover)] transition-all"
                    >
                      {isConnected ? "Manage" : "Connect"}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[var(--card-bg)] p-7 border border-[var(--line-strong)]"
          >
            <h3 className="text-sm font-display font-light text-chrono-text mb-4">Privacy</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="text-sm font-body font-light text-chrono-text">Allow shareable stories</div>
                  <div className="text-xs font-body font-light text-chrono-muted mt-0.5">
                    When enabled, shared story links can be viewed by anyone with the link
                  </div>
                </div>
                <button
                  onClick={() => updatePrivacy({ shareableStories: !privacySettings.shareableStories })}
                  className="relative w-11 h-6 rounded-full border border-[var(--line-strong)] transition-colors flex-shrink-0"
                  style={{ background: privacySettings.shareableStories ? "var(--chrono-accent)" : "var(--card-bg)" }}
                  role="switch"
                  aria-checked={privacySettings.shareableStories}
                >
                  <motion.div
                    animate={{ x: privacySettings.shareableStories ? 20 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-foreground"
                  />
                </button>
              </div>
              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="text-sm font-body font-light text-chrono-text">Show location on shared cards</div>
                  <div className="text-xs font-body font-light text-chrono-muted mt-0.5">
                    Include location details when sharing events or stories
                  </div>
                </div>
                <button
                  onClick={() => updatePrivacy({ showLocationOnShared: !privacySettings.showLocationOnShared })}
                  className="relative w-11 h-6 rounded-full border border-[var(--line-strong)] transition-colors flex-shrink-0"
                  style={{ background: privacySettings.showLocationOnShared ? "var(--chrono-accent)" : "var(--card-bg)" }}
                  role="switch"
                  aria-checked={privacySettings.showLocationOnShared}
                >
                  <motion.div
                    animate={{ x: privacySettings.showLocationOnShared ? 20 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-foreground"
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[var(--card-bg)] p-7 border border-[var(--line-strong)]"
          >
            <h3 className="text-sm font-display font-light text-chrono-text mb-4">Data</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleExportJSON}
                  className="text-sm font-body font-light text-chrono-muted hover:text-chrono-text transition-colors"
                >
                  Export as JSON
                </button>
                <span className="text-chrono-muted/30 text-xs">|</span>
                <button
                  onClick={handleExportCSV}
                  className="text-sm font-body font-light text-chrono-muted hover:text-chrono-text transition-colors"
                >
                  Export as CSV
                </button>
              </div>
              <button
                onClick={handleClearOnboarding}
                className="text-sm font-body font-light text-chrono-muted hover:text-chrono-text transition-colors"
              >
                Reset onboarding
              </button>
              <br />
              <button
                onClick={handleDeleteAllEvents}
                disabled={deleting}
                className="text-sm font-body font-light text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : deleteConfirm ? "Click again to confirm deletion" : "Delete all events"}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={accountDeleting}
                className="text-sm font-body font-light text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {accountDeleting ? "Deleting account..." : accountDeleteConfirm ? "Click again to permanently delete your account" : "Delete account"}
              </button>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-between"
          >
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-8 py-3 text-sm font-body font-light text-red-400/70 hover:text-red-400 border border-[var(--line-strong)] hover:border-red-400/30 rounded-full transition-all duration-500"
            >
              Sign Out
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 text-sm font-body font-light bg-foreground text-background rounded-full hover:opacity-90 transition-colors duration-500 disabled:opacity-50"
            >
              {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
            </button>
          </motion.div>
        </div>
      </section>

      {connectModal && (
        <GoogleConnectModal
          isOpen={!!connectModal}
          onClose={() => setConnectModal(null)}
          service={connectModal}
          onConnect={refreshConnectionStatus}
          onDisconnect={refreshConnectionStatus}
          isConnected={!!connectedAccounts[connectModal]}
        />
      )}
    </div>
  );
}
