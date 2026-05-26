"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Lock, Mail, ArrowRight, Sparkles } from "lucide-react";

const DEMO_ORIGINAL_DATA_URL = "https://youtu.be/ab4wuqCxm-E";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [laptopKey, setLaptopKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Demo handshake: laptop/system key must exist to allow app to operate.
    localStorage.setItem("omni_laptop_key", laptopKey.trim());
    localStorage.setItem("omni_logged_in", "true");

    // Single flying notification (demo): show once per fresh login.
    try {
      localStorage.setItem("omni_post_login_toast_pending", "true");
    } catch {
      // ignore
    }

    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      {/* Background glow matrix nodes */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.06)_0,transparent_60%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.01] backdrop-blur-2xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)]"
      >
        {/* Subtle top scanner line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

        <div className="text-center mb-8 relative z-10">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <Shield size={26} className="text-cyan-400 animate-pulse" />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-2xl font-bold text-slate-100 tracking-tight flex items-center justify-center gap-2"
          >
            OmniRoot
            <span className="text-cyan-400 font-mono text-xs border border-cyan-500/30 px-1.5 py-0.5 rounded">
              Agentic AI
            </span>
          </motion.h1>

          <p className="text-xs text-slate-400 mt-2 font-mono">
            Infrastructure Autonomous Intelligence Platform
          </p>

          {/* Title animation / auto-advance gate */}
          <div className="mt-3 text-[11px] text-slate-400/80 font-mono animate-pulse">
            Initializing autonomous monitoring… (auto-advance ~20s)
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              Security ID (Email)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail size={16} />
              </span>
              <input
                required
                type="email"
                placeholder="operator@omniroot.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/30 transition shadow-inner font-mono"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              Access Key (Password)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock size={16} />
              </span>
              <input
                required
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/30 transition shadow-inner font-mono"
              />
            </div>
          </div>

          {/* Laptop/System Key field */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              Laptop/System Key
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Shield size={16} className="text-cyan-400" />
              </span>
              <input
                required
                value={laptopKey}
                onChange={(e) => setLaptopKey(e.target.value)}
                placeholder="Enter demo laptop/system key"
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/30 transition shadow-inner font-mono"
              />
            </div>

            <div className="mt-2 flex flex-col gap-2">
              <a
                href={https://youtu.be/ab4wuqCxm-E}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-6 text-sm rounded-2xl border border-yellow-300/35 bg-black hover:bg-yellow-500/10 text-yellow-100 font-mono transition shadow-[0_0_28px_rgba(250,204,21,0.10)] text-center"
              >
                ▶ DEMO: Click to view Original Functional Data
              </a>

              <a
                href={https://youtu.be/ab4wuqCxm-E}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-cyan-200/90 font-mono underline underline-offset-2 text-center"
              >
                {https://youtu.be/ab4wuqCxm-E}
              </a>
            </div>
          </div>

          {/* Demo tip */}
          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-3.5 flex items-start gap-2.5">
            <Sparkles size={16} className="text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              <span className="font-semibold text-cyan-300">Sandbox Authorization Active:</span> Enter any credentials to grant immediate clearance access.
            </p>
          </div>

          {/* Premium: Explain About The Website */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={() => router.push("/")}
            className="w-full py-3.5 mt-2 rounded-2xl font-semibold text-sm text-cyan-100 transition relative overflow-hidden border border-cyan-400/25 bg-white/[0.03] backdrop-blur-xl shadow-[0_0_28px_rgba(34,211,238,0.12)] hover:border-cyan-400/40"
          >
            <span
              aria-hidden
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.25)_0,transparent_60%)] opacity-60"
            />
            <span
              aria-hidden
              className="absolute -inset-[2px] opacity-0 hover:opacity-100 transition-opacity duration-300 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(34,211,238,0.0),rgba(34,211,238,0.45),rgba(139,92,246,0.35),rgba(34,211,238,0.0))]"
            />
            <span className="relative flex items-center justify-center gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 via-cyan-300 to-violet-200">
                Explain About The Website
              </span>
              <Sparkles size={16} className="text-cyan-200" />
            </span>
            <span
              aria-hidden
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-[60%] bg-gradient-to-r from-cyan-300/0 via-cyan-300/80 to-violet-300/0 opacity-0 hover:opacity-100 transition-opacity duration-300"
            />
          </motion.button>

          {/* Submit button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-semibold text-sm text-white hover:opacity-95 transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
          >
            {isLoading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                Initialize Handshake
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

