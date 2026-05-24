"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useRouter } from "next/navigation";

export default function IntroPage() {
  const router = useRouter();
  const controls = useAnimation();

  const messages = useMemo(
    () => [
      "Initializing autonomous monitoring...",
      "Scanning telemetry layers...",
      "Connecting AI mitigation engine...",
      "Loading incident intelligence...",
      "Activating autonomous operations...",
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const [readyToProceed, setReadyToProceed] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((prev) => (prev < messages.length - 1 ? prev + 1 : prev));
    }, 3200);

    const timeout = window.setTimeout(() => {
      setReadyToProceed(true);
    }, 20000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [messages.length]);

  useEffect(() => {
    if (!readyToProceed) return;

    const run = async () => {
      await controls.start({
        opacity: 0,
        scale: 1.02,
        transition: { duration: 0.9, ease: "easeInOut" },
      });
      router.push("/login");
    };

    run();
  }, [readyToProceed, controls, router]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-cyan-200 flex items-center justify-center">
      {/* background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.16),transparent_45%)]" />

      {/* grid */}
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(34,211,238,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.15)_1px,transparent_1px)] [background-size:48px_48px]" />

      {/* holographic glow pulse */}
      <motion.div
        className="absolute w-[900px] h-[900px] rounded-full bg-cyan-400/5 blur-3xl"
        initial={{ opacity: 0.15, scale: 0.72 }}
        animate={{ opacity: [0.1, 0.22, 0.1], scale: [0.72, 0.88, 0.72] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        animate={controls}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-10 w-full max-w-3xl px-6"
      >
        {/* top bar */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.7)] animate-pulse" />
          <div className="text-xs font-mono tracking-widest text-cyan-200/80">OMNIROOT • AGENTIC BOOT</div>
          <div className="ml-auto text-[11px] text-slate-400/80 font-mono">
            auto-advance: ~20s
          </div>
        </div>

        {/* title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl px-5 py-3 shadow-[0_0_45px_rgba(34,211,238,0.12)]">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <span className="text-cyan-300 font-bold">⟡</span>
            </div>
            <div className="text-left">
              <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-cyan-100">
                OmniRoot <span className="text-cyan-400">Agentic AI</span>
              </div>
              <div className="mt-1 text-sm md:text-base text-slate-300/90 font-mono">
                Infrastructure Autonomous Intelligence Platform
              </div>
            </div>
          </div>

          {/* message */}
          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="text-lg font-mono text-cyan-200/90 min-h-[30px]">
              {messages[index]}
            </div>
            <div className="mt-4 text-[12px] text-slate-400/80">
              Initializing autonomous monitoring…
            </div>
          </motion.div>

          {/* progress */}
          <div className="mt-8 w-full">
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-indigo-400"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 20, ease: "linear" }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400/80 font-mono">
              <span>BOOT</span>
              <span>INTELLIGENCE</span>
              <span>READY</span>
            </div>
          </div>

          {/* bottom hints */}
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.75)]" />
              <div className="text-xs text-slate-300/90 font-mono">Preparing login portal…</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* scanline */}
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-cyan-400/20 via-transparent to-transparent animate-[scan_2.2s_ease-in-out_infinite]" />

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(-40px);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 40px));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

