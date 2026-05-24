"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Search, Terminal, ShieldCheck, Zap } from "lucide-react";

import { useOmniWebSocket } from "@/hooks/useOmniWebSocket";
import { cn } from "@/lib/cn";

type DecoderMode = "auto" | "explain" | "playbook";

export default function DecoderPage() {
  const { connected, metrics, activeIncidents, systemStatus, ai } = useOmniWebSocket();

  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<DecoderMode>("auto");
  const [answer, setAnswer] = useState<string>(
    "I can decode live telemetry into an incident narrative, explain likely root causes, and output an actionable playbook. Type a question like: ‘Why is latency spiking?’ or ‘Decode active incident’."
  );

  const context = useMemo(() => {
    const cpu = metrics?.latest?.cpu ?? 0;
    const mem = metrics?.latest?.memory ?? 0;
    const lat = metrics?.latest?.api_latency ?? 0;
    const thr = metrics?.latest?.throughput ?? 0;
    const err = metrics?.latest?.error_rate ?? 0;

    const topIncident = activeIncidents?.[0];

    return {
      connected,
      cpu,
      mem,
      latency: lat,
      throughput: thr,
      error_rate: err,
      systemStatus,
      activeIncident: topIncident ?? null,
      ai,
    };
  }, [connected, metrics, activeIncidents, systemStatus, ai]);

  const runDecode = () => {
    const q = query.trim().toLowerCase();
    const inc = context.activeIncident;

    const guidance = {
      header: inc ? `Active anomaly decoded: ${inc.category} (${inc.severity})` : "No active incident detected",
      status: inc
        ? `Impact: ${inc.current_impact}. ETA: ${inc.estimated_resolution}.`
        : "System is stable; decoder focuses on proactive risk surfacing.",
      telemetry: `Telemetry snapshot → CPU ${Math.round(context.cpu)}%, MEM ${Math.round(context.mem)}%, Latency ${Math.round(
        context.latency
      )}ms, Throughput ${Math.round(context.throughput)}, Error rate ${context.error_rate.toFixed(1)}`,
      root:
        inc && context.ai?.root_cause
          ? `Likely root cause: ${context.ai.root_cause}`
          : "Root cause will be derived once an incident is active.",
      playbook:
        inc && context.ai?.mitigation?.status
          ? `Playbook status: ${context.ai.mitigation.status} (${context.ai.mitigation.progress}%).\nNext actions: ${(context.ai.recommendations ?? []).slice(0, 2).join("; ")}`
          : "No mitigation playbook is currently running.",
    };

    if (!q) {
      setAnswer(`${guidance.header}\n\n${guidance.status}\n${guidance.telemetry}\n\n${guidance.root}\n\n${guidance.playbook}`);
      return;
    }

    if (q.includes("why") || q.includes("root") || q.includes("cause")) {
      setAnswer(`${guidance.header}\n\n${guidance.root}\n\n${guidance.telemetry}`);
      return;
    }

    if (q.includes("playbook") || q.includes("mitigate") || q.includes("fix") || q.includes("action")) {
      setAnswer(`${guidance.header}\n\n${guidance.playbook}\n\n${guidance.telemetry}`);
      return;
    }

    if (q.includes("explain") || q.includes("latency") || q.includes("spike")) {
      const explain = `Latency decode:\n- Latency observed: ${Math.round(context.latency)}ms\n- Error rate: ${context.error_rate.toFixed(
        1
      )}\n- System view: ${context.systemStatus?.backend ?? "Healthy"} / APIs: ${
        context.systemStatus?.["APIs"] ?? "Healthy"
      }\n\nHypothesis: ${context.ai?.root_cause ?? "Telemetry is within normal drift; watch for correlation with incident signals."}`;
      setAnswer(`${guidance.header}\n\n${explain}`);
      return;
    }

    if (mode === "explain") {
      setAnswer(`${guidance.header}\n\nExplanation:\n${guidance.root}\n\n${guidance.telemetry}`);
      return;
    }

    if (mode === "playbook") {
      setAnswer(`${guidance.header}\n\nPlaybook:\n${guidance.playbook}`);
      return;
    }

    // auto
    setAnswer(`${guidance.header}\n\n${guidance.status}\n${guidance.telemetry}\n\n${guidance.root}\n\n${guidance.playbook}\n\nDecoded query: “${query.trim()}”`);
  };

  return (
    <div className="relative min-h-screen p-6 md:p-8 flex flex-col overflow-hidden">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col min-h-0 relative z-10">
        <div className="mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Search size={18} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100 tracking-tight">AI Decoder</h1>
              <p className="text-sm text-slate-400">Decode live telemetry into an incident narrative + agentic playbook.</p>
            </div>
            <div className="ml-auto hidden md:flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border border-white/10 bg-white/[0.02] text-slate-200">
              <Zap size={14} />
              <span>{connected ? "Live" : "Offline"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
          <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/[0.01] backdrop-blur-xl p-6 min-h-0 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Ask the decoder</div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && runDecode()}
                      placeholder="e.g. Why is latency spiking? Decode active incident. Output next playbook steps."
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/30 transition shadow-inner font-mono"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={runDecode}
                    className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-medium text-white hover:opacity-90 transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    <Terminal size={16} />
                    Decode
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              {([
                { k: "auto", label: "Auto" },
                { k: "explain", label: "Explain" },
                { k: "playbook", label: "Playbook" },
              ] as const).map((it) => (
                <button
                  key={it.k}
                  onClick={() => setMode(it.k)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl border text-xs transition font-semibold",
                    mode === it.k
                      ? "bg-white/[0.06] border-cyan-400/30 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.10)]"
                      : "bg-white/[0.02] border-white/10 text-slate-300/80 hover:bg-white/[0.05]"
                  )}
                >
                  {it.label}
                </button>
              ))}
            </div>

            <div className="flex-1 min-h-0 rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl p-4 overflow-auto">
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  animate={connected ? { boxShadow: "0 0 22px rgba(34,211,238,0.35)" } : undefined}
                  transition={{ duration: 1.2, repeat: connected ? Infinity : 0, ease: "easeInOut" }}
                  className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.55)]"
                />
                <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-cyan-200" />
                  Decoder output
                </div>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-sm text-slate-200/90">{answer}</pre>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.01] backdrop-blur-xl p-6 min-h-0 flex flex-col gap-4">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Active context</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400/80">Incident</div>
                  <div className="text-xs font-semibold text-slate-200">{activeIncidents.length ? activeIncidents[0].category : "None"}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400/80">Severity</div>
                  <div className="text-xs font-semibold text-slate-200">{activeIncidents.length ? activeIncidents[0].severity : "INFO"}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400/80">Root cause</div>
                  <div className="text-xs font-semibold text-slate-200 truncate max-w-[180px]">{ai?.root_cause ?? "—"}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Sparkles size={18} className="text-cyan-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-100">Agentic access</div>
                <div className="text-xs text-slate-400">Decoder uses live WS telemetry + AI snapshots (no external calls).</div>
              </div>
            </div>

            <div className="mt-auto">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Suggested questions</div>
              <div className="space-y-2">
                {["Decode active incident", "Why is latency spiking?", "Output mitigation playbook steps", "Summarize system health"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setQuery(s);
                      setTimeout(() => runDecode(), 0);
                    }}
                    className="w-full text-left rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-sm text-slate-200 px-3 py-2 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

