"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  Brain,
  CircuitBoard,
  Cloud,

  Grid3X3,
  Mic,
  Network,
  GitBranch,
  Sparkles,
  Zap,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: React.ReactNode };

function Particles({ active }: { active: boolean }) {
  // Purely presentational; avoids hydration mismatch by rendering only client.
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const left = (i * 37) % 100;
        const top = (i * 53) % 100;
        const delay = (i % 7) * 0.18;
        const size = 2 + (i % 5);
        const opacity = 0.35 + (i % 4) * 0.12;
        return { id: i, left, top, delay, size, opacity };
      }),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-cyan-300"
          style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, opacity: p.opacity }}
          animate={
            active
              ? {
                  y: [0, -16, 0],
                  x: [0, 10, 0],
                  opacity: [p.opacity, p.opacity + 0.25, p.opacity],
                }
              : undefined
          }
          transition={{ duration: 2.4, repeat: active ? Infinity : 0, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function TelemetryLeds() {
  const leds = useMemo(
    () =>
      [
        { label: "CPU", tone: "bg-red-500/30 border-red-400/40", dot: "bg-red-400" },
        { label: "MEM", tone: "bg-cyan-500/25 border-cyan-400/40", dot: "bg-cyan-400" },
        { label: "LAT", tone: "bg-amber-500/20 border-amber-400/35", dot: "bg-amber-400" },
        { label: "ERR", tone: "bg-rose-500/20 border-rose-400/35", dot: "bg-rose-400" },
      ],
    []
  );

  return (
    <div className="flex items-center gap-3">
      {leds.map((l, idx) => (
        <div key={l.label} className={`flex items-center gap-2 rounded-2xl border px-3 py-2 ${l.tone}`}> 
          <motion.span
            className={`w-2.5 h-2.5 rounded-full ${l.dot}`}
            animate={{
              scale: idx % 2 === 0 ? [1, 1.4, 1] : [1, 0.7, 1],
              opacity: [0.75, 1, 0.75],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: idx * 0.15 }}
          />
          <span className="text-[11px] font-mono text-slate-300/90">{l.label}</span>
        </div>
      ))}
    </div>
  );
}

function FlowNode({
  title,
  subtitle,
  icon,
  accent,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: "cyan" | "violet" | "blue" | "emerald" | "rose" | "amber";
}) {
  const accentMap: Record<string, string> = {
    cyan: "border-cyan-400/25 bg-cyan-500/5 text-cyan-200",
    violet: "border-violet-400/25 bg-violet-500/5 text-violet-200",
    blue: "border-blue-400/25 bg-blue-500/5 text-blue-200",
    emerald: "border-emerald-400/25 bg-emerald-500/5 text-emerald-200",
    rose: "border-rose-400/25 bg-rose-500/5 text-rose-200",
    amber: "border-amber-400/25 bg-amber-500/5 text-amber-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={`rounded-3xl border ${accentMap[accent]} backdrop-blur-xl p-5 shadow-[0_0_45px_rgba(0,0,0,0.35)]`}
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-slate-300/70 font-mono">{subtitle}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Go To Sign In", href: "/login", icon: <LockIcon /> },
      { label: "Go To Application", href: "/dashboard", icon: <Zap className="text-cyan-200" size={16} /> },
      { label: "Project Data", href: "/incidents", icon: <Network className="text-cyan-200" size={16} /> },
      { label: "Architecture", href: "/infrastructure", icon: <CircuitBoard className="text-cyan-200" size={16} /> },
      { label: "AI Workflow", href: "/copilot", icon: <Brain className="text-cyan-200" size={16} /> },
    ],
    []
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-[#05070c] text-slate-50 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.16),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.14),transparent_45%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(34,211,238,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.14)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:18px_18px]" />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.18)]">
              <Sparkles size={18} className="text-cyan-300" />
            </div>
            <div>
              <div className="text-sm font-semibold">OmniRoot</div>
              <div className="text-[11px] text-slate-400/80 font-mono">Agentic AI Operations</div>
            </div>
          </div>

          <div className="ml-auto hidden md:flex items-center gap-2">
            {navItems.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="group px-3 py-2 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition flex items-center gap-2"
              >
                <span className="opacity-80 group-hover:opacity-100">{it.icon}</span>
                <span className="text-xs font-semibold text-slate-200">{it.label}</span>
              </Link>
            ))}
          </div>

          <div className="md:hidden ml-auto">
            <Link
              href="/login"
              className="px-3 py-2 rounded-2xl border border-cyan-400/25 bg-cyan-500/10 text-cyan-200 text-xs font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1">
                  <motion.span
                    className="w-2 h-2 rounded-full bg-cyan-400"
                    animate={mounted ? { opacity: [0.6, 1, 0.6] } : undefined}
                    transition={{ duration: 1.2, repeat: mounted ? Infinity : 0, ease: "easeInOut" }}
                  />
                  <span className="text-[11px] font-mono text-cyan-200">Live telemetry simulation</span>
                </div>

                <h1 className="mt-5 text-4xl md:text-5xl leading-tight font-extrabold tracking-tight">
                  OmniRoot <span className="text-cyan-300">Agentic AI</span>
                </h1>

                <p className="mt-4 text-slate-300/90 text-base md:text-lg leading-relaxed">
                  Autonomous AI Operations for the Next Generation of Infrastructure — detect, correlate, mitigate, and recover in closed loop.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
                  <Link
                    href="/login"
                    className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:opacity-95 transition"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="group-hover:translate-x-0.5 transition" size={18} />
                  </Link>

                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-white/10 bg-white/[0.02] text-slate-200 font-semibold hover:bg-white/[0.05] transition"
                  >
                    <span>Open Application</span>
                    <Grid3X3 className="text-cyan-200" size={18} />
                  </Link>
                </div>

                <div className="mt-8">
                  <TelemetryLeds />
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 shadow-[0_0_60px_rgba(34,211,238,0.08)]"
              >
                <Particles active={mounted} />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <Boxes size={18} className="text-cyan-200" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Autonomous Ops Console</div>
                      <div className="text-xs text-slate-400/80 font-mono">Enterprise-ready demo</div>
                    </div>
                  </div>

                  <div className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-mono text-cyan-200">
                    STATUS: ONLINE
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <ConsoleRow k="Pipeline" v="REST + WebSockets" />
                  <ConsoleRow k="AI Engine" v="Incident Intelligence" />
                  <ConsoleRow k="Automation" v="n8n Recovery Pipelines" />
                  <ConsoleRow k="Recovery" v="Mitigation Playbooks" />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <MiniCard title="Detection" value="Correlating" icon={<Network size={16} className="text-cyan-200" />} tone="cyan" />
                  <MiniCard title="Mitigation" value="Running" icon={<Zap size={16} className="text-blue-200" />} tone="blue" />
                  <MiniCard title="Recovery" value="Verified" icon={<Cloud size={16} className="text-emerald-200" />} tone="emerald" />
                  <MiniCard title="Copilot" value="Advising" icon={<Sparkles size={16} className="text-violet-200" />} tone="violet" />
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <CircuitBoard size={14} className="text-cyan-200" />
                    Live event stream (simulated)
                  </div>
                  <div className="mt-3 text-xs text-slate-300/80 font-mono space-y-1">
                    <div>• [AI-AGENT] Anomaly detected — correlation batch queued</div>
                    <div>• [WS] Telemetry delta computed — readiness state updated</div>
                    <div>• [RECOVERY] Playbook routed — mitigation pipeline spawned</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pb-16">
          {/* 1) Vision */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="mb-10">
            <SectionHeader
              eyebrow="Project Vision"
              title="Infrastructure intelligence that feels like a living system"
              desc="OmniRoot unifies telemetry, incident correlation, automated mitigation, and human-in-the-loop reporting into a single agentic surface."
            />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <BigFeatureCard
                icon={<Sparkles size={18} className="text-cyan-200" />}
                title="Autonomous Ops"
                desc="Closed-loop detection → mitigation → recovery orchestration."
              />
              <BigFeatureCard
                icon={<Brain size={18} className="text-violet-200" />}
                title="Explainable Intelligence"
                desc="Root-cause hypotheses, timeline reconstruction, and playbook actions."
              />
              <BigFeatureCard
                icon={<CircuitBoard size={18} className="text-emerald-200" />}
                title="Enterprise Flow"
                desc="REST + WebSockets with realistic telemetry simulation."
              />
            </div>
          </motion.section>

          {/* 2) AI Infrastructure Intelligence */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="mb-10">
            <SectionHeader
              eyebrow="AI Infrastructure Intelligence"
              title="From signals to decisions in seconds"
              desc="A layered approach for infrastructure observability: stream analytics + incident intelligence + mitigation playbooks."
            />
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center">
                    <Network size={18} className="text-cyan-200" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">Intelligence Layer</div>
                    <div className="text-sm text-slate-400/80 font-mono">Correlation + context enrichment</div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MiniStat label="Telemetry" value="Live deltas" tone="cyan" />
                  <MiniStat label="Incidents" value="Alert synthesis" tone="rose" />
                  <MiniStat label="AI Insights" value="Mitigation plans" tone="violet" />
                  <MiniStat label="Recovery" value="Playbook execution" tone="emerald" />
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-semibold text-slate-200">Architecture Flow</div>
                  <div className="mt-2 text-sm text-slate-300/90 font-mono">
                    Frontend → FastAPI → AI Engine → WebSockets → n8n → Recovery Pipelines → AI Copilot
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-1 gap-4">
                <motion.div whileInView={{ scale: 1 }} viewport={{ once: true }} initial={{ scale: 0.98 }} transition={{ duration: 0.45 }} className="rounded-3xl border border-white/10 bg-gradient-to-b from-cyan-500/10 to-transparent backdrop-blur-xl p-6">
                  <div className="text-xs uppercase tracking-widest text-cyan-300/90 font-bold">AI Infrastructure Intelligence</div>
                  <div className="mt-3 text-xl font-bold">Real telemetry. Simulated realism.</div>
                  <p className="mt-2 text-sm text-slate-300/80">
                    This MVP uses high-fidelity simulated metrics/logs/incidents to drive the UI and agent workflow.
                  </p>
                  <div className="mt-5 flex gap-2 flex-wrap">
                    <Tag text="Glassmorphism" />
                    <Tag text="Neon gradients" />
                    <Tag text="Live charts" />
                    <Tag text="Terminal logs" />
                  </div>
                </motion.div>

                <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 10 }} transition={{ duration: 0.45 }} className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-200">n8n Workflow Preview</div>
                    <div className="w-10 h-10 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center">
                      <Mic size={18} className="text-cyan-200" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <FlowLine step="1" title="Trigger" desc="Incident arrives via WS stream." />
                    <FlowLine step="2" title="Correlate" desc="Enrich telemetry with heuristics." />
                    <FlowLine step="3" title="Mitigate" desc="Route playbook into recovery pipeline." />
                    <FlowLine step="4" title="Copilot" desc="Summarize actions and risks." />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* 3) Architecture Flow */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="mb-10">
            <SectionHeader
              eyebrow="Architecture Flow"
              title="Frontend → Recovery Pipelines → Copilot"
              desc="A clear, enterprise-style pipeline that keeps operators informed and automation effective."
            />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FlowNode title="Frontend" subtitle="Dashboard + Agents" icon={<Grid3X3 size={18} className="text-cyan-200" />} accent="cyan" />
              <FlowNode title="FastAPI" subtitle="REST + WebSocket" icon={<Cloud size={18} className="text-blue-200" />} accent="blue" />
              <FlowNode title="AI Engine" subtitle="Correlate & Predict" icon={<Brain size={18} className="text-violet-200" />} accent="violet" />
              <FlowNode title="WebSockets" subtitle="Real-time stream" icon={<Network size={18} className="text-cyan-200" />} accent="cyan" />
              <FlowNode title="n8n" subtitle="Automation orchestrator" icon={<Zap size={18} className="text-amber-200" />} accent="amber" />
              <FlowNode title="Recovery" subtitle="Playbooks & pipelines" icon={<Boxes size={18} className="text-emerald-200" />} accent="emerald" />
              <FlowNode title="AI Copilot" subtitle="Operator guidance" icon={<Sparkles size={18} className="text-violet-200" />} accent="violet" />
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-5 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs font-mono text-slate-400/80">End-to-end loop</div>
                  <div className="mt-2 text-lg font-bold">Detect</div>
                  <div className="text-lg font-bold text-cyan-300">Mitigate</div>
                  <div className="text-lg font-bold">Recover</div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* 4) Tech Stack */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="mb-10">
            <SectionHeader
              eyebrow="Technology Stack"
              title="Enterprise-grade, developer-friendly, hackathon-fast"
              desc="Production-compatible architecture with streaming-first UX."
            />

            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <StackCard title="Next.js" subtitle="App Router + Tailwind" icon={<Grid3X3 size={18} className="text-cyan-200" />} />
              <StackCard title="FastAPI" subtitle="Streaming REST + WS" icon={<Cloud size={18} className="text-blue-200" />} />
              <StackCard title="WebSockets" subtitle="Live command center" icon={<Network size={18} className="text-cyan-200" />} />
              <StackCard title="n8n" subtitle="Recovery pipeline orchestration" icon={<Zap size={18} className="text-amber-200" />} />
            </div>
          </motion.section>

          {/* 5) n8n visualization */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="mb-10">
            <SectionHeader
              eyebrow="n8n Workflow Visualization"
              title="A visual recovery timeline"
              desc="Automation nodes route playbooks and verify stabilization signals."
            />

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <VizCard title="Trigger" desc="Incident alert arrives" icon={<ArrowRight size={16} className="text-cyan-200" />} glow="cyan" />
                <VizCard title="Mitigate" desc="Run recovery pipelines" icon={<Zap size={16} className="text-emerald-200" />} glow="emerald" />
                <VizCard title="Verify" desc="Stabilization checks" icon={<Sparkles size={16} className="text-violet-200" />} glow="violet" />
              </div>
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs text-slate-400/80 font-mono">Deployment Flow</div>
                  <div className="mt-1 text-sm text-slate-200">Frontend → Vercel · Backend → Render · Automation → n8n · Source → GitHub</div>
                </div>
                <Link href="/architecture" className="hidden sm:inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition px-5 py-3 font-semibold text-sm">
                  <CircuitBoard size={16} className="text-cyan-200" />
                  View Architecture
                </Link>
              </div>
            </div>
          </motion.section>

          {/* 6) Copilot preview */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="mb-10">
            <SectionHeader
              eyebrow="AI Copilot Preview"
              title="Ask questions. Get operational answers."
              desc="Copilot summarizes system health and active playbook actions—built for operator speed."
            />
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center">
                    <Sparkles size={18} className="text-cyan-200" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Copilot Response (Preview)</div>
                    <div className="text-xs text-slate-400/80 font-mono">Example only</div>
                  </div>
                </div>
                <div className="font-mono text-sm text-slate-200/90 leading-relaxed space-y-2">
                  <div className="text-cyan-200">User:</div>
                  <div>“What is the system status?”</div>
                  <div className="text-cyan-200">Copilot:</div>
                  <div>
                    All systems nominal. Active incident queue is empty.
                    <br />
                    Telemetry feed shows stable CPU/MEM with normal API latency drift.
                    <br />
                    Recommendation: keep monitoring for correlation spikes.
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
                <div className="text-sm font-semibold">Start in seconds</div>
                <p className="mt-2 text-sm text-slate-400/80">
                  Use the live app to trigger simulations and watch the AI copilot walk through root cause and playbook steps.
                </p>
                <div className="mt-5 space-y-3">
                  <Link
                    href="/login"
                    className="block rounded-2xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 hover:bg-cyan-500/15 transition"
                  >
                    <span className="text-sm font-semibold text-cyan-200">Sign in to enable demo handshake</span>
                    <div className="text-xs text-slate-400/80 font-mono mt-1">Includes laptop/system key demo</div>
                  </Link>
                  <Link
                    href="/simulation"
                    className="block rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.05] transition"
                  >
                    <span className="text-sm font-semibold text-slate-200">Open Simulation Arena</span>
                    <div className="text-xs text-slate-400/80 font-mono mt-1">Trigger CPU/MEM/Latency/Cache incidents</div>
                  </Link>
                </div>
              </div>
            </div>
          </motion.section>

          {/* 7) Deployment architecture */}
          <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="mb-10">
            <SectionHeader
              eyebrow="Deployment Architecture"
              title="Ship fast, scale safely"
              desc="Frontend on Vercel, backend on Render, automation orchestrated through n8n, and code maintained in GitHub."
            />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
<GitBranch size={16} className="text-cyan-200" />
              <DeployCard title="Backend" meta="Render" icon={<Cloud size={16} className="text-blue-200" />} />
              <DeployCard title="Automation" meta="n8n" icon={<Zap size={16} className="text-amber-200" />} />
            </div>
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div>
              <div className="text-lg font-bold">OmniRoot Enterprise</div>
              <p className="mt-2 text-sm text-slate-400/80 max-w-sm">
                Built as a hackathon MVP with simulated but realistic infrastructure intelligence.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-5">
              <div className="text-xs font-semibold text-slate-300/90 uppercase tracking-widest">Quick Links</div>
              <div className="mt-3 space-y-2">
                <FooterLink href="/login" label="Sign In" />
                <FooterLink href="/dashboard" label="Application" />
                <FooterLink href="/simulation" label="Simulations" />
                <FooterLink href="/copilot" label="AI Copilot" />
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-5">
              <div className="text-xs font-semibold text-slate-300/90 uppercase tracking-widest">AI Workflow</div>
              <div className="mt-3 text-sm text-slate-300/90 font-mono leading-relaxed">
                Frontend → FastAPI → AI Engine → WebSockets → n8n → Recovery Pipelines → AI Copilot
              </div>
              <div className="mt-4">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-xs text-cyan-200 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Ready for demo operations
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-xs text-slate-500/80 font-mono">
            © {new Date().getFullYear()} OmniRoot AI — simulated infrastructure intelligence.
          </div>
        </div>
      </footer>

      {/* Mobile Animated CTA */}
      <AnimatePresence>
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="md:hidden fixed bottom-4 left-4 right-4 z-50"
          >
            <div className="rounded-3xl border border-white/10 bg-slate-950/85 backdrop-blur-xl p-3 flex items-center justify-between shadow-[0_0_30px_rgba(34,211,238,0.16)]">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-200" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">OmniRoot Agentic AI</div>
                  <div className="text-[11px] text-slate-400/80 font-mono">Sign in to enable demo handshake</div>
                </div>
              </div>
              <Link href="/login" className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold hover:opacity-95 transition">
                Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LockIcon() {
  return (
    <motion.span
      initial={{ rotate: -8 }}
      animate={{ rotate: [0, -3, 0] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-cyan-500/15 border border-cyan-400/30 text-cyan-200">🔒</span>
    </motion.span>
  );
}

function ConsoleRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-t border-white/5 pt-3">
      <div className="text-xs text-slate-400/80 font-mono">{k}</div>
      <div className="text-xs text-slate-200 font-semibold">{v}</div>
    </div>
  );
}

function MiniCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  tone: "cyan" | "blue" | "emerald" | "violet";
}) {
  const toneMap: Record<string, string> = {
    cyan: "border-cyan-400/25 bg-cyan-500/5",
    blue: "border-blue-400/25 bg-blue-500/5",
    emerald: "border-emerald-400/25 bg-emerald-500/5",
    violet: "border-violet-400/25 bg-violet-500/5",
  };

  return (
    <div className={`rounded-2xl border ${toneMap[tone]} p-3`}>
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-mono text-slate-400/80">{title}</div>
        <div className="w-9 h-9 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="mt-2 text-sm font-bold text-slate-100">{value}</div>
    </div>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-[11px] font-mono text-slate-300/80">
      {text}
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-widest text-cyan-300/90 font-mono">{eyebrow}</div>
      <div className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight">{title}</div>
      <p className="mt-2 text-sm md:text-base text-slate-400/80 max-w-3xl">{desc}</p>
    </div>
  );
}

function BigFeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center">
          {icon}
        </div>
        <div className="text-lg font-bold">{title}</div>
      </div>
      <p className="mt-3 text-sm text-slate-400/80 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: "cyan" | "rose" | "violet" | "emerald" }) {
  const toneMap: Record<string, string> = {
    cyan: "border-cyan-400/25 bg-cyan-500/5 text-cyan-200",
    rose: "border-rose-400/25 bg-rose-500/5 text-rose-200",
    violet: "border-violet-400/25 bg-violet-500/5 text-violet-200",
    emerald: "border-emerald-400/25 bg-emerald-500/5 text-emerald-200",
  };

  return (
    <div className={`rounded-2xl border ${toneMap[tone]} p-4`}>
      <div className="text-[11px] font-mono text-slate-400/80">{label}</div>
      <div className="mt-1 text-sm font-bold">{value}</div>
    </div>
  );
}

function FlowLine({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center text-xs font-mono text-cyan-200">
        {step}
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-200">{title}</div>
        <div className="text-xs text-slate-400/80 font-mono">{desc}</div>
      </div>
    </div>
  );
}

function StackCard({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-sm font-bold">{title}</div>
          <div className="text-xs text-slate-400/80 font-mono">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

function VizCard({ title, desc, icon, glow }: { title: string; desc: string; icon: React.ReactNode; glow: "cyan" | "emerald" | "violet" }) {
  const glowMap: Record<string, string> = {
    cyan: "border-cyan-400/25 bg-cyan-500/5",
    emerald: "border-emerald-400/25 bg-emerald-500/5",
    violet: "border-violet-400/25 bg-violet-500/5",
  };

  return (
    <div className={`rounded-3xl border ${glowMap[glow]} backdrop-blur-xl p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold">{title}</div>
          <div className="text-xs text-slate-400/80 font-mono mt-1">{desc}</div>
        </div>
        <div className="w-10 h-10 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function DeployCard({ title, meta, icon }: { title: string; meta: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center">{icon}</div>
        <div>
          <div className="text-sm font-bold">{title}</div>
          <div className="text-xs text-slate-400/80 font-mono">{meta}</div>
        </div>
      </div>
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="block rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition px-3 py-2">
      <div className="text-sm font-semibold text-slate-200">{label}</div>
    </Link>
  );
}

