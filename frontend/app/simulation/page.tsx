"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Zap,
  AlertCircle,
  Cpu,
  Database,
  Network,
  HardDrive,
  Sparkles,
  CheckCircle2,
  Terminal,
  Clock,
  RefreshCw
} from "lucide-react";
import { useOmniWebSocket } from "@/hooks/useOmniWebSocket";
import { cn } from "@/lib/cn";

export default function SimulationPage() {
  const { connected, activeIncidents, ai } = useOmniWebSocket();
  const [triggering, setTriggering] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Construct API endpoint dynamically from WebSocket URL
  const apiBaseUrl = useMemo(() => {
    const wsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || "wss://omniroot-agentic-backend.onrender.com/ws/stream";
    return wsUrl.replace(/^ws(s)?:\/\//, "http$1://").replace(/\/ws\/stream$/, "/api");
  }, []);

  const simulationTypes = [
    {
      name: "CPU Spike Simulation",
      category: "Traffic Spike",
      description: "Simulates a sudden traffic surge leading to container CPU exhaustion.",
      icon: Cpu,
      tone: "blue" as const,
      backendName: "CPU Spike Simulation",
    },
    {
      name: "Memory Leak Test",
      category: "Memory Leak",
      description: "Generates high memory watermark limits and suspends garbage collection.",
      icon: Database,
      tone: "violet" as const,
      backendName: "Memory Leak Test",
    },
    {
      name: "Network Latency Inject",
      category: "API Timeout",
      description: "Simulates package loss and latency up to 720ms on core API routes.",
      icon: Network,
      tone: "amber" as const,
      backendName: "Network Latency Inject",
    },
    {
      name: "Cache Overflow Test",
      category: "Cache Overflow",
      description: "Fills cache nodes to trigger eviction storms and key expirations.",
      icon: HardDrive,
      tone: "rose" as const,
      backendName: "Cache Overflow Test",
    },
  ];

  const handleTrigger = async (backendName: string) => {
    setErrorMsg(null);
    setTriggering(backendName);
    try {
      const res = await fetch(`${apiBaseUrl}/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: backendName }),
      });
      if (!res.ok) {
        throw new Error(`Failed with status: ${res.status}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Could not contact simulator server");
    } finally {
      setTriggering(null);
    }
  };

  // Find out if any of the simulation categories are currently active in incidents
  const getActiveSimulation = () => {
    if (!activeIncidents || activeIncidents.length === 0) return null;
    const activeCat = activeIncidents[0].category;
    return simulationTypes.find((s) => s.category === activeCat) || null;
  };

  const currentActiveSim = getActiveSimulation();

  return (
    <div className="relative min-h-screen p-6 md:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-cyan-400 animate-pulse" />
              <span className="text-xs text-cyan-400 uppercase tracking-widest font-semibold">Autonomous Threat Arena</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">AI Simulations</h1>
            <p className="text-sm text-slate-400 mt-1">
              Trigger infrastructure failures to observe self-healing AI agents auto-detect and auto-resolve threats.
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
              {connected ? "Simulator Server Active" : "Connecting to Simulator..."}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-200 rounded-2xl p-4 text-sm flex items-center gap-3 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <AlertCircle className="shrink-0 text-red-400" size={18} />
            <div>
              <span className="font-semibold">Connection Error:</span> {errorMsg}. Ensure the backend is running on <code className="bg-black/40 px-1 py-0.5 rounded text-red-300">port 8000</code>.
            </div>
          </div>
        )}

        {/* Simulation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {simulationTypes.map((sim, idx) => {
            const Icon = sim.icon;
            const isSimActive = currentActiveSim?.backendName === sim.backendName;
            const isDisabled = !!currentActiveSim && !isSimActive;

            const toneClasses = {
              blue: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.05)]",
              violet: "border-violet-500/20 bg-violet-500/5 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.05)]",
              amber: "border-amber-500/20 bg-amber-500/5 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]",
              rose: "border-rose-500/20 bg-rose-500/5 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.05)]",
            }[sim.tone];

            return (
              <motion.div
                key={sim.backendName}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={cn(
                  "rounded-3xl border backdrop-blur-xl p-6 transition-all duration-300 flex flex-col justify-between relative overflow-hidden",
                  isSimActive 
                    ? "border-red-500/40 bg-red-500/[0.04] shadow-[0_0_25px_rgba(239,68,68,0.15)]" 
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20"
                )}
              >
                {isSimActive && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase animate-pulse">
                    Active Threat
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn("w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0", isSimActive ? "bg-red-500/10 border-red-500/35 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : toneClasses)}>
                      <Icon size={22} className={cn(isSimActive && "animate-spin-slow")} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100 text-lg">{sim.name}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{sim.category}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300/80 mb-6 leading-relaxed">
                    {sim.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                  <div className="text-xs text-slate-400">
                    {isSimActive ? (
                      <span className="text-red-400 font-semibold animate-pulse">AI Agent Resolving...</span>
                    ) : (
                      <span>Autonomous mitigation: Enabled</span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isDisabled || triggering === sim.backendName}
                    onClick={() => handleTrigger(sim.backendName)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-xs font-semibold transition flex items-center gap-2",
                      isSimActive
                        ? "bg-red-500/10 text-red-300 border border-red-500/30 cursor-not-allowed"
                        : isDisabled
                        ? "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed"
                        : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/40"
                    )}
                  >
                    {triggering === sim.backendName ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : isSimActive ? (
                      <Clock size={14} />
                    ) : (
                      <Zap size={14} />
                    )}
                    {isSimActive ? "Simulating" : "Trigger Simulation"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* AI Autonomous Mitigation Arena */}
        <motion.div
          layout
          className={cn(
            "rounded-3xl border backdrop-blur-xl p-6 transition-all duration-300 overflow-hidden relative",
            currentActiveSim 
              ? "border-cyan-500/30 bg-cyan-950/5 shadow-[0_0_35px_rgba(6,182,212,0.12)]" 
              : "border-white/10 bg-white/[0.01]"
          )}
        >
          {/* Subtle grid background for HUD */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-6">
            
            {/* Arena Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0",
                  currentActiveSim 
                    ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]" 
                    : "bg-white/5 border-white/10 text-slate-400"
                )}>
                  <Sparkles size={18} className={cn(currentActiveSim && "animate-spin-slow")} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">AI Autonomous Mitigation Arena</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time AI logic visualization during simulated events.
                  </p>
                </div>
              </div>

              {currentActiveSim ? (
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  <span className="text-xs text-cyan-400 font-mono font-semibold uppercase tracking-wider">
                    {ai?.mitigation?.status || "Analyzing threat..."}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-700" />
                  <span>Agent Status: STANDBY (Monitoring)</span>
                </div>
              )}
            </div>

            {/* Arena Content */}
            <AnimatePresence mode="wait">
              {currentActiveSim ? (
                <motion.div
                  key="active-mitigation"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  
                  {/* Left stats/progress */}
                  <div className="space-y-4 lg:border-r lg:border-white/5 lg:pr-6 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-slate-400 font-mono mb-1">Target Anomaly</div>
                      <div className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        {currentActiveSim.name}
                      </div>
                      <p className="text-xs text-slate-400 mt-2 font-mono leading-relaxed">
                        Playbook: <code className="bg-white/5 border border-white/10 px-1 py-0.5 rounded text-cyan-300">MITIGATE_{currentActiveSim.category.replace(" ", "_").toUpperCase()}</code>
                      </p>
                    </div>

                    <div className="py-4 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-mono">Mitigation Progress</span>
                        <span className="text-cyan-400 font-bold font-mono">{ai?.mitigation?.progress ?? 0}%</span>
                      </div>
                      <div className="w-full bg-white/5 border border-white/10 rounded-full h-3 overflow-hidden p-[1px]">
                        <motion.div
                          className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${ai?.mitigation?.progress ?? 0}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                        <CheckCircle2 size={14} />
                        Autonomous Mode Active
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                        AI Agent is running closed-loop. Human overrides are disabled. Auto-resolution target is &lt;40s.
                      </p>
                    </div>
                  </div>

                  {/* Right Playbook Terminal */}
                  <div className="lg:col-span-2 flex flex-col h-[280px]">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
                      <Terminal size={14} className="text-cyan-400" />
                      <span>AI Agent Log stream</span>
                    </div>

                    <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 font-mono text-xs overflow-y-auto leading-relaxed shadow-inner">
                      <div className="space-y-2">
                        {ai?.mitigation?.logs?.map((l: string, idx: number) => {
                          const isSuccess = l.includes("successfully") || l.includes("restored") || l.includes("100% success");
                          const isAlert = l.includes("CRITICAL") || l.includes("Anomaly");
                          const isStep = l.includes("Step");
                          
                          return (
                            <div
                              key={idx}
                              className={cn(
                                "flex items-start gap-2",
                                isSuccess 
                                  ? "text-emerald-400" 
                                  : isAlert 
                                  ? "text-red-400 font-semibold" 
                                  : isStep 
                                  ? "text-cyan-300" 
                                  : "text-slate-300"
                              )}
                            >
                              <span className="text-cyan-500 shrink-0">&raquo;</span>
                              <span>{l}</span>
                            </div>
                          );
                        })}
                        {(!ai?.mitigation?.logs || ai.mitigation.logs.length === 0) && (
                          <div className="text-slate-500 flex items-center gap-2">
                            <span className="w-1 h-3 bg-cyan-400 animate-pulse" />
                            Analyzing telemetric patterns...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </motion.div>
              ) : (
                <motion.div
                  key="idle-mitigation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                    <Activity size={28} className="text-cyan-400 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-200">No Threat Detected</h3>
                  <p className="text-sm text-slate-400 max-w-md mt-1 mb-6">
                    AI Guardian agents are idle and monitoring the network streams. Start a simulation above to engage the AI mitigator.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>

      </div>
    </div>
  );
}
