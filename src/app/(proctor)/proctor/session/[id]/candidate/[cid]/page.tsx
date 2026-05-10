"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import IntegrityGauge from "@/components/ui/IntegrityGauge";
import RiskBar from "@/components/ui/RiskBar";
import StatusBadge from "@/components/ui/StatusBadge";
import { getParticipantById, subscribeToParticipants } from "@/lib/sessions";
import { supabase } from "@/lib/supabase";

interface PageProps {
  params: Promise<{ id: string; cid: string }>;
}

const signalMeta: Record<string, { icon: string; label: string; description: string; color: string }> = {
  keystroke: {
    icon: "keyboard",
    label: "Keystroke Dynamics",
    description: "Typing rhythm and pattern analysis. High values indicate abnormal typing behavior — possible copy-paste or scripted input.",
    color: "#3B82F6",
  },
  gaze: {
    icon: "visibility",
    label: "Gaze Tracking",
    description: "Eye movement and focus analysis. High values indicate the candidate was frequently looking off-screen, possibly reading from another source.",
    color: "#06B6D4",
  },
  process: {
    icon: "terminal",
    label: "Process Sentinel",
    description: "Running application monitoring. High values indicate prohibited software detected — screen sharing, VMs, or AI assistants.",
    color: "#A855F7",
  },
  liveness: {
    icon: "face",
    label: "Liveness Detection",
    description: "Real-time presence verification. High values indicate the candidate may have left the session or was not visible on camera.",
    color: "#F59E0B",
  },
  network: {
    icon: "wifi_tethering",
    label: "Network Monitor",
    description: "Outbound AI API detection. High values indicate requests to ChatGPT, Claude, Gemini, or other AI services were intercepted.",
    color: "#EF4444",
  },
};

export default function MonitorViewPage({ params }: PageProps) {
  const { id, cid } = use(params);
  const [participant, setParticipant] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchParticipant() {
      const data = await getParticipantById(cid);
      setParticipant(data);
      setLoading(false);
    }
    fetchParticipant();
  }, [cid]);

  useEffect(() => {
    if (!id || !cid) return;

    const channel = subscribeToParticipants(
      id,
      () => {},
      (updated) => {
        if (updated.id === cid) {
          setParticipant(updated);
        }
      }
    );

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, cid]);

  if (loading || !participant) {
    return (
      <main className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[24px] text-accent-blue animate-spin">progress_activity</span>
          <span className="text-text-secondary font-mono text-[13px]">Loading candidate data...</span>
        </div>
      </main>
    );
  }

  const score = participant.integrity_score ?? 100;
  const risks: Record<string, number> = participant.risk_factors || { keystroke: 0, gaze: 0, process: 0, liveness: 0, network: 0 };
  const getStatus = (s: number) => s > 65 ? "secure" as const : s >= 35 ? "suspicious" as const : "breach" as const;
  const status = getStatus(score);

  const flaggedSignals = Object.entries(risks).filter(([, v]) => v > 30).sort((a, b) => b[1] - a[1]);
  const cleanSignals = Object.entries(risks).filter(([, v]) => v <= 30);

  const getRiskLevel = (v: number) => {
    if (v >= 70) return { label: "CRITICAL", color: "#EF4444", bg: "rgba(239,68,68,0.08)" };
    if (v >= 50) return { label: "HIGH", color: "#F59E0B", bg: "rgba(245,158,11,0.08)" };
    if (v > 30) return { label: "MODERATE", color: "#FB923C", bg: "rgba(251,146,60,0.08)" };
    return { label: "NORMAL", color: "#22C55E", bg: "rgba(34,197,94,0.08)" };
  };

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "—";
    }
  };

  return (
    <main className="p-6 lg:p-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] font-mono text-text-secondary/40 mb-6">
        <Link href="/proctor" className="hover:text-text-secondary transition-colors">Dashboard</Link>
        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>chevron_right</span>
        <Link href="/proctor/candidates" className="hover:text-text-secondary transition-colors">Candidates</Link>
        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>chevron_right</span>
        <span className="text-text-secondary/60">{participant.candidate_name ?? "Candidate"}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-[18px] font-mono font-bold"
            style={{
              background: status === "breach" ? "rgba(239,68,68,0.1)" : status === "suspicious" ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)",
              border: `1px solid ${status === "breach" ? "rgba(239,68,68,0.2)" : status === "suspicious" ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.2)"}`,
              color: status === "breach" ? "#EF4444" : status === "suspicious" ? "#F59E0B" : "#22C55E",
            }}
          >
            {(participant.candidate_name ?? "??").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div>
            <h1 className="text-[22px] font-ui font-semibold text-text-primary leading-tight">{participant.candidate_name ?? "Unknown Candidate"}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-text-secondary/40 font-mono">ID: {cid.slice(0, 8)}</span>
              <span className="w-1 h-1 rounded-full bg-text-secondary/20" />
              <span className="text-[11px] text-text-secondary/40 font-mono">Joined: {fmtDate(participant.joined_at)}</span>
              <span className="w-1 h-1 rounded-full bg-text-secondary/20" />
              <StatusBadge status={status} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column — Score + Risk Bars */}
        <div className="col-span-1 space-y-6">
          {/* Integrity Score */}
          <div className="rounded-xl border border-border-subtle bg-bg-surface/40 p-6 text-center" style={{ backdropFilter: "blur(8px)" }}>
            <span className="text-[9px] font-mono text-text-secondary/40 uppercase tracking-widest block mb-4">INTEGRITY SCORE</span>
            <IntegrityGauge score={score} size={160} strokeWidth={10} />
            <div className="mt-4">
              <span className="font-mono text-[36px] font-bold leading-none" style={{
                color: status === "breach" ? "#EF4444" : status === "suspicious" ? "#F59E0B" : "#22C55E",
              }}>
                {score}
              </span>
              <span className="text-[11px] text-text-secondary/40 font-mono block mt-1">/ 100</span>
            </div>
          </div>

          {/* Risk Factor Bars */}
          <div className="rounded-xl border border-border-subtle bg-bg-surface/40 p-5" style={{ backdropFilter: "blur(8px)" }}>
            <span className="text-[9px] font-mono text-text-secondary/40 uppercase tracking-widest block mb-4">RISK BREAKDOWN</span>
            <div className="space-y-3">
              <RiskBar label="KEYSTROKE" value={risks.keystroke ?? 0} />
              <RiskBar label="GAZE" value={risks.gaze ?? 0} />
              <RiskBar label="PROCESS" value={risks.process ?? 0} />
              <RiskBar label="LIVENESS" value={risks.liveness ?? 0} />
              <RiskBar label="NETWORK" value={risks.network ?? 0} />
            </div>
          </div>
        </div>

        {/* Right Column — Signal Analysis */}
        <div className="col-span-2 space-y-6">
          {/* Flagged Signals */}
          {flaggedSignals.length > 0 && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] overflow-hidden" style={{ backdropFilter: "blur(8px)" }}>
              <div className="px-5 py-3 border-b border-red-500/10 flex items-center gap-2 bg-red-500/[0.03]">
                <span className="material-symbols-outlined text-[16px] text-red-400">warning</span>
                <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider font-mono">
                  {flaggedSignals.length} Signal{flaggedSignals.length > 1 ? "s" : ""} Flagged
                </span>
                <span className="text-[10px] text-red-400/50 font-mono ml-auto">Contributed to integrity breach</span>
              </div>
              <div className="divide-y divide-border-subtle/20">
                {flaggedSignals.map(([key, value]) => {
                  const meta = signalMeta[key];
                  const risk = getRiskLevel(value);
                  if (!meta) return null;
                  return (
                    <div key={key} className="p-5 hover:bg-bg-panel/20 transition-colors">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `${meta.color}10`, border: `1px solid ${meta.color}20` }}
                        >
                          <span className="material-symbols-outlined text-[20px]" style={{ color: meta.color }}>{meta.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[14px] font-ui font-semibold text-text-primary">{meta.label}</span>
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider"
                                style={{ color: risk.color, background: risk.bg, border: `1px solid ${risk.color}15` }}
                              >
                                {risk.label}
                              </span>
                              <span className="font-mono text-[16px] font-bold" style={{ color: risk.color }}>{value}%</span>
                            </div>
                          </div>
                          <p className="text-[12px] text-text-secondary/60 leading-relaxed">{meta.description}</p>
                          {/* Risk progress bar */}
                          <div className="mt-3 h-[4px] bg-[#1A1A3E] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${value}%`,
                                background: `linear-gradient(90deg, ${risk.color}80, ${risk.color})`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clean Signals */}
          <div className="rounded-xl border border-border-subtle bg-bg-surface/40 overflow-hidden" style={{ backdropFilter: "blur(8px)" }}>
            <div className="px-5 py-3 border-b border-border-subtle/50 flex items-center gap-2 bg-bg-surface/30">
              <span className="material-symbols-outlined text-[16px] text-status-secure">check_circle</span>
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">
                {cleanSignals.length > 0 ? `${cleanSignals.length} Signal${cleanSignals.length > 1 ? "s" : ""} Normal` : "All Signals Flagged"}
              </span>
            </div>
            {cleanSignals.length > 0 ? (
              <div className="divide-y divide-border-subtle/20">
                {cleanSignals.map(([key, value]) => {
                  const meta = signalMeta[key];
                  if (!meta) return null;
                  return (
                    <div key={key} className="px-5 py-4 flex items-center gap-4 hover:bg-bg-panel/20 transition-colors">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${meta.color}08`, border: `1px solid ${meta.color}15` }}
                      >
                        <span className="material-symbols-outlined text-[18px]" style={{ color: meta.color }}>{meta.icon}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-[13px] font-ui text-text-primary font-medium">{meta.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider"
                          style={{ color: "#22C55E", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}>
                          NORMAL
                        </span>
                        <span className="font-mono text-[13px] font-bold text-status-secure">{value}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-[12px] text-text-secondary/40 font-mono">
                No clean signals — all modules flagged anomalies
              </div>
            )}
          </div>

          {/* Session Info */}
          <div className="rounded-xl border border-border-subtle bg-bg-surface/40 p-5" style={{ backdropFilter: "blur(8px)" }}>
            <span className="text-[9px] font-mono text-text-secondary/40 uppercase tracking-widest block mb-4">SESSION DETAILS</span>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-text-secondary/30" style={{ fontSize: "16px" }}>badge</span>
                <div>
                  <span className="text-[10px] text-text-secondary/40 font-mono block">Status</span>
                  <span className="text-[13px] text-text-primary font-medium capitalize">{participant.status ?? "—"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-text-secondary/30" style={{ fontSize: "16px" }}>event_note</span>
                <div>
                  <span className="text-[10px] text-text-secondary/40 font-mono block">Session ID</span>
                  <span className="text-[13px] text-text-primary font-mono">{id.slice(0, 8)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-text-secondary/30" style={{ fontSize: "16px" }}>schedule</span>
                <div>
                  <span className="text-[10px] text-text-secondary/40 font-mono block">Joined At</span>
                  <span className="text-[13px] text-text-primary font-mono">{fmtDate(participant.joined_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-text-secondary/30" style={{ fontSize: "16px" }}>speed</span>
                <div>
                  <span className="text-[10px] text-text-secondary/40 font-mono block">Overall Risk</span>
                  <span className="text-[13px] font-mono font-bold" style={{
                    color: status === "breach" ? "#EF4444" : status === "suspicious" ? "#F59E0B" : "#22C55E",
                  }}>
                    {status === "breach" ? "HIGH RISK" : status === "suspicious" ? "MODERATE" : "LOW RISK"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
