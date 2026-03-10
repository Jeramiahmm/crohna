"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function SettingsPage() {
  const [demoMode, setDemoMode] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearOnboarding = () => {
    localStorage.removeItem("chrono-onboarding-complete");
    localStorage.removeItem("chrono-start-mode");
  };

  return (
    <div className="min-h-screen pt-24 pb-32">
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-chrono-accent/[0.03] via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <span className="text-xs uppercase tracking-widest text-chrono-accent mb-4 block">
            Account
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
            <span className="gradient-text">Settings</span>
          </h1>
        </motion.div>
      </section>

      <section className="px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-chrono-card/60 rounded-2xl p-6 border border-chrono-border/40"
          >
            <h3 className="text-sm font-display font-semibold text-chrono-text mb-4">Profile</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-chrono-accent to-chrono-accent-warm flex items-center justify-center text-white text-xl font-bold">
                U
              </div>
              <div>
                <div className="text-chrono-text font-medium">Demo User</div>
                <div className="text-sm text-chrono-muted">demo@chrono.app</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-1.5">Display Name</label>
                <input
                  type="text"
                  defaultValue="Demo User"
                  className="w-full bg-chrono-bg/60 rounded-xl px-4 py-2.5 text-sm text-chrono-text border border-chrono-border/30 outline-none focus:border-chrono-accent/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-chrono-muted uppercase tracking-wider block mb-1.5">Email</label>
                <input
                  type="email"
                  defaultValue="demo@chrono.app"
                  className="w-full bg-chrono-bg/60 rounded-xl px-4 py-2.5 text-sm text-chrono-text border border-chrono-border/30 outline-none focus:border-chrono-accent/50 transition-colors"
                />
              </div>
            </div>
          </motion.div>

          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-chrono-card/60 rounded-2xl p-6 border border-chrono-border/40"
          >
            <h3 className="text-sm font-display font-semibold text-chrono-text mb-4">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-chrono-text">Demo Mode</div>
                  <div className="text-xs text-chrono-muted">Show sample data on your timeline</div>
                </div>
                <button
                  onClick={() => setDemoMode(!demoMode)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    demoMode ? "bg-chrono-accent" : "bg-chrono-border"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      demoMode ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-chrono-text">AI Story Notifications</div>
                  <div className="text-xs text-chrono-muted">Get notified when new stories are ready</div>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    notifications ? "bg-chrono-accent" : "bg-chrono-border"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      notifications ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Connected accounts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-chrono-card/60 rounded-2xl p-6 border border-chrono-border/40"
          >
            <h3 className="text-sm font-display font-semibold text-chrono-text mb-4">Connected Accounts</h3>
            <div className="space-y-3">
              {[
                { name: "Google Calendar", connected: false },
                { name: "Google Photos", connected: false },
              ].map((account) => (
                <div key={account.name} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-chrono-bg/60 flex items-center justify-center">
                      <svg className="w-4 h-4 text-chrono-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-chrono-text">{account.name}</div>
                      <div className="text-xs text-chrono-muted">
                        {account.connected ? "Connected" : "Not connected"}
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-1.5 text-xs rounded-full border border-chrono-border/40 text-chrono-text-secondary hover:text-chrono-text hover:border-chrono-border/60 transition-all">
                    {account.connected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Data management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-chrono-card/60 rounded-2xl p-6 border border-chrono-border/40"
          >
            <h3 className="text-sm font-display font-semibold text-chrono-text mb-4">Data</h3>
            <div className="space-y-3">
              <button className="text-sm text-chrono-text-secondary hover:text-chrono-text transition-colors">
                Export all data
              </button>
              <br />
              <button
                onClick={handleClearOnboarding}
                className="text-sm text-chrono-text-secondary hover:text-chrono-text transition-colors"
              >
                Reset onboarding
              </button>
              <br />
              <button className="text-sm text-red-400 hover:text-red-300 transition-colors">
                Delete all events
              </button>
            </div>
          </motion.div>

          {/* Save button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end"
          >
            <button
              onClick={handleSave}
              className="px-6 py-2.5 text-sm bg-gradient-to-r from-chrono-accent to-chrono-accent-warm text-white rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
