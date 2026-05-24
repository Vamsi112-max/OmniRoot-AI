"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type OmniMetricSeriesPoint = { x: number; y: number };

export type OmniMetricsPayload = {
  latest: {
    cpu: number;
    memory: number;
    api_latency: number;
    throughput: number;
    error_rate: number;
  };
  series: {
    cpu: OmniMetricSeriesPoint[];
    memory: OmniMetricSeriesPoint[];
    api_latency: OmniMetricSeriesPoint[];
    throughput: OmniMetricSeriesPoint[];
    error_rate: OmniMetricSeriesPoint[];
  };
};

export type OmniLogEntry = {
  ts: number;
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL" | string;
  message: string;
};

export type OmniIncidentAlert = {
  id: string;
  category: string;
  severity: string;
  severity_score: number;
  started_at: number;
  ttl_s: number;
  affected_services: string[];
  current_impact: string;
  estimated_resolution: string;
};

export type OmniAiInsight = {
  root_cause: string;
  recommendations: string[];
  severity: string;
  risks: string[];
  predicted_impact: string;
  predictions: { outage_confidence: number; expected_recovery_minutes: number };
  timeline_reconstruction: { t: string; event: string }[];
  mitigation?: {
    status: string;
    progress: number;
    logs: string[];
    elapsed: number;
    ttl: number;
  };
};

export function useOmniWebSocket() {
  const wsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || "wss://omniroot-agentic-backend.onrender.com/ws/stream";

  const [metrics, setMetrics] = useState<OmniMetricsPayload | null>(null);
  const [logs, setLogs] = useState<OmniLogEntry[]>([]);
  const [incidentAlerts, setIncidentAlerts] = useState<OmniIncidentAlert[]>([]);
  const [activeIncidents, setActiveIncidents] = useState<OmniIncidentAlert[]>([]);
  const [systemStatus, setSystemStatus] = useState<Record<string, string>>({});
  const [ai, setAi] = useState<OmniAiInsight | null>(null);
  const [connected, setConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let cancelled = false;

    const connect = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!cancelled) setConnected(true);
        };
        ws.onclose = () => {
          if (!cancelled) setConnected(false);
        };
        ws.onerror = () => {
          if (!cancelled) setConnected(false);
        };
        ws.onmessage = (event) => {
          if (cancelled) return;
          try {
            const data = JSON.parse(event.data as string);

            if (data.metrics) setMetrics(data.metrics as OmniMetricsPayload);
            if (Array.isArray(data.logs)) {
              // Keep last ~200 for smooth terminal
              setLogs((prev) => {
                const merged = [...prev, ...data.logs];
                return merged.slice(-220);
              });
            }
            if (Array.isArray(data.incident_alerts)) {
              setIncidentAlerts(data.incident_alerts as OmniIncidentAlert[]);
            }
            if (Array.isArray(data.active_incidents)) {
              setActiveIncidents(data.active_incidents as OmniIncidentAlert[]);
            }
            if (data.system_status) {
              setSystemStatus(data.system_status as Record<string, string>);
            }
            if (data.ai) {
              setAi(data.ai as OmniAiInsight);
            }
          } catch {
            // ignore
          }
        };
      } catch {
        // ignore
      }
    };

    connect();

    return () => {
      cancelled = true;
      try {
        wsRef.current?.close();
      } catch {
        // ignore
      }
    };
  }, [wsUrl]);

  return useMemo(
    () => ({
      connected,
      metrics,
      logs,
      incidentAlerts,
      activeIncidents,
      systemStatus,
      ai,
    }),
    [connected, metrics, logs, incidentAlerts, activeIncidents, systemStatus, ai]
  );
}

