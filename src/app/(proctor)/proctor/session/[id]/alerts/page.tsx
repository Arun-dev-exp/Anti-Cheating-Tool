"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getSessionById, subscribeToParticipants } from "@/lib/sessions";

/* ── Severity config ── */
const sevConfig = {
  breach: { color: "#EF4444", bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.15)", label: "CRITICAL", icon: "error" },
  warning: { color: "#F59E0B", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.15)", label: "WARNING", icon: "warning" },
  info: { color: "#3B82F6", bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.15)", label: "INFO", icon: "info" },
};

const moduleConfig: Record<string, { label: string; color: string; icon: string }> = {
  keystroke: { label: "Keystroke", color: "#3B82F6", icon: "keyboard" },
  gaze: { label: "Gaze", color: "#06B6D4", icon: "visibility" },
  process: { label: "Process", color: "#8B5CF6", icon: "terminal" },
  liveness: { label: "Liveness", color: "#F59E0B", icon: "face" },
  network: { label: "Network", color: "#EF4444", icon: "wifi_tethering" },
};

interface Alert {
  id: string;
  candidateName: string;
  candidateId: string;
  severity: "breach" | "warning" | "info";
  message: string;
  module: string;
  riskValue: number;
  joinedAt: string;
  sessionId: string;
}

type FilterType = "all" | "breach" | "warning" | "info";

function buildAlerts(participants: Record<string, any>[], sessionId: string): Alert[] {
  const alerts: Alert[] = [];

  for (const p of participants) {
    const risks: Record<string, number> = p.risk_factors || {};
    const name = p.candidate_name ?? "Unknown";

    for (const [module, value] of Object.entries(risks)) {
      if (typeof value !== "number" || value <= 15) continue; // skip clean signals

      const severity: "breach" | "warning" | "info" =
        value >= 70 ? "breach" : value >= 40 ? "warning" : "info";

      const messages: Record<string, string> = {
        keystroke: `Abnormal typing rhythm detected — ${value}% deviation from baseline patterns`,
        gaze: `Off-screen gaze anomaly — ${value}% of time spent looking away from exam area`,
        process: `Prohibited process activity — ${value}% risk score from unauthorized applications`,
        liveness: `Presence verification failed — ${value}% anomaly in liveness checks`,
        network: `AI API requests intercepted — ${value}% confidence of external AI assistance`,
      };

      alerts.push({
        id: `${p.id}-${module}`,
        candidateName: name,
        candidateId: p.id,
        severity,
        message: messages[module] ?? `${module} anomaly at ${value}%`,
        module,
        riskValue: value,
        joinedAt: p.joined_at ?? new Date().toISOString(),
        sessionId,
      });
    }
  }

  // Sort by severity (breach first), then risk value
  const sevOrder = { breach: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity] || b.riskValue - a.riskValue);
  return alerts;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BreachDashboardPage({ params }: PageProps) {
  const { id } = use(params);
  const [filter, setFilter] = useState<FilterType>("all");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [session, setSession] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const sess = await getSessionById(id);
        setSession(sess);

        const { data: participants } = await supabase
          .from("participants")
          .select("*")
          .eq("session_id", id);

        if (participants) {
          setAlerts(buildAlerts(participants, id));
        }
      } catch (err) {
        console.error("Failed to load breach data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Real-time updates
  useEffect(() => {
    if (!id) return;

    const channel = subscribeToParticipants(
      id,
      () => {}, // ignore inserts for now
      (updated) => {
        setAlerts((prev) => {
          // Remove old alerts for this participant, add new ones
          const filtered = prev.filter((a) => a.candidateId !== updated.id);
          const newAlerts = buildAlerts([updated], id);
          const combined = [...filtered, ...newAlerts];
          const sevOrder = { breach: 0, warning: 1, info: 2 };
          combined.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity] || b.riskValue - a.riskValue);
          return combined;
        });
      }
    );

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const breachCount = alerts.filter((a) => a.severity === "breach").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const infoCount = alerts.filter((a) => a.severity === "info").length;
  const unresolvedCount = alerts.filter((a) => !resolvedIds.has(a.id)).length;

  const filteredAlerts =
    filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  const toggleResolve = (alertId: string) => {
    setResolvedIds((prev) => {
      const next = new Set(prev);
      if (next.has(alertId)) next.delete(alertId);
      else next.add(alertId);
      return next;
    });
  };

  const getInitials = (name: string) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "??";

  const fmtTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    } catch {
      return "—";
    }
  };

  if (loading) {
    return (
      <main className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-accent-blue animate-spin" style={{ fontSize: "32px" }}>progress_activity</span>
          <span className="text-[13px] text-text-secondary/50 font-mono">Loading breach data...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 lg:p-8">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(245,158,11,0.08))",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <span className="material-symbols-outlined text-[24px] text-status-breach">shield</span>
          </div>
          <div>
            <h1 className="text-[22px] font-ui font-semibold text-text-primary leading-tight">
              Breach Dashboard
            </h1>
            <p className="text-[13px] text-text-secondary flex items-center gap-2">
              {session?.title ?? "Session"}{" "}
              <span className="font-mono text-accent-blue">{session?.code ?? id.slice(0, 8)}</span>
              <span className="text-text-secondary/30">•</span>
              <span className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-status-breach"
                  style={{ animation: "dotPulse 2s infinite" }}
                />
                <span className="font-mono text-status-breach text-[11px]">
                  {unresolvedCount} UNRESOLVED
                </span>
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/proctor/session/${id}`}>
            <button className="alerts-ghost-btn">
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>arrow_back</span>
              BACK TO SESSION
            </button>
          </Link>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "TOTAL ALERTS", value: alerts.length, icon: "notifications_active", color: "#3B82F6", trend: null },
          { label: "CRITICAL", value: breachCount, icon: "error", color: "#EF4444", trend: breachCount > 0 ? `${breachCount} escalated` : "None" },
          { label: "WARNINGS", value: warningCount, icon: "warning", color: "#F59E0B", trend: warningCount > 0 ? `${warningCount} under review` : "None" },
          { label: "RESOLVED", value: resolvedIds.size, icon: "task_alt", color: "#22C55E", trend: alerts.length > 0 ? `${Math.round((resolvedIds.size / alerts.length) * 100)}% resolution` : "—" },
        ].map((kpi, i) => (
          <div key={i} className="alerts-kpi-card" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-mono text-text-secondary/40 uppercase tracking-widest">{kpi.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${kpi.color}10`, border: `1px solid ${kpi.color}20` }}>
                <span className="material-symbols-outlined" style={{ fontSize: "16px", color: kpi.color }}>{kpi.icon}</span>
              </div>
            </div>
            <span className="font-mono text-[28px] font-bold leading-none block" style={{ color: kpi.color }}>
              {kpi.value}
            </span>
            {kpi.trend && (
              <span className="text-[10px] text-text-secondary/40 font-mono mt-1 block">{kpi.trend}</span>
            )}
          </div>
        ))}
      </div>

      {/* ── Module Breakdown Bar ── */}
      <div className="alerts-module-strip mb-6">
        <div className="flex items-center gap-2 mr-auto">
          <span className="material-symbols-outlined text-text-secondary/30" style={{ fontSize: "14px" }}>donut_large</span>
          <span className="text-[9px] font-mono text-text-secondary/30 uppercase tracking-widest">Module Distribution</span>
        </div>
        {Object.entries(moduleConfig).map(([key, cfg]) => {
          const count = alerts.filter((a) => a.module === key).length;
          if (count === 0) return null;
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
              <span className="text-[11px] font-mono text-text-secondary/60">{cfg.label}</span>
              <span className="text-[10px] font-mono font-bold" style={{ color: cfg.color }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* ── Severity Filter Bar ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-text-secondary/30" style={{ fontSize: "16px" }}>filter_list</span>
          <span className="text-[9px] font-mono text-text-secondary/30 uppercase tracking-widest mr-2">Filter</span>
          {(["all", "breach", "warning", "info"] as const).map((f) => {
            const isActive = filter === f;
            const cfg = f === "all"
              ? { color: "#3B82F6", label: `All (${alerts.length})` }
              : { color: sevConfig[f].color, label: `${sevConfig[f].label} (${alerts.filter((a) => a.severity === f).length})` };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="alerts-filter-chip"
                style={{
                  borderColor: isActive ? `${cfg.color}30` : undefined,
                  background: isActive ? `${cfg.color}08` : undefined,
                  color: isActive ? cfg.color : undefined,
                }}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
        <span className="text-[10px] font-mono text-text-secondary/30">
          {filteredAlerts.length} alerts shown
        </span>
      </div>

      {/* ── Alert Cards ── */}
      <div className="flex flex-col gap-3">
        {filteredAlerts.map((alert, idx) => {
          const sev = sevConfig[alert.severity];
          const mod = moduleConfig[alert.module] ?? { label: alert.module, color: "#6B7280", icon: "help" };
          const isResolved = resolvedIds.has(alert.id);

          return (
            <div
              key={alert.id}
              className={`alerts-card ${isResolved ? "alerts-card-resolved" : ""}`}
              style={{
                borderLeftColor: sev.color,
                animationDelay: `${idx * 60}ms`,
              }}
            >
              {/* Left: severity indicator + content */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: sev.bg, border: `1px solid ${sev.border}` }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px", color: sev.color }}>{sev.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ color: sev.color, background: `${sev.color}10`, border: `1px solid ${sev.color}15` }}
                    >
                      {sev.label}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-mono text-text-secondary/50">
                      <span className="material-symbols-outlined" style={{ fontSize: "12px", color: mod.color }}>{mod.icon}</span>
                      {mod.label}
                    </span>
                    {isResolved && (
                      <span className="flex items-center gap-1 text-[9px] font-mono text-status-secure/60 ml-1">
                        <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>check_circle</span>
                        RESOLVED
                      </span>
                    )}
                  </div>
                  <p className={`text-[13px] leading-relaxed ${isResolved ? "text-text-secondary/40 line-through" : "text-text-primary"}`}>
                    {alert.message}
                  </p>
                </div>
              </div>

              {/* Right: meta + actions */}
              <div className="flex items-center gap-5 shrink-0">
                {/* Candidate */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold"
                    style={{ background: `${sev.color}08`, border: `1px solid ${sev.color}12`, color: sev.color }}
                  >
                    {getInitials(alert.candidateName)}
                  </div>
                  <span className="text-[12px] text-text-secondary/70 font-ui">{alert.candidateName}</span>
                </div>

                {/* Risk Value */}
                <div className="flex items-center gap-2 min-w-[80px]">
                  <div className="flex-1 h-[4px] bg-[#1A1A3E] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${alert.riskValue}%`,
                        background: `linear-gradient(90deg, ${sev.color}80, ${sev.color})`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold" style={{ color: sev.color }}>
                    {alert.riskValue}%
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <Link href={`/proctor/session/${id}/candidate/${alert.candidateId}`}>
                    <button className="alerts-action-btn" title="Investigate">
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>search</span>
                    </button>
                  </Link>
                  <button
                    className={`alerts-action-btn ${isResolved ? "!border-status-secure/20 !text-status-secure/40" : ""}`}
                    title={isResolved ? "Unresolve" : "Resolve"}
                    onClick={() => toggleResolve(alert.id)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                      {isResolved ? "undo" : "check_circle"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filteredAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-border-subtle bg-bg-surface/40">
            <span className="material-symbols-outlined text-text-secondary/15 mb-3" style={{ fontSize: "40px" }}>verified_user</span>
            <span className="text-[14px] text-text-secondary/50 font-ui font-medium">No alerts detected</span>
            <span className="text-[11px] text-text-secondary/25 font-mono mt-1">
              All candidates are within normal parameters
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
