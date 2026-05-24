"use client";

import { Bell, Cpu, Search, ShieldCheck, Sparkles, User, Settings, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, useRef, useEffect } from "react";

import { useOmniWebSocket } from "@/hooks/useOmniWebSocket";
import { cn } from "@/lib/cn";
import { useProfile } from "@/hooks/useProfile";
import Link from "next/link";
import { useRouter } from "next/navigation";

function StatusDot({ variant }: { variant: "healthy" | "warning" | "critical" }) {
  const colors = {
    healthy: "bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.65)]",
    warning: "bg-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.55)]",
    critical: "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]",
  }[variant];

  return <div className={cn("w-2.5 h-2.5 rounded-full", colors)} />;
}

const colorMap: Record<string, string> = {
  cyan: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.2)]",
  rose: "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]",
  emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
  amber: "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]",
  violet: "bg-violet-500/10 border-violet-500/30 text-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.2)]",
};

export default function Navbar() {
  const router = useRouter();
  const { systemStatus } = useOmniWebSocket();
  const { profile, updateProfile } = useProfile();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Local form state for modal
  const [formName, setFormName] = useState(profile.name);
  const [formEmail, setFormEmail] = useState(profile.email);
  const [formRole, setFormRole] = useState(profile.role);
  const [formColor, setFormColor] = useState(profile.avatarColor);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync local form state when profile changes
  useEffect(() => {
    setFormName(profile.name);
    setFormEmail(profile.email);
    setFormRole(profile.role);
    setFormColor(profile.avatarColor);
  }, [profile, modalOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const status = useMemo<"healthy" | "warning" | "critical">(() => {
    const values = Object.values(systemStatus || {});
    const hasCritical = values.some((v) => v === "Critical");
    const hasWarning = values.some((v) => v === "Warning");
    return hasCritical ? "critical" : hasWarning ? "warning" : "healthy";
  }, [systemStatus]);

  const initials = useMemo(() => {
    if (!profile?.name) return "AM";
    const parts = profile.name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }, [profile?.name]);

  const activeColorClass = colorMap[profile.avatarColor] || colorMap.cyan;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: formName,
      email: formEmail,
      role: formRole,
      avatarColor: formColor,
    });
    setModalOpen(false);
    setDropdownOpen(false);
  };

  return (
    <>
      <header className="h-16 px-6 flex items-center gap-4 border-b border-white/10 bg-black/20 backdrop-blur-xl relative z-40">
        <div className="relative w-[360px] max-w-[45vw]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300/70" size={16} />
          <input
            placeholder="Search services, incidents, traces..."
            className="w-full rounded-2xl bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-400/80 outline-none focus:border-cyan-400/30 focus:shadow-[0_0_22px_rgba(34,211,238,0.18)]"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition"
          >
            <Bell size={18} className="text-slate-200" />
          </motion.button>

          <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10">
            <motion.div
              animate={{
                boxShadow: ["0 0 0 rgba(34,211,238,0)", "0 0 18px rgba(34,211,238,0.55)", "0 0 0 rgba(34,211,238,0)"],
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-2.5 h-2.5 rounded-full bg-cyan-400"
            />
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-200" />
              <div className="text-sm text-slate-200/90">AI Live</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/5 border border-white/10">
            <StatusDot variant={status} />
            <div className="text-xs leading-tight">
              <div className="text-slate-100 font-semibold">
                {status === "healthy" ? "Healthy" : status === "warning" ? "Warning" : "Critical"}
              </div>
              <div className="text-slate-300/70 flex items-center gap-1">
                <Cpu size={14} />
                <span>Realtime monitored</span>
              </div>
            </div>
            <motion.div
              initial={false}
              animate={{ opacity: status === "healthy" ? 0.6 : 1 }}
              className="w-7 h-7 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center"
            >
              <ShieldCheck size={14} className="text-emerald-200" />
            </motion.div>
          </div>

          {/* User profile dropdown container */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileHover={{ y: -1 }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={cn(
                "w-10 h-10 rounded-2xl border flex items-center justify-center font-bold text-sm transition-all focus:outline-none",
                activeColorClass
              )}
            >
              {initials}
            </motion.button>

            {/* Profile Dropdown menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-72 rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.5)] z-50 text-slate-100"
                >
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-3">
                    <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-base shrink-0", activeColorClass)}>
                      {initials}
                    </div>
                    <div className="leading-tight overflow-hidden">
                      <div className="text-sm font-semibold text-slate-100 truncate">{profile.name}</div>
                      <div className="text-xs text-slate-400 truncate">{profile.email}</div>
                      <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mt-1">{profile.role}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setModalOpen(true);
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-200 hover:text-white hover:bg-white/5 transition"
                    >
                      <User size={16} className="text-cyan-400" />
                      <span>Edit User Profile</span>
                    </button>

                    <Link
                      href="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-200 hover:text-white hover:bg-white/5 transition"
                    >
                      <Settings size={16} className="text-cyan-400" />
                      <span>Account Settings</span>
                    </Link>

                    <button
                      onClick={() => {
                        try {
                          localStorage.removeItem("omni_logged_in");
                        } catch {
                          // ignore
                        }
                        setDropdownOpen(false);
                        router.push("/login");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-200/90 hover:text-red-100 hover:bg-red-500/10 transition"
                    >
                      <span className="text-red-300">⟲</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Modal backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl z-10 text-slate-100"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>

              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-4">
                <User className="text-cyan-400" size={20} />
                <span>Edit User Profile</span>
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-400/30"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-400/30"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                    Security Role
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400/30 bg-slate-950"
                  >
                    <option value="SOC Lead Engineer" className="bg-slate-950">SOC Lead Engineer</option>
                    <option value="Infrastructure Analyst" className="bg-slate-950">Infrastructure Analyst</option>
                    <option value="SOC Administrator" className="bg-slate-950">SOC Administrator</option>
                    <option value="Incident Responder" className="bg-slate-950">Incident Responder</option>
                    <option value="Security Operator" className="bg-slate-950">Security Operator</option>
                  </select>
                </div>

                {/* Avatar Color */}
                <div>
                  <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                    Avatar Visual Style
                  </label>
                  <div className="flex gap-3">
                    {Object.keys(colorMap).map((color) => {
                      const colorClass = colorMap[color];
                      const active = formColor === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormColor(color)}
                          className={cn(
                            "w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm transition-all focus:outline-none capitalize",
                            colorClass,
                            active ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-105" : "opacity-60 hover:opacity-100"
                          )}
                        >
                          {formName ? formName.slice(0, 1).toUpperCase() : "A"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Save button */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-sm text-slate-300 py-2.5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-sm font-semibold py-2.5 transition flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    <span>Save Profile</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
