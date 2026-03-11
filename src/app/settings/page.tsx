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
      <section className="relative py-28 px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <span className="section-label mb-5 block">Account</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight">
            <em className="text-white">Settings</em>
          </h1>
        </motion.div>
      </section>

      <section className="px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-chrono-card/30 p-7 border border-white/[0.08]"
          >
            <h3 className="text-sm font-display font-light text-chrono-text mb-4">Profile</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 border border-white/[0.12] flex items-center justify-center text-white/80 text-xl font-display font-light">
                U
              </div>
              <div>
                <div className="text-chrono-text font-body font-light">Demo User</div>
                <div className="text-sm font-body font-light text-chrono-muted">demo@chrono.app</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="section-label block mb-1.5">Display Name</label>
                <input
                  type="text"
                  defaultValue="Demo User"
                  className="w-full bg-chrono-bg/60 px-4 py-2.5 text-sm font-body font-light text-chrono-text border border-white/[0.08] outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div>
                <label className="section-label block mb-1.5">Email</label>
                <input
                  type="email"
                  defaultValue="demo@chrono.app"
                  className="w-full bg-chrono-bg/60 px-4 py-2.5 text-sm font-body font-light text-chrono-text border border-white/[0.08] outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-chrono-card/30 p-7 border border-white/[0.08]"
          >
            <h3 className="text-sm font-display font-light text-chrono-text mb-4">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-body font-light text-chrono-text">Demo Mode</div>
                  <div className="text-xs font-body font-light text-chrono-muted">Show sample data on your timeline</div>
                </div>
                <button
                  onClick={() => setDemoMode(!demoMode)}
                  className={`relative w-11 h-6 transition-colors ${
                    demoMode ? "bg-white/60" : "bg-chrono-border"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-chrono-text transition-transform ${
                      demoMode ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-body font-light text-chrono-text">Story Notifications</div>
                  <div className="text-xs font-body font-light text-chrono-muted">Get notified when new stories are ready</div>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-11 h-6 transition-colors ${
                    notifications ? "bg-white/60" : "bg-chrono-border"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-chrono-text transition-transform ${
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
            className="bg-chrono-card/30 p-7 border border-white/[0.08]"
          >
            <h3 className="text-sm font-display font-light text-chrono-text mb-4">Connected Accounts</h3>
            <div className="space-y-3">
              {[
                { name: "Google Calendar", connected: false },
                { name: "Google Photos", connected: false },
              ].map((account) => (
                <div key={account.name} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-chrono-bg/60 border border-white/[0.06] flex items-center justify-center">
                      <svg className="w-4 h-4 text-chrono-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-body font-light text-chrono-text">{account.name}</div>
                      <div className="text-xs font-body font-light text-chrono-muted">
                        {account.connected ? "Connected" : "Not connected"}
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-1.5 text-xs font-body font-light border border-white/[0.1] text-chrono-text-secondary hover:text-chrono-text hover:border-white/20 transition-all">
                    {account.connected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-chrono-card/30 p-7 border border-white/[0.08]"
          >
            <h3 className="text-sm font-display font-light text-chrono-text mb-4">Data</h3>
            <div className="space-y-3">
              <button className="text-sm font-body font-light text-chrono-text-secondary hover:text-white transition-colors">
                Export all data
              </button>
              <br />
              <button
                onClick={handleClearOnboarding}
                className="text-sm font-body font-light text-chrono-text-secondary hover:text-white transition-colors"
              >
                Reset onboarding
              </button>
              <br />
              <button className="text-sm font-body font-light text-red-400/70 hover:text-red-400 transition-colors">
                Delete all events
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end"
          >
            <button
              onClick={handleSave}
              className="px-8 py-3 text-sm font-body font-light bg-white text-black rounded-full hover:bg-white/90 transition-colors duration-500"
            >
              {saved ? "Saved" : "Save Changes"}
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
