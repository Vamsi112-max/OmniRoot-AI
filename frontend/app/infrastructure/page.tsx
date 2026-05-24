"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Network, Server, HardDrive, Database, ShieldAlert, Sparkles, Activity } from "lucide-react";
import { useOmniWebSocket } from "@/hooks/useOmniWebSocket";
import { cn } from "@/lib/cn";

export default function InfrastructurePage() {
  const { connected, metrics, systemStatus } = useOmniWebSocket();

  // Get live metrics with logical fallbacks
  const latestMetrics = useMemo(() => {
    return metrics?.latest ?? {
      cpu: 34,
      memory: 52,
      api_latency: 80,
      throughput: 520,
      error_rate: 1.5,
    };
  }, [metrics]);

  // Dynamically compute infrastructure health and metrics based on live WS stream
  const infrastructure = useMemo(() => {
    const backendHealth = (systemStatus?.backend ?? "Healthy").toLowerCase();
    const dbHealth = (systemStatus?.database ?? "Healthy").toLowerCase();
    const cacheHealth = (systemStatus?.cache ?? "Healthy").toLowerCase();
    const gwHealth = (systemStatus?.["cloud gateway"] ?? "Healthy").toLowerCase();

    return [
      {
        id: 1,
        name: "Core API Cluster",
        health: backendHealth,
        uptime: backendHealth === "critical" ? "98.2%" : "99.9%",
        cpu: Math.round(latestMetrics.cpu),
        memory: Math.round(latestMetrics.memory),
        icon: Server,
        metricLabel: "Active Sessions",
        metricVal: `${Math.round(latestMetrics.throughput * 4.2)} users`,
        statusKey: "backend",
      },
      {
        id: 2,
        name: "Distributed DB Cluster",
        health: dbHealth,
        uptime: dbHealth === "critical" ? "99.4%" : "99.95%",
        // DB load scales with backend and throughput
        cpu: Math.round(Math.min(99, 15 + latestMetrics.cpu * 0.5 + (latestMetrics.error_rate > 5 ? 30 : 0))),
        memory: Math.round(Math.min(99, 58 + latestMetrics.memory * 0.2)),
        icon: Database,
        metricLabel: "Query Performance",
        metricVal: `${Math.round(latestMetrics.api_latency * 0.4)}ms avg`,
        statusKey: "database",
      },
      {
        id: 3,
        name: "In-Memory Redis Cache",
        health: cacheHealth,
        uptime: cacheHealth === "critical" ? "97.1%" : "98.9%",
        // Cache CPU spikes during overflow, memory is always high
        cpu: Math.round(Math.min(99, 10 + latestMetrics.cpu * 0.3 + (cacheHealth === "critical" ? 75 : 0))),
        memory: Math.round(Math.min(99, 78 + (cacheHealth === "critical" ? 18 : latestMetrics.memory * 0.1))),
        icon: HardDrive,
        metricLabel: "Eviction Rate",
        metricVal: cacheHealth === "critical" ? "22,400 keys/s" : "120 keys/s",
        statusKey: "cache",
      },
      {
        id: 4,
        name: "Edge API Gateway",
        health: gwHealth,
        uptime: gwHealth === "critical" ? "99.1%" : "100%",
        cpu: Math.round(Math.min(99, 5 + latestMetrics.throughput * 0.05)),
        memory: Math.round(Math.min(99, 18 + latestMetrics.memory * 0.1)),
        icon: Network,
        metricLabel: "Throughput Rate",
        metricVal: `${Math.round(latestMetrics.throughput)} rps`,
        statusKey: "cloud gateway",
      },
    ];
  }, [latestMetrics, systemStatus]);

  const getHealthColor = (health: string) => {
    if (health === "critical") return "text-red-400 border-red-500/30 bg-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.15)] animate-pulse";
    if (health === "warning") return "text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.1)]";
    return "text-cyan-400 border-cyan-500/20 bg-cyan-500/5 shadow-[0_0_12px_rgba(34,211,238,0.05)]";
  };

  const getProgressColor = (health: string) => {
    if (health === "critical") return "from-red-500 to-rose-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
    if (health === "warning") return "from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]";
    return "from-cyan-400 to-blue-600 shadow-[0_0_10px_rgba(34,211,238,0.4)]";
  };

  return (
    <div className="relative min-h-screen p-6 md:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} className="text-cyan-400" />
              <span className="text-xs text-cyan-400 uppercase tracking-widest font-semibold">SOC System Map</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Infrastructure Node Map</h1>
            <p className="text-sm text-slate-400 mt-1">
              Live telemetry monitoring container health, memory retention watermarks, and network throughput vectors.
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
              {connected ? "Receiving Telemetry Streams" : "Offline / Connecting..."}
            </div>
          </div>
        </div>

        {/* Infrastructure Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {infrastructure.map((item, idx) => {
            const Icon = item.icon;
            const isAnomalous = item.health !== "healthy";

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={cn(
                  "rounded-3xl border backdrop-blur-xl p-6 transition-all duration-300 flex flex-col justify-between relative overflow-hidden",
                  isAnomalous 
                    ? item.health === "critical"
                      ? "border-red-500/35 bg-red-950/5 shadow-[0_0_24px_rgba(239,68,68,0.12)]"
                      : "border-amber-500/30 bg-amber-950/5 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20"
                )}
              >
                {/* Node Status Indicator Tag */}
                <div className={cn(
                  "absolute top-0 right-0 text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase border-l border-b",
                  item.health === "critical" 
                    ? "bg-red-500/15 border-red-500/25 text-red-300 animate-pulse" 
                    : item.health === "warning"
                    ? "bg-amber-500/15 border-amber-500/25 text-amber-300"
                    : "bg-cyan-500/10 border-cyan-500/20 text-cyan-300"
                )}>
                  {item.health}
                </div>

                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <div className={cn("w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0", getHealthColor(item.health))}>
                      <Icon size={22} className={cn(isAnomalous && "animate-pulse")} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100 text-lg leading-snug">{item.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Uptime SLA: {item.uptime}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* CPU Usage progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-mono">CPU Allocation</span>
                        <span className={cn("font-bold font-mono", item.cpu > 80 ? "text-red-400" : item.cpu > 60 ? "text-amber-400" : "text-cyan-300")}>
                          {item.cpu}%
                        </span>
                      </div>
                      <div className="w-full bg-white/5 border border-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className={cn("bg-gradient-to-r h-full rounded-full transition-all duration-500", getProgressColor(item.cpu > 85 ? "critical" : item.cpu > 65 ? "warning" : "healthy"))}
                          style={{ width: `${item.cpu}%` }}
                        />
                      </div>
                    </div>

                    {/* Memory Usage progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-mono">Memory Footprint</span>
                        <span className={cn("font-bold font-mono", item.memory > 85 ? "text-red-400" : item.memory > 70 ? "text-amber-400" : "text-cyan-300")}>
                          {item.memory}%
                        </span>
                      </div>
                      <div className="w-full bg-white/5 border border-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className={cn("bg-gradient-to-r h-full rounded-full transition-all duration-500", getProgressColor(item.memory > 88 ? "critical" : item.memory > 75 ? "warning" : "healthy"))}
                          style={{ width: `${item.memory}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance stats bar */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">{item.metricLabel}</span>
                    <span className="text-sm font-semibold text-slate-200 mt-0.5 inline-block">{item.metricVal}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">Telemetry Node ID</span>
                    <span className="text-xs font-mono text-slate-400 mt-0.5 inline-block">node-0{item.id}x</span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
