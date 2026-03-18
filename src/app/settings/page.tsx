"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import GoogleConnectModal from "@/components/ui/GoogleConnectModal";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectModal, setConnectModal] = useState<"Google Photos" | "Google Calendar" | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>({});
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setDisplayName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  useEffect(() => {
    const stored = localStorage.getItem("chrono-connected-accounts");
    if (stored) setConnectedAccounts(JSON.parse(stored));
  }, []);

  const handleConnect = (service: string) => {
    const updated = { ...connectedAccounts, [service]: true };
    setConnectedAccounts(updated);
    localStorage.setItem("chrono-connected-accounts", JSON.stringify(updated));
  };

  const handleDisconnect = (service: string) => {
    const updated = { ...connectedAccounts, [service]: false };
    setConnectedAccounts(updated);
    localStorage.setItem("chrono-connected-accounts", JSON.stringify(updated));
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
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save changes.");
      }
    } catch {
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearOnboarding = () => {
    localStorage.removeItem("chrono-onboarding-complete");
    localStorage.removeItem("chrono-start-mode");
  };

  const handleExportData = async () => {
    try {
      const [eventsRes, storiesRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/stories"),
      ]);
      const eventsData = await eventsRes.json();
      const storiesData = await storiesRes.json();
      const exportData = {
        exportedAt: new Date().toISOString(),
        events: eventsData.events || [],
        stories: storiesData.stories || [],
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chrono-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export data. Please try again.");
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
        alert(`Deleted ${data.deleted} events.`);
      } else {
        alert("Failed to delete events.");
      }
    } catch {
      alert("Failed to delete events. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const userInitial = session?.user?.name?.[0] || session?.user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen pt-24 pb-32">
      <section className="relative py-28 px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <span className="section-label mb-5 block">Account</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight">
            <em className="text-chrono-text">Settings</em>
          </h1>
        </motion.div>
      </section>

      <section className="px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--card-bg)] p-7 border border-[var(--line-strong)]"
          >
            <h3 className="text-sm font-display font-light text-chrono-text mb-4">Profile</h3>
            <div className="flex items-center gap-4 mb-6">
              {session?.user?.image ? (
                <Image src={session.user.image} alt="" width={64} height={64} className="w-16 h-16 rounded-full border border-[var(--line-strong)]" />
              ) : (
                <div className="w-16 h-16 border border-[var(--line-strong)] flex items-center justify-center text-chrono-accent text-xl font-display font-light rounded-full">
                  {userInitial}
                </div>
              )}
              <div>
                <div className="text-chrono-text font-body font-light">{session?.user?.name || "User"}</div>
                <div className="text-sm font-body font-light text-chrono-muted">{session?.user?.email || ""}</div>
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--card-bg)] p-7 border border-[var(--line-strong)]"
          >
            <h3 className="text-sm font-display font-light text-chrono-text mb-4">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-body font-light text-chrono-text">Story Notifications</div>
                  <div className="text-xs font-body font-light text-chrono-muted">Get notified when new stories are ready</div>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    notifications ? "bg-chrono-accent" : "bg-[var(--line-strong)]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-chrono-bg transition-transform ${
                      notifications ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[var(--card-bg)] p-7 border border-[var(--line-strong)]"
          >
            <h3 className="text-sm font-display font-light text-chrono-text mb-4">Data</h3>
            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="text-sm font-body font-light text-chrono-muted hover:text-chrono-text transition-colors"
              >
                Export all data
              </button>
              <br />
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
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
          onConnect={() => handleConnect(connectModal)}
          onDisconnect={() => handleDisconnect(connectModal)}
          isConnected={!!connectedAccounts[connectModal]}
        />
      )}
    </div>
  );
}
