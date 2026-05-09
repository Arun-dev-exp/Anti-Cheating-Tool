"use client";
import { useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";

/* ── Alert data ── */
const alerts = [
  {
    id: 1,
    candidate: "Amit Joshi",
    candidateId: "c-005",
    avatar: "AJ",
    severity: "breach" as const,
    message: "Unauthorized process: chrome.exe — external browser detected",
    time: "10:45:23",
    confidence: 94,
    module: "process",
    icon: "memory",
    resolved: false,
  },
  {
    id: 2,
    candidate: "Amit Joshi",
    candidateId: "c-005",
    avatar: "AJ",
    severity: "breach" as const,
    message: "Extended off-screen gaze — 12.4 seconds continuous",
    time: "10:44:18",
    confidence: 91,
    module: "gaze",
    icon: "visibility",
    resolved: false,
  },
  {
    id: 3,
    candidate: "Ravi Kumar",
    candidateId: "c-003",
    avatar: "RK",
    severity: "warning" as const,
    message: "Unusual key interval detected — 340ms avg (baseline: 42ms)",
    time: "10:42:05",
    confidence: 78,
    module: "keystroke",
    icon: "keyboard",
    resolved: false,
  },
  {
    id: 4,
    candidate: "Ravi Kumar",
    candidateId: "c-003",
    avatar: "RK",
    severity: "warning" as const,
    message: "Multiple face candidates detected in frame",
    time: "10:40:12",
    confidence: 72,
    module: "liveness",
    icon: "face",
    resolved: false,
  },
  {
    id: 5,
    candidate: "Amit Joshi",
    candidateId: "c-005",
    avatar: "AJ",
    severity: "breach" as const,
    message: "Copy-paste sequence detected — clipboard activity flagged",
    time: "10:38:44",
    confidence: 88,
    module: "keystroke",
    icon: "keyboard",
    resolved: false,
  },
  {
    id: 6,
    candidate: "Sneha Reddy",
    candidateId: "c-004",
    avatar: "SR",
    severity: "info" as const,
    message: "Tab switch detected — returned within 2.1 seconds",
    time: "10:35:10",
    confidence: 45,
    module: "process",
    icon: "memory",
    resolved: true,
  },
  {
    id: 7,
    candidate: "Priya Nair",
    candidateId: "c-006",
    avatar: "PN",
    severity: "warning" as const,
    message: "Webcam briefly obstructed — 1.8s occlusion event",
    time: "10:33:22",
    confidence: 65,
    module: "liveness",
    icon: "face",
    resolved: true,
  },
];

/* ── Severity config ── */
const sevConfig = {
  breach: { color: "#EF4444", bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.15)", label: "CRITICAL", icon: "error" },
  warning: { color: "#F59E0B", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.15)", label: "WARNING", icon: "warning" },
  info: { color: "#3B82F6", bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.15)", label: "INFO", icon: "info" },
};

const moduleConfig: Record<string, { label: string; color: string }> = {
  keystroke: { label: "Keystroke", color: "#3B82F6" },
  gaze: { label: "Gaze", color: "#06B6D4" },
  process: { label: "Process", color: "#8B5CF6" },
  liveness: { label: "Liveness", color: "#F59E0B" },
};

type FilterType = "all" | "breach" | "warning" | "info";

export default function BreachDashboardPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [resolvedIds, setResolvedIds] = useState<Set<number>>(
    new Set(alerts.filter((a) => a.resolved).map((a) => a.id))
  );

  const breachCount = alerts.filter((a) => a.severity === "breach").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const infoCount = alerts.filter((a) => a.severity === "info").length;
  const unresolvedCount = alerts.filter((a) => !resolvedIds.has(a.id)).length;

  const filteredAlerts =
    filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  const toggleResolve = (id: number) => {
    setResolvedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
        <main className="p-6 lg:p-8">
          {/* ── Page Header ── */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(245,158,11,0.08))",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <span
                  className="material-symbols-outlined text-[24px] text-status-breach"
                >
                  shield
                </span>
              </div>
              <div>
                <h1 className="text-[22px] font-ui font-semibold text-text-primary leading-tight">
                  Breach Dashboard
                </h1>
                <p className="text-[13px] text-text-secondary flex items-center gap-2">
                  Session{" "}
                  <span className="font-mono text-accent-blue">SZ-8821</span>
                  <span className="text-text-secondary/30">•</span>
                  <span className="flex items-center gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-status-breach"
                      style={{
                        animation: "dotPulse 2s infinite",
                      }}
                    />
                    <span className="font-mono text-status-breach text-[11px]">
                      {unresolvedCount} UNRESOLVED
                    </span>
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/proctor/session/SZ-8821">
                <button className="alerts-ghost-btn">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "14px" }}
                  >
                    arrow_back
                  </span>
                  BACK TO SESSION
                </button>
              </Link>
              <button className="alerts-export-btn">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "14px" }}
                >
                  download
                </span>
                EXPORT LOG
              </button>
            </div>
          </div>

          {/* ── KPI Summary Cards ── */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "TOTAL ALERTS",
                value: alerts.length,
                icon: "notifications_active",
                color: "#3B82F6",
                trend: null,
              },
              {
                label: "CRITICAL",
                value: breachCount,
                icon: "error",
                color: "#EF4444",
                trend: `${breachCount} escalated`,
              },
              {
                label: "WARNINGS",
                value: warningCount,
                icon: "warning",
                color: "#F59E0B",
                trend: `${warningCount} under review`,
              },
              {
                label: "RESOLVED",
                value: resolvedIds.size,
                icon: "task_alt",
                color: "#22C55E",
                trend: `${Math.round(
                  (resolvedIds.size / alerts.length) * 100
                )}% resolution`,
              },
            ].map((kpi, i) => (
              <div key={i} className="alerts-kpi-card" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-mono text-text-secondary/40 uppercase tracking-widest">
                    {kpi.label}
                  </span>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: `${kpi.color}10`,
                      border: `1px solid ${kpi.color}20`,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px", color: kpi.color }}
                    >
                      {kpi.icon}
                    </span>
                  </div>
                </div>
                <span
                  className="font-mono text-[28px] font-bold leading-none block"
                  style={{ color: kpi.color }}
                >
                  {kpi.value}
                </span>
                {kpi.trend && (
                  <span className="text-[10px] text-text-secondary/40 font-mono mt-1 block">
                    {kpi.trend}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* ── Module Breakdown Bar ── */}
          <div className="alerts-module-strip mb-6">
            <div className="flex items-center gap-2 mr-auto">
              <span
                className="material-symbols-outlined text-text-secondary/30"
                style={{ fontSize: "14px" }}
              >
                donut_large
              </span>
              <span className="text-[9px] font-mono text-text-secondary/30 uppercase tracking-widest">
                Module Distribution
              </span>
            </div>
            {Object.entries(moduleConfig).map(([key, cfg]) => {
              const count = alerts.filter((a) => a.module === key).length;
              if (count === 0) return null;
              return (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <span className="text-[11px] font-mono text-text-secondary/60">
                    {cfg.label}
                  </span>
                  <span
                    className="text-[10px] font-mono font-bold"
                    style={{ color: cfg.color }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Severity Filter Bar ── */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-text-secondary/30"
                style={{ fontSize: "16px" }}
              >
                filter_list
              </span>
              <span className="text-[9px] font-mono text-text-secondary/30 uppercase tracking-widest mr-2">
                Filter
              </span>
              {(["all", "breach", "warning", "info"] as const).map((f) => {
                const isActive = filter === f;
                const cfg =
                  f === "all"
                    ? { color: "#3B82F6", label: `All (${alerts.length})` }
                    : {
                        color: sevConfig[f].color,
                        label: `${sevConfig[f].label} (${
                          alerts.filter((a) => a.severity === f).length
                        })`,
                      };
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
              const mod = moduleConfig[alert.module];
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
                    {/* Severity icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: sev.bg,
                        border: `1px solid ${sev.border}`,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "18px", color: sev.color }}
                      >
                        {sev.icon}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Severity badge */}
                        <span
                          className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                          style={{
                            color: sev.color,
                            background: `${sev.color}10`,
                            border: `1px solid ${sev.color}15`,
                          }}
                        >
                          {sev.label}
                        </span>
                        {/* Module badge */}
                        <span className="flex items-center gap-1 text-[10px] font-mono text-text-secondary/50">
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "12px", color: mod.color }}
                          >
                            {alert.icon}
                          </span>
                          {mod.label}
                        </span>
                        {/* Resolved indicator */}
                        {isResolved && (
                          <span className="flex items-center gap-1 text-[9px] font-mono text-status-secure/60 ml-1">
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "12px" }}
                            >
                              check_circle
                            </span>
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
                        style={{
                          background: `${sev.color}08`,
                          border: `1px solid ${sev.color}12`,
                          color: sev.color,
                        }}
                      >
                        {alert.avatar}
                      </div>
                      <span className="text-[12px] text-text-secondary/70 font-ui">
                        {alert.candidate}
                      </span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-1.5 min-w-[70px]">
                      <span
                        className="material-symbols-outlined text-text-secondary/20"
                        style={{ fontSize: "12px" }}
                      >
                        schedule
                      </span>
                      <span className="text-[11px] font-mono text-text-secondary/50">
                        {alert.time}
                      </span>
                    </div>

                    {/* Confidence */}
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <div className="flex-1 h-[4px] bg-[#1A1A3E] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${alert.confidence}%`,
                            background: `linear-gradient(90deg, ${sev.color}80, ${sev.color})`,
                          }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-mono font-bold"
                        style={{ color: sev.color }}
                      >
                        {alert.confidence}%
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/proctor/session/SZ-8821/candidate/${alert.candidateId}`}
                      >
                        <button
                          className="alerts-action-btn"
                          title="Investigate"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "14px" }}
                          >
                            search
                          </span>
                        </button>
                      </Link>
                      <button
                        className={`alerts-action-btn ${
                          isResolved
                            ? "!border-status-secure/20 !text-status-secure/40"
                            : ""
                        }`}
                        title={isResolved ? "Unresolve" : "Resolve"}
                        onClick={() => toggleResolve(alert.id)}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "14px" }}
                        >
                          {isResolved ? "undo" : "check_circle"}
                        </span>
                      </button>
                      <button className="alerts-action-btn alerts-action-escalate" title="Escalate">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "14px" }}
                        >
                          priority_high
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Timeline Footer ── */}
          <div className="alerts-timeline-footer mt-6">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-text-secondary/20"
                style={{ fontSize: "14px" }}
              >
                timeline
              </span>
              <span className="text-[9px] font-mono text-text-secondary/20 uppercase tracking-widest">
                Alert Timeline — Session Duration
              </span>
            </div>
            <div className="flex items-end gap-[3px] h-[40px] mt-3">
              {Array.from({ length: 40 }).map((_, i) => {
                const hasAlert =
                  i === 8 || i === 12 || i === 18 || i === 22 || i === 28 || i === 32 || i === 35;
                const isBreach = i === 22 || i === 28 || i === 35;
                const h = hasAlert ? (isBreach ? 100 : 70) : 15 + Math.random() * 15;
                const color = hasAlert
                  ? isBreach
                    ? "#EF4444"
                    : "#F59E0B"
                  : "#1A1A3E";
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t transition-all duration-300"
                    style={{
                      height: `${h}%`,
                      backgroundColor: color,
                      opacity: hasAlert ? 0.8 : 0.5,
                      boxShadow: hasAlert
                        ? `0 0 6px ${color}40`
                        : "none",
                    }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[9px] text-text-secondary/20 font-mono">
                10:30
              </span>
              <span className="text-[9px] text-text-secondary/20 font-mono">
                10:35
              </span>
              <span className="text-[9px] text-text-secondary/20 font-mono">
                10:40
              </span>
              <span className="text-[9px] text-text-secondary/20 font-mono">
                10:45
              </span>
              <span className="text-[9px] text-text-secondary/20 font-mono">
                NOW
              </span>
            </div>
          </div>
        </main>
  );
}
