"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { useOmniWebSocket } from "@/hooks/useOmniWebSocket";
import { cn } from "@/lib/cn";

interface Message {
  id: number;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function CopilotPage() {
  const { connected, metrics, activeIncidents, systemStatus, ai } = useOmniWebSocket();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "assistant",
      content:
        "System online. I am OmniRoot AI Guardian Copilot. I scan system streams, logs, and trace routes for anomalies in real-time. I can also execute diagnostic simulations. What query or command should I process?",
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  // Construct API endpoint dynamically from WebSocket URL
  const apiBaseUrl = useMemo(() => {
    const wsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || "wss://omniroot-agentic-backend.onrender.com/ws/stream";
    return wsUrl.replace(/^ws(s)?:\/\//, "http$1://").replace(/\/ws\/stream$/, "/api");
  }, []);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    // Single flying notification after login (demo)
    try {
      const pending = localStorage.getItem("omni_post_login_toast_pending") === "true";
      if (!pending) return;
      localStorage.setItem("omni_post_login_toast_pending", "false");

      const toast = document.createElement("div");
      toast.innerHTML = `
        <div style="position:fixed; top:24px; right:24px; z-index:9999;">
          <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
            <div style="background: rgba(2,6,23,0.75); border: 1px solid rgba(34,211,238,0.35); backdrop-filter: blur(12px); padding: 12px 14px; border-radius: 16px; color: rgb(207, 250, 254); box-shadow: 0 0 40px rgba(34,211,238,0.18); animation: omniToastIn 420ms ease-out;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="display:inline-block; width:10px; height:10px; background: rgb(34,211,238); border-radius: 9999; box-shadow: 0 0 18px rgba(34,211,238,0.65);"></span>
                <div>
                  <div style="font-weight:700; font-size:12px;">Welcome to OmniRoot</div>
                  <div style="opacity:0.85; font-size:12px; margin-top:2px;">Laptop/System key handshake unlocked. Monitoring live telemetry.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      const style = document.createElement("style");
      style.innerHTML = `
        @keyframes omniToastIn {
          from { transform: translateY(-10px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);

      document.body.appendChild(toast);

      window.setTimeout(() => {
        toast.remove();
        style.remove();
      }, 3200);
    } catch {
      // ignore
    }
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userText = trimmed;
    const ts = new Date().toLocaleTimeString();

    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, type: "user", content: userText, timestamp: ts }
    ]);
    setInput("");
    setIsTyping(true);

    setTimeout(async () => {
      const lower = userText.toLowerCase();
      let reply = "";
      let triggeredSim = false;

      // Greeting behavior (requested)
      const isGreeting =
        lower.trim() === "hi" ||
        lower.trim() === "hello" ||
        lower.trim() === "hey" ||
        lower.includes("hi") ||
        lower.includes("hello") ||
        lower.includes("hey");

      if (isGreeting) {
        reply = `hi\n\nI am OmniRoot Copilot — the autonomous AI operations intelligence assistant for OmniRoot Agentic AI.\n\nUnlike traditional chatbots, OmniRoot Copilot combines GPT-style reasoning, Gemini-inspired infrastructure intelligence, real-time telemetry analysis, WebSocket streaming, incident decoding, and autonomous operational workflows.\n\nThe platform continuously monitors infrastructure signals through FastAPI + WebSocket telemetry pipelines and provides real-time incident reasoning, mitigation intelligence, anomaly detection, and infrastructure recovery insights.`;

        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            type: "assistant",
            content: reply,
            timestamp: new Date().toLocaleTimeString(),
          }
        ]);

        setIsTyping(false);
        return;
      }

      // 1. Check for Simulation commands (preserved logic)
      if (
        lower.includes("simulate") ||
        lower.includes("trigger") ||
        lower.includes("run") ||
        lower.includes("inject") ||
        lower.includes("spike") ||
        lower.includes("leak") ||
        lower.includes("overflow")
      ) {
        let simName = "";
        let displayName = "";

        if (lower.includes("cpu") || lower.includes("traffic")) {
          simName = "CPU Spike Simulation";
          displayName = "CPU Spike Simulation";
        } else if (lower.includes("memory") || lower.includes("leak")) {
          simName = "Memory Leak Test";
          displayName = "Memory Leak Test";
        } else if (lower.includes("latency") || lower.includes("network") || lower.includes("timeout")) {
          simName = "Network Latency Inject";
          displayName = "Network Latency Inject";
        } else if (lower.includes("cache") || lower.includes("redis")) {
          simName = "Cache Overflow Test";
          displayName = "Cache Overflow Test";
        }

        if (simName) {
          try {
            reply = `Command acknowledged. Contacting API orchestrator to trigger: **${displayName}**...`;

            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                type: "assistant",
                content: reply,
                timestamp: new Date().toLocaleTimeString(),
              },
            ]);

            const res = await fetch(`${apiBaseUrl}/simulate`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: simName }),
            });

            if (res.ok) {
              reply = `Successfully injected **${displayName}** anomaly signature. AI mitigation agents have been engaged. Monitor the metrics charts or Simulation Arena for self-healing playbooks.`;
            } else {
              reply = `Error: Simulation command returned status code ${res.status}. Check backend logs.`;
            }
          } catch {
            reply = `Failed to transmit trigger signal to simulator backend at ${apiBaseUrl}. Ensure the production backend service is online and reachable.`;
          }

          triggeredSim = true;

          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              type: "assistant",
              content: reply,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
        }
      }

      if (!triggeredSim) {
        // 2. Report Status / Health (preserved)
        if (
          lower.includes("status") ||
          lower.includes("health") ||
          lower.includes("system") ||
          lower.includes("metric") ||
          lower.includes("running")
        ) {
          const cpuVal = metrics?.latest?.cpu ? `${Math.round(metrics.latest.cpu)}%` : "34%";
          const memVal = metrics?.latest?.memory ? `${Math.round(metrics.latest.memory)}%` : "52%";
          const latVal = metrics?.latest?.api_latency ? `${Math.round(metrics.latest.api_latency)}ms` : "80ms";

          if (activeIncidents && activeIncidents.length > 0) {
            const active = activeIncidents[0];
            reply = `**Vulnerability Warning**: An active anomaly is currently being tracked.
- **Incident Category**: ${active.category}
- **Severity**: ${active.severity}
- **Impacted Services**: ${active.affected_services.join(", ")}
- **AI Mitigation Status**: ${ai?.mitigation?.status || "Executing healing playbook..."} (${ai?.mitigation?.progress ?? 20}% progress)
- **Current Cluster Stats**: CPU at ${cpuVal}, Memory at ${memVal}, API Latency at ${latVal}.`;
          } else {
            reply = `**All Systems Nominal**: OmniRoot cluster reports zero active vulnerabilities.
- **Node Statuses**: API Gateway (${systemStatus?.["cloud gateway"] || "Healthy"}), Backend APIs (${systemStatus?.backend || "Healthy"}), Databases (${systemStatus?.database || "Healthy"}), Cache Layer (${systemStatus?.cache || "Healthy"})
- **Core Telemetry**: CPU load: ${cpuVal}, memory utilization: ${memVal}, latency baseline: ${latVal}.
AI agents are idle and monitoring the network streams.`;
          }
        }
        // 3. Playbook Info (preserved)
        else if (
          lower.includes("playbook") ||
          lower.includes("mitigate") ||
          lower.includes("solve") ||
          lower.includes("fix")
        ) {
          if (activeIncidents && activeIncidents.length > 0) {
            reply = `Autonomous mitigation is engaged for active **${activeIncidents[0].category}** anomaly.
- **Running playbook**: \`MITIGATE_${activeIncidents[0].category.replace(" ", "_").toUpperCase()}\`
- **Mitigation logs**:
${ai?.mitigation?.logs?.map((l: string) => `  * ${l}`).join("\n") || "  * Analyzing metric divergence patterns..."}`;
          } else {
            reply = `Ready to load healing playbooks. Currently no threats are active. You can trigger a threat simulation using "trigger cpu spike" or "run memory leak test" to see playbooks in action.`;
          }
        }
        // 4. Default fallback (preserved)
        else {
          reply = `I am the OmniRoot AI Copilot, listening on the workspace ports.

Here are commands you can issue:
1. **Status Query**: "What is the system status?" or "Show metrics"
2. **Inject Failures**: "Trigger CPU spike", "Run memory leak test", "Inject latency"
3. **Audit Playbooks**: "Show active playbook steps"
4. **General**: Tell me to analyze logs or monitor infrastructure nodes.`;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            type: "assistant",
            content: reply,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }

      setIsTyping(false);
    }, 850);
  };

  return (
    <div className="relative min-h-screen p-6 md:p-8 flex flex-col overflow-hidden">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col min-h-0 relative z-10">
        {/* Header */}
        <div className="mb-6 shrink-0 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Sparkles size={20} className="text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100 tracking-tight">AI Copilot</h1>
              <p className="text-sm text-slate-400">Interact with the autonomous self-healing engines.</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 min-h-0 rounded-3xl border border-white/10 bg-white/[0.01] backdrop-blur-xl p-6 overflow-y-auto mb-6 space-y-4 shadow-[inner_0_0_40px_rgba(0,0,0,0.5)]">
          {messages.map((msg) => {
            const isUser = msg.type === "user";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-start gap-3",
                  isUser ? "justify-end" : "justify-start"
                )}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
                    <Sparkles size={14} />
                  </div>
                )}

                <div className="flex flex-col max-w-[80%]">
                  <div
                    className={cn(
                      "px-4 py-3 rounded-2xl text-sm leading-relaxed border whitespace-pre-wrap",
                      isUser
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-100 rounded-tr-none shadow-[0_0_15px_rgba(34,211,238,0.06)]"
                        : "bg-white/[0.02] border-white/10 text-slate-200 rounded-tl-none"
                    )}
                  >
                    {msg.content}
                  </div>
                  <span
                    className={cn(
                      "text-[9px] text-slate-500 mt-1 font-mono",
                      isUser ? "text-right" : "text-left"
                    )}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-slate-300 font-bold text-xs font-mono">
                    ME
                  </div>
                )}
              </motion.div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
                <Sparkles size={14} className="animate-spin-slow" />
              </div>
              <div className="bg-white/[0.02] border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none text-slate-400 text-xs font-mono flex items-center gap-1.5 shadow-inner">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEnd} />
        </div>

        {/* Input Area */}
        <div className="flex gap-3 shrink-0 pb-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask system status, or run commands (e.g. 'trigger cpu spike')..."
            className="flex-1 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 focus:border-cyan-500/30 transition shadow-inner font-mono"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSend}
            className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-medium text-white hover:opacity-90 transition flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

