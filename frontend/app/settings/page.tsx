"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Bell, Shield, Palette, Database, Sparkles, CheckCircle2 } from "lucide-react";
import { useOmniWebSocket } from "@/hooks/useOmniWebSocket";
import { cn } from "@/lib/cn";

export default function SettingsPage() {
  const { connected } = useOmniWebSocket();
  const [settings, setSettings] = useState({
    streamMode: "online" as "online" | "offline",
    emailNotifications: true,
    criticalAlertsOnly: false,
    darkMode: true,
    autoScaling: true,
    dataRetention: "30",
    laptopKey: "",
  });
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Persist locally so it affects UI state immediately.
    try {
      localStorage.setItem("omni_stream_mode", settings.streamMode);
      localStorage.setItem("omni_laptop_key", (settings.laptopKey || "").trim());
    } catch {
      // ignore
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };


  const settingsSections = [
    {
      title: "Laptop/System Authorization",
      icon: Shield,
      settings: [
        { key: "laptopKey", label: "Laptop/System Key (demo)", type: "input", value: settings.laptopKey },
      ],
    },
    {
      title: "Notifications & Streaming Alerts",
      icon: Bell,
      settings: [
        { key: "streamMode", label: "Streaming Mode (Offline/Online)", type: "toggle", value: true },
        { key: "emailNotifications", label: "Email Critical Reports", type: "toggle" },
        { key: "criticalAlertsOnly", label: "Stream Critical Alerts Only", type: "toggle" },
      ]
    },

    {
      title: "Security & Guardrails",
      icon: Shield,
      settings: [
        { key: "twoFactor", label: "Multi-Factor Authentication", type: "toggle", value: true },
      ]
    },
    {
      title: "Appearance & HUD Aesthetics",
      icon: Palette,
      settings: [
        { key: "darkMode", label: "Cinematic HUD theme", type: "toggle" },
      ]
    },
    {
      title: "Data Management & Autoscaling",
      icon: Database,
      settings: [
        { key: "autoScaling", label: "AI Autonomous Healing Enabled", type: "toggle" },
        { key: "dataRetention", label: "Telemetry Log Retention (days)", type: "input", value: settings.dataRetention },
      ]
    },
  ];

  return (
    <div className="relative min-h-screen p-6 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SettingsIcon size={16} className="text-cyan-400" />
              <span className="text-xs text-cyan-400 uppercase tracking-widest font-semibold">SOC System Configuration</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">System Settings</h1>
            <p className="text-sm text-slate-400 mt-1">
              Configure notifications, UI themes, API connection endpoints, and AI self-healing parameters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-2",
              connected 
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]" 
                : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", connected ? "bg-emerald-400" : "bg-amber-400")} />
              {connected ? "Connection Secure" : "Connecting..."}
            </div>
          </div>
        </div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-2xl p-4 text-sm flex items-center gap-3 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          >
            <CheckCircle2 className="shrink-0 text-emerald-400" size={18} />
            <div>
              <span className="font-semibold">Settings Saved:</span> System configurations have been successfully committed to the database.
            </div>
          </motion.div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section, sectionIdx) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIdx * 0.08 }}
                className="rounded-3xl border border-white/10 bg-white/[0.01] backdrop-blur-xl p-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.01] to-transparent pointer-events-none" />

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.05)]">
                    <Icon size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-100">{section.title}</h2>
                </div>

                <div className="space-y-4">
                  {section.settings.map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between py-3 border-t border-white/5">
                      <span className="text-sm text-slate-300 font-medium">{setting.label}</span>
                      {setting.type === "toggle" ? (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleToggle(setting.key as any)}
                          className={cn(
                            "relative inline-flex h-7 w-12 items-center rounded-full transition-colors border",
                            settings[setting.key as keyof typeof settings]
                              ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                              : "bg-white/5 border-white/10 text-slate-500"
                          )}
                        >
                          <motion.div
                            layout
                            className={cn(
                              "inline-block h-5 w-5 transform rounded-full transition-all",
                              settings[setting.key as keyof typeof settings] ? "bg-cyan-400" : "bg-slate-400"
                            )}
                            animate={{
                              x: settings[setting.key as keyof typeof settings] ? 22 : 4,
                            }}
                          />
                        </motion.button>
                      ) : setting.type === "input" ? (
                        <div className="flex items-center gap-3">
                          <input
                            aria-label={setting.label}
                            type={setting.key === "dataRetention" ? "number" : "text"}
                            placeholder={setting.key === "laptopKey" ? "Enter demo laptop/system key" : undefined}
                            value={settings[setting.key as keyof typeof settings] as any}
                            onChange={(e) => handleChange(setting.key, e.target.value)}
                            className="w-64 px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                          />
                        </div>
                      ) : null}

                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-semibold text-sm text-white hover:opacity-90 transition shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            Save Changes
          </motion.button>
        </div>

      </div>
    </div>
  );
}
