"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Mic, MicOff, X, Send, Sparkles, Volume2 } from "lucide-react";

import { useOmniWebSocket, type OmniAiInsight, type OmniIncidentAlert } from "@/hooks/useOmniWebSocket";
import { cn } from "@/lib/cn";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function TypingDots({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("text-xs text-slate-300/70", !active && "opacity-0")}>Analyzing</div>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "w-1.5 h-1.5 rounded-full bg-cyan-300",
              active ? "opacity-100" : "opacity-0"
            )}
            style={{
              animation: active ? `pulseDot 1.2s ${i * 0.18}s infinite ease-in-out` : undefined,
            }}
          />
        ))}
      </div>
      <style jsx global>{`
        @keyframes pulseDot {
          0%, 100% { transform: translateY(0); opacity: 0.35; }
          50% { transform: translateY(-3px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function buildFakeAiResponse(params: {
  question: string;
  ai: OmniAiInsight | null;
  activeIncidents: OmniIncidentAlert[];
}) {
  const { question, ai, activeIncidents } = params;
  const hot = activeIncidents.length > 0;

  // Use AI panel data when available to make answers feel grounded.
  const root = ai?.root_cause || "Metric divergence and correlated log anomalies suggest a cascading dependency failure.";
  const sev = ai?.severity || (hot ? "Critical" : "Warning");
  const predicted = ai?.predicted_impact || "Expected impact window: next 10–35 minutes; tail latency likely elevated.";
  const recs = ai?.recommendations || [
    "Activate targeted circuit breakers for affected services",
    "Quarantine anomalous traffic patterns and validate rate limiter",
    "Run synthetic checks for downstream dependencies",
    "Adjust autoscaling and rollout safety controls",
  ];

  const match = question.toLowerCase();
  const focus = match.includes("memory")
    ? "Memory pressure points to heap growth and allocation churn."
    : match.includes("outage")
    ? "The incident timeline aligns with sudden error budget burn and retry storms."
    : match.includes("unstable")
    ? "Sustained tail latency indicates an unstable dependency."
    : "Correlated metric + log signals indicate a layered failure propagation.";

  return {
    title: "AI Incident Intelligence",
    rootCause: root,
    severity: sev,
    predictedImpact: predicted,
    recommendations: recs.slice(0, 4),
    footer: focus,
  };
}

function formatAssistantMessage(bundle: ReturnType<typeof buildFakeAiResponse>) {
  return [
    `Root Cause: ${bundle.rootCause}`,
    `Severity: ${bundle.severity}`,
    `Predicted Impact: ${bundle.predictedImpact}`,
    `\nRecommendations:` + bundle.recommendations.map((r, i) => `\n  ${i + 1}. ${r}`).join(""),
    `\n\n${bundle.footer}`,
  ].join("\n");
}

function HologramOrb() {
  return (
    <div className="relative w-[320px] h-[320px]">
      <motion.div
        className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.35),transparent_60%)] blur-[0.5px]"
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.65, 1, 0.65],
        }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border border-cyan-400/30"
        animate={{ rotate: [0, 180, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.22),transparent_60%)] border border-white/10"
        animate={{
          boxShadow: [
            "0 0 0 rgba(34,211,238,0.0)",
            "0 0 38px rgba(34,211,238,0.22)",
            "0 0 0 rgba(34,211,238,0.0)",
          ],
        }}
        transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-cyan-400/20 border border-cyan-300/25"
        animate={{
          y: [0, -6, 0],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export default function AILiveCommandCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { activeIncidents, ai } = useOmniWebSocket();
  const hot = activeIncidents.length > 0;

  const [tab, setTab] = useState<"chat" | "voice" | "holo">("chat");
  const [wave, setWave] = useState(0.2);
  const [listening, setListening] = useState(false);

  const initialChat = useMemo<ChatMessage[]>(() => {
    // Avoid impure Date.now() during render.
    return [
      {
        id: uid(),
        role: "assistant",
        content:
          "Welcome to OmniRoot AI Command Center. Ask me anything about the current telemetry — I will reconstruct the incident logic and propose actions.",
        timestamp: 0,
      },
    ];
  }, []);


  const [chat, setChat] = useState<ChatMessage[]>(initialChat);


  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    // Keep this effect free of React state updates to satisfy react-hooks/set-state-in-effect.
  }, [open]);



  useEffect(() => {
    if (!open || !listening) return;
    const id = window.setInterval(() => {
      setWave((w) => 0.2 + Math.random() * 0.8);
    }, 120);
    return () => window.clearInterval(id);
  }, [open, listening]);

  useEffect(() => {
    if (!open) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, open]);

  const quickPrompts = useMemo<string[]>(
    () => [
      "Why is memory usage increasing?",
      "What caused this outage?",
      "Which service is unstable?",
      "How can we prevent this?",
    ],
    []
  );


  const send = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || typing) return;

    const ts = Date.now();
    const userMsg: ChatMessage = { id: uid(), role: "user", content: trimmed, timestamp: ts };

    setChat((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Simulate streaming AI response.
    const bundle = buildFakeAiResponse({ question: trimmed, ai, activeIncidents });
    const full = formatAssistantMessage(bundle);

    const assistantId = uid();
    setChat((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", timestamp: Date.now() },

    ]);

    let i = 0;
    while (i <= full.length) {
      i += 3 + Math.floor(Math.random() * 4);
      const slice = full.slice(0, i);
      setChat((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: slice } : m)));
      await new Promise((r) => setTimeout(r, 18 + Math.random() * 18));
    }

    setTyping(false);
  };

  const startVoice = () => {
    setListening(true);
    setWave(0.7);
    // Simulate voice capture and auto-query.
    window.setTimeout(() => {
      setListening(false);
      setTab("chat");
      send("What caused this outage?");
    }, 2400);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background blur */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="absolute inset-2 md:inset-6 rounded-[28px] border border-white/10 bg-[rgba(5,8,22,0.68)] backdrop-blur-2xl overflow-hidden shadow-[0_0_80px_rgba(34,211,238,0.18)]"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            {/* Top bar */}
            <div className="relative z-10 h-16 px-6 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_24px_rgba(34,211,238,0.35)]">
                  <Sparkles size={18} className="text-cyan-200" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-100">AI Command Center</div>
                  <div className="text-xs text-slate-300/70">Realtime incident intelligence • {hot ? "LIVE" : "STANDBY"}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.55)]" />
                  <span className="text-xs text-slate-200/90">Streaming AI responses</span>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition flex items-center justify-center"
                  aria-label="Close"
                >
                  <X size={18} className="text-slate-200" />
                </button>
              </div>
            </div>

            <div className="relative z-10 flex h-[calc(100%-4rem)]">
              {/* Left nav tabs */}
              <div className="w-[260px] border-r border-white/10 bg-white/[0.02]">
                <div className="p-4">
                  <div className="text-xs text-slate-300/70 mb-3">Modes</div>
                  <div className="space-y-2">
                    {[{ id: "chat", label: "Chat Assistant" }, { id: "voice", label: "Voice Assistant" }, { id: "holo", label: "Hologram" }].map(
                      (t) => {
                        const active = tab === t.id;

                        return (
                          <button
                            key={t.id}
                            onClick={() => setTab(t.id as "chat" | "voice" | "holo")}

                            className={cn(
                              "w-full text-left rounded-2xl px-4 py-3 border transition",
                              active
                                ? "border-cyan-400/25 bg-cyan-500/10 shadow-[0_0_28px_rgba(34,211,238,0.14)]"
                                : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                            )}
                          >
                            <div className="text-sm font-semibold text-slate-100">{t.label}</div>
                            <div className="text-xs text-slate-300/70 mt-1">
                              {t.id === "chat" ? "Root cause & actions" : t.id === "voice" ? "Waveform + speaking" : "Orb + holo UI"}
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* Incident feed */}
                  <div className="mt-5">
                    <div className="text-xs text-slate-300/70 mb-2">Live Incident Analysis</div>
                    <div className="space-y-2">
                      {activeIncidents.slice(0, 3).map((inc) => (
                        <motion.div
                          key={inc.id}
                          initial={false}
                          className={cn(
                            "rounded-2xl border p-3",
                            inc.severity === "CRITICAL"
                              ? "border-red-400/25 bg-red-500/10"
                              : inc.severity === "ERROR"
                              ? "border-red-400/20 bg-red-500/7"
                              : "border-white/10 bg-white/[0.02]"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-slate-300/70">{inc.category}</div>
                            <div className={cn("text-xs font-semibold", inc.severity === "CRITICAL" ? "text-red-200" : "text-slate-200")}>{inc.severity}</div>
                          </div>
                          <div className="mt-2 text-xs text-slate-200/90">{inc.current_impact}</div>
                          <div className="mt-2 text-[11px] text-slate-300/60">ETA {inc.estimated_resolution}</div>
                        </motion.div>
                      ))}
                      {!activeIncidents.length && (
                        <div className="text-xs text-slate-300/70 bg-white/[0.02] border border-white/10 rounded-2xl p-3">No active incidents. Standing by for anomaly clusters.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.10),transparent_55%)]">
                <AnimatePresence mode="wait">
                  {tab === "chat" && (
                    <motion.div
                      key="chat"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="h-full flex flex-col"
                    >
                      <div className="p-5 flex items-start gap-3">
                        <div className="flex-1">
                          <div className="text-xs text-slate-300/70">AI Chat Assistant</div>
                          <div className="text-2xl font-semibold text-slate-100 mt-1">Cinematic root cause & recommendations</div>
                        </div>
                        <div className="hidden md:block">
                          <HologramOrb />
                        </div>
                      </div>

                      <div className="px-5 flex-1 min-h-0">
                        <div className="h-full rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl overflow-hidden flex flex-col">
                          <div className="p-4 border-b border-white/10">
                            <TypingDots active={typing} />
                          </div>
                          <div className="flex-1 overflow-auto p-4 space-y-3">
                            {chat.map((m) => (
                              <div
                                key={m.id}
                                className={cn(
                                  "flex",
                                  m.role === "user" ? "justify-end" : "justify-start"
                                )}
                              >
                                <div
                                  className={cn(
                                    "max-w-[85%] rounded-3xl px-4 py-3 border",
                                    m.role === "user"
                                      ? "bg-cyan-500/10 border-cyan-400/20 text-slate-100"
                                      : "bg-white/[0.03] border-white/10 text-slate-100"
                                  )}
                                >
                                  <div className="whitespace-pre-wrap text-sm leading-5">{m.content}</div>
                                  <div className="text-[11px] text-slate-300/60 mt-2">{new Date(m.timestamp).toLocaleTimeString()}</div>
                                </div>
                              </div>
                            ))}
                            <div ref={chatEndRef} />
                          </div>

                          <div className="p-4 border-t border-white/10">
                            <div className="flex gap-2">
                              <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask OmniRoot AI… e.g. Why is memory increasing?"
                                className="flex-1 rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400/80 outline-none focus:border-cyan-400/30"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") send(input);
                                }}
                              />
                              <button
                                className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/25 hover:bg-cyan-500/20 transition flex items-center justify-center"
                                onClick={() => send(input)}
                                aria-label="Send"
                              >
                                <Send size={18} className="text-cyan-200" />
                              </button>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {quickPrompts.map((p) => (
                                <button
                                  key={p}
                                  onClick={() => send(p)}
                                  disabled={typing}
                                  className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] text-slate-200/90 transition"
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {tab === "voice" && (
                    <motion.div
                      key="voice"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="h-full flex flex-col p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs text-slate-300/70">AI Voice Assistant</div>
                          <div className="text-2xl font-semibold text-slate-100 mt-1">Live waveform & command capture</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => (listening ? setListening(false) : startVoice())}
                            className={cn(
                              "w-14 h-14 rounded-2xl border transition flex items-center justify-center",
                              listening
                                ? "border-red-400/30 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.18)]"
                                : "border-cyan-400/25 bg-cyan-500/10 hover:bg-cyan-500/15"
                            )}
                            aria-label="Toggle microphone"
                          >
                            {listening ? <MicOff size={20} className="text-red-200" /> : <Mic size={20} className="text-cyan-200" />}
                          </button>
                          <motion.div
                            className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3"
                            animate={{
                              boxShadow: listening
                                ? ["0 0 0 rgba(34,211,238,0)", "0 0 36px rgba(34,211,238,0.25)", "0 0 0 rgba(34,211,238,0)"]
                                : "0 0 0 rgba(0,0,0,0)",
                            }}
                            transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <div className="text-xs text-slate-300/70">Status</div>
                            <div className={cn("text-sm font-semibold", listening ? "text-red-200" : "text-slate-200")}>{listening ? "LISTENING" : "READY"}</div>
                          </motion.div>
                        </div>
                      </div>

                      <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl p-6 flex-1 flex flex-col">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Volume2 size={16} className="text-cyan-200" />
                            <div className="text-sm font-medium text-slate-200/90">Voice telemetry</div>
                          </div>
                          <div className="text-xs text-slate-300/60">Simulated voice pipeline</div>
                        </div>

                        <div className="mt-6 h-full flex items-center justify-center">
                          <div className="w-full max-w-[620px]">
                            <div className="h-24 border border-white/10 rounded-3xl bg-white/[0.02] flex items-center justify-center">
                              <div className="flex items-end gap-2 px-6 w-full">
                                {[...Array(22)].map((_, i) => {
                                  const amp = 0.18 + Math.sin(i * 0.6 + wave * 2.2) * 0.22 + wave * 0.15;
                                  const h = listening ? Math.max(0.2, amp) * 44 : 10;
                                  return (
                                    <motion.div
                                      key={i}
                                      className="flex-1 rounded-full bg-gradient-to-t from-cyan-400/80 to-cyan-200/20"
                                      animate={{ height: h }}
                                      transition={{ duration: 0.18 }}
                                    />
                                  );
                                })}
                              </div>
                            </div>

                            <div className="mt-4 text-center">
                              <div className={cn("text-sm", listening ? "text-red-200" : "text-slate-200/90")}>
                                {listening ? "Listening… capturing incident context" : "Press microphone to simulate voice command"}
                              </div>
                              <div className="text-xs text-slate-300/60 mt-2">
                                When complete, OmniRoot will auto-generate a streamed incident analysis.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {tab === "holo" && (
                    <motion.div
                      key="holo"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="h-full p-6 flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs text-slate-300/70">AI Video / Hologram</div>
                          <div className="text-2xl font-semibold text-slate-100 mt-1">Holographic cyber intelligence interface</div>
                        </div>
                        <div className="hidden md:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
                          <Activity size={16} className="text-cyan-200" />
                          <div className="text-xs text-slate-300/70">Holo telemetry loop</div>
                        </div>
                      </div>

                      <div className="mt-6 flex-1 flex items-center justify-center rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.20),transparent_50%)]" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 p-6 w-full justify-center">
                          <div className="relative">
                            <HologramOrb />
                            <motion.div
                              className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[240px] h-[60px] rounded-[20px] border border-white/10 bg-white/[0.02]"
                              animate={{
                                boxShadow: hot
                                  ? ["0 0 0 rgba(239,68,68,0)", "0 0 40px rgba(239,68,68,0.25)", "0 0 0 rgba(239,68,68,0)"]
                                  : ["0 0 0 rgba(34,211,238,0)", "0 0 40px rgba(34,211,238,0.20)", "0 0 0 rgba(34,211,238,0)"]
                              }}
                              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <div className="h-full flex items-center justify-center text-sm text-slate-200/90">
                                {hot ? "INCIDENT STREAM ACTIVE" : "INTELLIGENCE IDLE"}
                              </div>
                            </motion.div>
                          </div>

                          <div className="w-full max-w-[420px]">
                            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
                              <div className="text-xs text-slate-300/70">Live recommendations</div>
                              <div className="mt-2 space-y-3">
                                {(ai?.recommendations || [
                                  "Enable circuit breakers for impacted paths",
                                  "Quarantine anomalous traffic",
                                  "Run synthetic health checks",
                                  "Tune autoscaling thresholds",
                                ]).slice(0, 4).map((r, i) => (
                                  <motion.div
                                    key={i}
                                    initial={false}
                                    animate={{ x: hot ? [0, 6, 0] : [0, 3, 0] }}
                                    transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
                                    className="rounded-2xl border border-white/10 bg-black/20 p-3"
                                  >
                                    <div className="text-[11px] text-slate-300/60">Action {i + 1}</div>
                                    <div className="mt-1 text-sm text-slate-100/95">{r}</div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            <div className="mt-4 text-xs text-slate-300/60 text-center">
                              Cinematic holo loop (simulated). Designed for hackathon demo impact.
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer tips */}
            <div className="absolute bottom-4 left-0 right-0 px-6 z-10">
              <div className="mx-auto max-w-[920px] text-xs text-slate-300/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.55)]" />
                  <span>AI streaming • incident aware • recommendation engine (simulated)</span>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <span>Tip:</span>
                  <span className="text-slate-200/80">Try “What caused this outage?”</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

