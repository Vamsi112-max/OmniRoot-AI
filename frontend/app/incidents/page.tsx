"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, ShieldAlert, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { useOmniWebSocket } from "@/hooks/useOmniWebSocket";
import { cn } from "@/lib/cn";

interface Incident {
  id: string;
  category: string;
  severity: string;
  severity_score: number;
  started_at: number;
  ttl_s: number;
  affected_services: string[];
  current_impact: string;
  estimated_resolution: string;
  resolved_at?: number;
}

export default function IncidentsPage() {
  const { connected, activeIncidents, ai } = useOmniWebSocket();
  const [history, setHistory] = useState<Incident[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Construct API endpoint dynamically from WebSocket URL
  const apiBaseUrl = useMemo(() => {
    const wsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || "wss://omniroot-agentic-backend.onrender.com/ws/stream";
    return wsUrl.replace(/^ws(s)?:\/\//, "http$1://").replace(/\/ws\/stream$/, "/api");
  }, []);

  // Fetch incident history
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/incidents?limit=30`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      // ignore silently, fallback to empty list
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Poll history occasionally
    const interval = setInterval(fetchHistory, 4000);
    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  // Combine active incidents and history, removing duplicates
  const incidentsList = useMemo(() => {
    const activeIds = new Set(activeIncidents.map((i) => i.id));
    const inactiveHistory = history.filter((h) => !activeIds.has(h.id));
    
    return {
      active: activeIncidents as Incident[],
      history: inactiveHistory,
    };
  }, [activeIncidents, history]);

  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL":
        return "text-red-400 border-red-500/30 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.15)]";
      case "ERROR":
        return "text-orange-400 border-orange-500/30 bg-orange-500/10";
      case "WARNING":
        return "text-amber-400 border-amber-500/30 bg-amber-500/10";
      default:
        return "text-cyan-400 border-cyan-500/20 bg-cyan-500/5";
    }
  };

  return (
    <div className="relative min-h-screen p-6 md:p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert size={16} className="text-cyan-400" />
              <span className="text-xs text-cyan-400 uppercase tracking-widest font-semibold">Incident Command Logs</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">System Alerts & Incidents</h1>
            <p className="text-sm text-slate-400 mt-1">
              Audit logs of system degradation states, service vulnerabilities, and AI agent autonomous response.
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
              {connected ? "Incident Stream Live" : "Connecting Stream..."}
            </div>
          </div>
        </div>

        {/* Active Incidents Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Active Alerts</span>
            <span className="text-[10px] bg-red-500/15 border border-red-500/30 text-red-400 font-semibold px-2 py-0.5 rounded-full animate-pulse">
              {incidentsList.active.length} Live
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            {incidentsList.active.map((incident) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="rounded-3xl border border-red-500/30 bg-red-950/[0.04] shadow-[0_0_25px_rgba(239,68,68,0.1)] backdrop-blur-xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase animate-pulse">
                  Unresolved Threat
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={cn("text-xs font-mono px-2 py-0.5 border rounded-lg uppercase", getSeverityBadge(incident.severity))}>
                        {incident.severity}
                      </span>
                      <span className="text-slate-500 text-xs font-mono">Started: {new Date(incident.started_at * 1000).toLocaleTimeString()}</span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-100 tracking-tight">{incident.category}</h3>
                    <p className="text-sm text-slate-300">{incident.current_impact}</p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {incident.affected_services.map((service) => (
                        <span key={service} className="text-[10px] font-mono px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI mitigation display in incident */}
                  <div className="w-full md:w-80 bg-cyan-950/5 border border-cyan-500/25 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-cyan-300 font-semibold font-mono">
                        <Sparkles size={14} className="animate-spin-slow" />
                        AI MITIGATION
                      </span>
                      <span className="text-cyan-400 font-mono font-bold">{ai?.mitigation?.progress ?? 15}%</span>
                    </div>

                    <div className="w-full bg-white/5 border border-white/10 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${ai?.mitigation?.progress ?? 15}%` }}
                      />
                    </div>

                    <div className="text-[11px] font-mono text-slate-300 space-y-1.5 leading-relaxed bg-black/30 border border-white/5 rounded-xl p-2.5 max-h-24 overflow-y-auto">
                      <div>Status: <span className="text-cyan-300 font-semibold">{ai?.mitigation?.status || "Analyzing anomaly..."}</span></div>
                      <div>ETA: <span className="text-cyan-300">{incident.estimated_resolution}</span></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {incidentsList.active.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.01] backdrop-blur-xl p-8 text-center">
              <CheckCircle2 className="mx-auto text-cyan-400 mb-3" size={24} />
              <p className="text-sm font-medium text-slate-300">All Systems Stable</p>
              <p className="text-xs text-slate-500 mt-1">AI Guardian agents report zero critical vulnerabilities.</p>
            </div>
          )}
        </div>

        {/* Historical Logs Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Archived / Resolved Log</span>
            <span className="text-[10px] bg-white/5 border border-white/10 text-slate-400 px-2 py-0.5 rounded-full font-mono">
              {incidentsList.history.length} entries
            </span>
          </div>

          <div className="space-y-3">
            {incidentsList.history.map((incident) => (
              <div
                key={incident.id}
                className="rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className={cn("text-[10px] font-mono px-1.5 py-0.5 border rounded uppercase", getSeverityBadge(incident.severity))}>
                      {incident.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-500">ID: {incident.id.slice(0, 8)}...</span>
                  </div>
                  <h4 className="font-semibold text-slate-200">{incident.category}</h4>
                  <p className="text-xs text-slate-400">{incident.current_impact}</p>
                </div>

                <div className="flex flex-row md:flex-col md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock size={12} />
                    <span>Duration: {incident.ttl_s}s</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1.5">
                    <CheckCircle2 size={10} />
                    <span>Resolved by AI</span>
                  </div>
                </div>
              </div>
            ))}

            {incidentsList.history.length === 0 && !loadingHistory && (
              <div className="py-6 text-center text-xs text-slate-500 font-mono">
                No incident history recorded.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
