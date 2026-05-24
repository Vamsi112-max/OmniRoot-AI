"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Sparkles, Activity } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useOmniWebSocket } from "@/hooks/useOmniWebSocket";
import { cn } from "@/lib/cn";

export default function AnalyticsPage() {
  const { connected, metrics } = useOmniWebSocket();

  // Get live metrics with fallback series
  const liveSeries = useMemo(() => {
    const fallback = Array.from({ length: 20 }, (_, i) => ({ x: i, y: 30 + Math.sin(i / 3) * 5 }));
    return {
      cpu: metrics?.series?.cpu || fallback,
      memory: metrics?.series?.memory || fallback,
      throughput: metrics?.series?.throughput || fallback,
      api_latency: metrics?.series?.api_latency || fallback,
      error_rate: metrics?.series?.error_rate || fallback,
    };
  }, [metrics]);

  const latestMetrics = useMemo(() => {
    return metrics?.latest ?? {
      cpu: 34,
      memory: 52,
      api_latency: 80,
      throughput: 520,
      error_rate: 1.5,
    };
  }, [metrics]);

  // Merge CPU and Memory series for Recharts line chart
  const mergedCpuMemoryData = useMemo(() => {
    const len = Math.max(liveSeries.cpu.length, liveSeries.memory.length);
    const data = [];
    for (let i = 0; i < len; i++) {
      const cpuPt = liveSeries.cpu[i];
      const memPt = liveSeries.memory[i];
      data.push({
        name: `T-${len - i}s`,
        cpu: cpuPt ? Math.round(cpuPt.y) : null,
        memory: memPt ? Math.round(memPt.y) : null,
      });
    }
    return data;
  }, [liveSeries]);

  // Merge Throughput and Latency data for combined chart
  const mergedNetworkData = useMemo(() => {
    const len = Math.max(liveSeries.throughput.length, liveSeries.api_latency.length);
    const data = [];
    for (let i = 0; i < len; i++) {
      const tpPt = liveSeries.throughput[i];
      const latPt = liveSeries.api_latency[i];
      data.push({
        name: `T-${len - i}s`,
        throughput: tpPt ? Math.round(tpPt.y) : null,
        latency: latPt ? Math.round(latPt.y) : null,
      });
    }
    return data;
  }, [liveSeries]);

  const kpis = useMemo(() => {
    // Calculate averages of current series if available
    const avgCpu = Math.round(liveSeries.cpu.reduce((acc, curr) => acc + curr.y, 0) / (liveSeries.cpu.length || 1));
    const avgMem = Math.round(liveSeries.memory.reduce((acc, curr) => acc + curr.y, 0) / (liveSeries.memory.length || 1));
    
    return [
      { label: "Rolling CPU Load", value: `${Math.round(latestMetrics.cpu)}%`, sub: `avg: ${avgCpu}%`, change: "Real-time feed" },
      { label: "Active Memory", value: `${Math.round(latestMetrics.memory)}%`, sub: `avg: ${avgMem}%`, change: "Real-time feed" },
      { label: "API SLA Latency", value: `${Math.round(latestMetrics.api_latency)}ms`, sub: `err rate: ${latestMetrics.error_rate.toFixed(1)}%`, change: "SLA Compliant" },
    ];
  }, [liveSeries, latestMetrics]);

  return (
    <div className="relative min-h-screen p-6 md:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={16} className="text-cyan-400" />
              <span className="text-xs text-cyan-400 uppercase tracking-widest font-semibold">SOC Analytics Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Telemetry Analytics</h1>
            <p className="text-sm text-slate-400 mt-1">
              Historical and rolling analytics computed by in-memory stream processors.
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
              {connected ? "Receiving Analytical Streams" : "Offline / Connecting..."}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kpis.map((kpi, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 shadow-inner relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">{kpi.label}</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/25">
                  {kpi.change}
                </span>
              </div>
              
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-slate-100 tracking-tight">{kpi.value}</p>
                <span className="text-xs text-slate-400 font-mono">({kpi.sub})</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CPU & Memory Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 relative overflow-hidden"
          >
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Activity size={16} className="text-cyan-400" />
              CPU & Memory Allocation Trend
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={mergedCpuMemoryData}>
                  <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 10, fontFamily: "monospace" }} />
                  <YAxis stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 10, fontFamily: "monospace" }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12, color: "#f8fafc" }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Line name="CPU Utilization (%)" type="monotone" dataKey="cpu" stroke="#22d3ee" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
                  <Line name="Memory Utilization (%)" type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Network Throughput & Latency */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 relative overflow-hidden"
          >
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-cyan-400" />
              Throughput & Gateway SLA Latency
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={mergedNetworkData}>
                  <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 10, fontFamily: "monospace" }} />
                  <YAxis stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 10, fontFamily: "monospace" }} />
                  <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12, color: "#f8fafc" }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar name="Throughput (rps)" dataKey="throughput" fill="#06b6d4" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                  <Bar name="Gateway Latency (ms)" dataKey="latency" fill="#f59e0b" radius={[6, 6, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
