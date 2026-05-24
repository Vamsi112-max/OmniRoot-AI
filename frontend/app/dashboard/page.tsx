"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Database,
  HardDrive,
  Activity,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Thermometer,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis } from "recharts";

import { useOmniWebSocket, type OmniAiInsight } from "@/hooks/useOmniWebSocket";
import { cn } from "@/lib/cn";

function GlowCard({
  label,
  value,
  icon,
  tone,
  sub,
  live,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "blue" | "red" | "green";
  sub?: string;
  live?: boolean;
}) {
  const toneMap = {
    blue: {
      ring: "shadow-[0_0_24px_rgba(34,211,238,0.20)] border-cyan-400/20",
      grad: "from-cyan-500/10 to-transparent",
      text: "text-cyan-100",
    },
    red: {
      ring: "shadow-[0_0_24px_rgba(239,68,68,0.22)] border-red-400/25",
      grad: "from-red-500/10 to-transparent",
      text: "text-red-100",
    },
    green: {
      ring: "shadow-[0_0_24px_rgba(52,211,153,0.18)] border-emerald-400/20",
      grad: "from-emerald-500/10 to-transparent",
      text: "text-emerald-100",
    },
  }[tone];

  return (
    <motion.div
      initial={false}
      animate={
        live
          ? {
              boxShadow: ["0 0 0 rgba(34,211,238,0)", "0 0 26px rgba(34,211,238,0.18)", "0 0 0 rgba(34,211,238,0)"],
            }
          : undefined
      }
      transition={{ duration: 1.8, repeat: live ? Infinity : 0, ease: "easeInOut" }}
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-white/[0.03] backdrop-blur-xl",
        toneMap.ring
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-90",
          tone === "blue" ? "from-cyan-500/10" : tone === "red" ? "from-red-500/10" : "from-emerald-500/10"
        )}
      />
      <div className={cn("relative p-4")}> 
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-slate-300/70 tracking-wide">{label}</div>
            <div className={cn("mt-1 text-2xl font-semibold", toneMap.text)}>{value}</div>
            {sub ? <div className="mt-1 text-xs text-slate-300/70">{sub}</div> : null}
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-[0_0_22px_rgba(34,211,238,0.10)]">
            {icon}
          </div>
        </div>
      </div>

      {/* top scan glow */}
      <div
        className="pointer-events-none absolute -top-10 left-0 right-0 h-10 bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent opacity-0"
      />
    </motion.div>
  );
}

function LiveLineChart({
  title,
  series,
  stroke,
}: {
  title: string;
  series: { x: number; y: number }[];
  stroke: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-slate-200/90 font-medium">{title}</div>
        <div className="text-xs text-slate-300/70">live</div>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>

          <LineChart data={series}>
            <XAxis dataKey="x" hide />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}
              labelStyle={{ color: "#e2e8f0" }}
              itemStyle={{ color: "#e2e8f0" }}
            />
            <Line
              type="monotone"
              dataKey="y"
              stroke={stroke}
              strokeWidth={2.2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function LogTerminal({ logs, isHot }: { logs: { ts: number; severity: string; message: string }[]; isHot: boolean }) {
  const [autoScroll, setAutoScroll] = useState(true);
  const lastLen = useMemo(() => logs.length, [logs.length]);

  useEffect(() => {
    if (!autoScroll) return;
    const el = document.getElementById("omnilog");
    if (el) el.scrollTop = el.scrollHeight;
  }, [lastLen, autoScroll]);

  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive size={16} className={cn(isHot ? "text-red-200" : "text-cyan-200")} />
          <div className="text-sm text-slate-200/90 font-medium">Live Logs</div>
        </div>
        <div className="text-xs text-slate-300/70">{logs.length} entries</div>
      </div>
      <div className="h-[340px] overflow-auto" id="omnilog">
        <div className="p-3 font-mono text-[12px] leading-5">
          {logs.map((l, idx) => {
            const sev = l.severity.toUpperCase();
            const color =
              sev === "CRITICAL"
                ? "text-red-300"
                : sev === "ERROR"
                ? "text-red-200"
                : sev === "WARNING"
                ? "text-amber-200"
                : "text-slate-200";
            const prefix = sev === "INFO" ? "[INFO]" : sev === "WARNING" ? "[WARNING]" : sev === "ERROR" ? "[ERROR]" : "[CRITICAL]";

            return (
              <div key={l.ts + ":" + idx} className={cn("flex gap-2", color)}>
                <span className={cn("w-[92px]", isHot && (sev === "ERROR" || sev === "CRITICAL") ? "text-red-400" : undefined)}>{prefix}</span>
                <span className="opacity-90">{l.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function typeWriter({ text, speed = 12 }: { text: string; speed?: number }) {
  // Placeholder: handled inside component.
  return { text, speed };
}

function CinematicAI({ ai, hot }: { ai: OmniAiInsight | null; hot: boolean }) {
  const [stream, setStream] = useState({
    root: "",
    severity: "",
    impact: "",
    timeline: [] as { t: string; event: string }[],
    recs: [] as string[],
  });

  useEffect(() => {
    if (!hot || !ai) return;

    // Cinematic stream: root first, then recommendations, then severity/impact, then timeline.
    let cancelled = false;

    const start = async () => {
      const root = ai.root_cause;
      let i = 0;
      for (; i <= root.length; i += 1) {
        if (cancelled) return;
        setStream((s) => ({ ...s, root: root.slice(0, i) }));
        await new Promise((r) => setTimeout(r, 7));
      }

      const recs: string[] = [];
      for (const rec of ai.recommendations) {
        let j = 0;
        while (j <= rec.length) {
          if (cancelled) return;
          const current = rec.slice(0, j);
          const nextRecs = [...recs];
          const recIndex = ai.recommendations.indexOf(rec);
          if (nextRecs.length < recIndex + 1) nextRecs.push(current);
          else nextRecs[nextRecs.length - 1] = current;

          setStream((s) => ({ ...s, recs: nextRecs }));
          j += 2;
          await new Promise((r) => setTimeout(r, 10));
        }
        recs.push(rec);
        if (cancelled) return;
        setStream((s) => ({ ...s, recs }));
      }

      if (cancelled) return;
      setStream((s) => ({ ...s, severity: ai.severity, impact: ai.predicted_impact }));

      const timeline: { t: string; event: string }[] = [];
      for (const item of ai.timeline_reconstruction) {
        if (cancelled) return;
        timeline.push({ ...item });
        setStream((s) => ({ ...s, timeline: [...timeline] }));
        await new Promise((r) => setTimeout(r, 400));
      }
    };

    start();

    return () => {
      cancelled = true;
    };
  }, [ai, hot]);

  if (!hot) {

    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.55)]" />
          <div className="text-sm text-slate-200/90 font-medium">AI Insights</div>
        </div>
        <div className="mt-3 text-sm text-slate-300/80">Monitoring infrastructure…</div>
        <div className="mt-2 text-xs text-slate-400/80">No critical anomalies detected.</div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-red-400/25 bg-gradient-to-b from-red-500/10 to-transparent backdrop-blur-xl p-4 shadow-[0_0_40px_rgba(239,68,68,0.16)]">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_22px_rgba(239,68,68,0.65)]" />
        <div className="text-sm text-slate-200/90 font-medium">AI Incident Intelligence</div>
        <div className="ml-auto text-xs text-red-200/90">LIVE ANALYSIS</div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3">
        <div>
          <div className="text-xs text-slate-300/70">Probable root cause</div>
          <div className="mt-1 text-sm text-slate-100/95 font-medium whitespace-pre-wrap">{stream.root || ""}</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-slate-300/70">Severity</div>
            <div className="mt-1 text-sm text-slate-100/95 font-semibold">{stream.severity || ""}</div>
          </div>
          <div>
            <div className="text-xs text-slate-300/70">Predicted impact</div>
            <div className="mt-1 text-sm text-slate-100/95 font-medium">{stream.impact || ""}</div>
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-300/70">Recommendations</div>
          <div className="mt-2 space-y-2">
            {(stream.recs.length ? stream.recs : []).map((r, i) => (
              <div key={i} className="text-sm text-slate-100/90 flex gap-2">
                <span className="text-red-300">›</span>
                <span className="whitespace-pre-wrap">{r}</span>
              </div>
            ))}
            {!stream.recs.length ? <div className="text-xs text-slate-300/70">Streaming playbook actions…</div> : null}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-300/70">Timeline Reconstruction</div>
          <div className="mt-2 space-y-2">
            {stream.timeline.map((it, idx) => (
              <div key={it.t + idx} className="text-sm text-slate-100/90 flex gap-3">
                <span className="min-w-[56px] text-cyan-200/90">{it.t}</span>
                <span className="opacity-90">{it.event}</span>
              </div>
            ))}
            {!stream.timeline.length ? <div className="text-xs text-slate-300/70">Reconstructing incident sequence…</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

const fallbackSeries = {
  cpu: Array.from({ length: 20 }, (_, i) => ({ x: i, y: 45 + Math.sin(i / 3) * 4 })),
  memory: Array.from({ length: 20 }, (_, i) => ({ x: i, y: 60 + Math.cos(i / 4) * 3 })),
  api_latency: Array.from({ length: 20 }, (_, i) => ({ x: i, y: 80 + Math.sin(i / 5) * 18 })),
  throughput: Array.from({ length: 20 }, (_, i) => ({ x: i, y: 620 + Math.cos(i / 6) * 40 })),
  error_rate: Array.from({ length: 20 }, (_, i) => ({ x: i, y: 1 + Math.abs(Math.sin(i / 2)) * 1.2 })),
};

export default function DashboardPage() {
  const { connected, metrics, logs, activeIncidents, systemStatus, ai } = useOmniWebSocket();
  const liveMetrics = metrics ?? {
    latest: {
      cpu: 48,
      memory: 63,
      api_latency: 92,
      throughput: 680,
      error_rate: 1.8,
    },
    series: fallbackSeries,
  };

  const hot = activeIncidents.length > 0;

  const healthCards = useMemo(() => {
    const m = liveMetrics.latest;
    return {
      cpu: `${Math.round(m.cpu)}%`,
      mem: `${Math.round(m.memory)}%`,
      api: `${Math.round(m.api_latency)}ms`,
      db: "Simulated",
      active: activeIncidents.length.toString(),
      threat: hot ? `${Math.round((ai?.predictions?.outage_confidence ?? 0.7) * 100)}%` : "12%",
    };
  }, [liveMetrics, activeIncidents.length, ai, hot]);

  return (
    <div className={cn("relative", hot && "animate-pulse")}> 
      {/* background glows */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10",
          hot
            ? "bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.18),transparent_55%)]"
            : "bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.14),transparent_55%)]"
        )}
      />

      <div className="px-6 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className={cn("w-3 h-3 rounded-full", hot ? "bg-red-500 shadow-[0_0_22px_rgba(239,68,68,0.65)]" : "bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.55)]")} />
          <div className="text-sm text-slate-200/90">Command Center</div>
          <div className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            connected ? "bg-emerald-400/10 text-emerald-200 border border-emerald-400/20" : "bg-amber-400/10 text-amber-200 border border-amber-400/20"
          )}
          >
            {connected ? "Live stream connected" : "Offline / reconnecting"}
          </div>
          <button
            type="button"
            onClick={() => {}}
            className="ml-auto text-xs text-slate-300/80 hover:text-slate-100 transition px-3 py-1 rounded-xl border border-white/10 bg-white/[0.03]"
          >
            AI Live
          </button>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
          <GlowCard
            label="CPU Usage"
            value={healthCards.cpu}
            tone={hot ? "red" : "blue"}
            live={!!hot}
            icon={<Cpu className={cn(hot ? "text-red-200" : "text-cyan-200")} size={18} />}
          />
          <GlowCard
            label="Memory Usage"
            value={healthCards.mem}
            tone={hot ? "red" : "blue"}
            live={!!hot}
            icon={<Database className={cn(hot ? "text-red-200" : "text-cyan-200")} size={18} />}
          />
          <GlowCard
            label="API Latency"
            value={healthCards.api}
            tone={hot ? "red" : "blue"}
            live={!!hot}
            icon={<Activity className={cn(hot ? "text-red-200" : "text-cyan-200")} size={18} />}
          />
          <GlowCard label="Database Health" value={healthCards.db} tone={hot ? "red" : "green"} icon={<HardDrive className="text-slate-200" size={18} />} />
          <GlowCard
            label="Active Incidents"
            value={healthCards.active}
            tone={hot ? "red" : "blue"}
            live={!!hot}
            icon={<AlertTriangle className={cn(hot ? "text-red-200" : "text-cyan-200")} size={18} />}
          />
          <GlowCard
            label="Threat Score"
            value={healthCards.threat}
            tone={hot ? "red" : "blue"}
            live={!!hot}
            icon={<ShieldAlert className={cn(hot ? "text-red-200" : "text-cyan-200")} size={18} />}
            sub={hot ? "autonomous response escalating" : "baseline monitoring"}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiveLineChart title="CPU trend" series={liveMetrics.series.cpu} stroke={hot ? "#fb7185" : "#22d3ee"} />
            <LiveLineChart title="Memory trend" series={liveMetrics.series.memory} stroke={hot ? "#f87171" : "#06b6d4"} />
            <LiveLineChart title="API latency" series={liveMetrics.series.api_latency} stroke={hot ? "#ef4444" : "#60a5fa"} />
            <LiveLineChart title="Request throughput" series={liveMetrics.series.throughput} stroke={hot ? "#fb7185" : "#22c55e"} />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <LiveLineChart title="Error rate" series={liveMetrics.series.error_rate} stroke={hot ? "#ef4444" : "#f97316"} />
            <div className={cn("rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-4", hot && "border-red-400/25 shadow-[0_0_35px_rgba(239,68,68,0.16)]")}> 
              <div className="text-sm font-medium text-slate-200/90">System Status</div>
              <div className="mt-3 grid grid-cols-1 gap-2">
                {[
                  { k: "frontend", icon: <Zap size={14} /> },
                  { k: "backend", icon: <Thermometer size={14} /> },
                  { k: "database", icon: <Cpu size={14} /> },
                  { k: "cache", icon: <Activity size={14} /> },
                  { k: "APIs", icon: <ShieldAlert size={14} /> },
                  { k: "cloud gateway", icon: <AlertTriangle size={14} /> },
                ].map((row) => {
                  const status = systemStatus?.[row.k] ?? "Healthy";
                  const sev = status === "Critical" ? "critical" : status === "Warning" ? "warning" : "healthy";
                  const color = sev === "critical" ? "bg-red-500/15 border-red-400/25" : sev === "warning" ? "bg-amber-400/10 border-amber-400/20" : "bg-cyan-400/10 border-cyan-400/20";
                  const label = status;

                  return (
                    <div key={row.k} className={cn("flex items-center justify-between gap-3 rounded-2xl border px-3 py-2", color)}>
                      <div className="flex items-center gap-2">
                        <span className={cn(sev === "critical" ? "text-red-200" : sev === "warning" ? "text-amber-200" : "text-cyan-200")}>{row.icon}</span>
                        <span className="text-xs text-slate-200/80">{row.k}</span>
                      </div>
                      <div className={cn("text-xs font-semibold", sev === "critical" ? "text-red-200" : sev === "warning" ? "text-amber-200" : "text-cyan-200")}>{label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <LogTerminal logs={logs} isHot={hot} />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <CinematicAI ai={ai} hot={hot} />

            <div className={cn("rounded-3xl border bg-white/[0.02] backdrop-blur-xl p-4 border-white/10", hot && "border-red-400/25 shadow-[0_0_30px_rgba(239,68,68,0.12)]")}> 
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-200/90">Active Incidents</div>
                <div className="text-xs text-slate-300/70">{activeIncidents.length ? `${activeIncidents.length} live` : "none"}</div>
              </div>
              <div className="mt-3 space-y-3">
                {activeIncidents.length ? (
                  activeIncidents.map((inc) => (
                    <motion.div
                      key={inc.id}
                      initial={false}
                      animate={
                        inc.severity === "CRITICAL"
                          ? { scale: [1, 1.02, 1], boxShadow: ["0 0 0 rgba(239,68,68,0)", "0 0 26px rgba(239,68,68,0.35)", "0 0 0 rgba(239,68,68,0)"] }
                          : { scale: [1, 1.015, 1] }
                      }
                      transition={{ duration: 1.6, repeat: inc.severity === "CRITICAL" ? Infinity : 2, ease: "easeInOut" }}
                      className="rounded-2xl border border-red-400/20 bg-red-500/5 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-300/80">{inc.category}</div>
                        <div className="text-xs font-semibold text-red-200">{inc.severity}</div>
                      </div>
                      <div className="mt-2 text-sm font-medium text-slate-100/95">{inc.current_impact}</div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {inc.affected_services.slice(0, 3).map((s) => (
                          <span key={s} className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200/80">
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-slate-300/70">ETA: {inc.estimated_resolution}</div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-sm text-slate-300/70">No active incidents. System stable.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

