"use client";
import { useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Activity,
  Users,
  BarChart3,
  AlertTriangle,
  Plus,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react";

/* ── Data ── */
const kpis = [
  {
    label: "Total Sessions",
    value: "156",
    subtext: "+12% this month",
    icon: <Activity size={18} />,
    trend: "up" as const,
    color: "#3B82F6",
  },
  {
    label: "Active Now",
    value: "3",
    subtext: "24 candidates live",
    icon: <Users size={18} />,
    trend: "neutral" as const,
    color: "#06B6D4",
  },
  {
    label: "Avg Score",
    value: "87.4",
    subtext: "+2.1 from last week",
    icon: <BarChart3 size={18} />,
    trend: "up" as const,
    color: "#22C55E",
  },
  {
    label: "Flagged",
    value: "7",
    subtext: "-3 from last week",
    icon: <AlertTriangle size={18} />,
    trend: "down" as const,
    color: "#F59E0B",
  },
];

const recentSessions = [
  {
    id: "SZ-8821",
    title: "Technical Interview — Batch 7",
    candidates: 24,
    status: "active" as const,
    score: 87,
    date: "May 9, 2026",
    flagged: 1,
  },
  {
    id: "SZ-8820",
    title: "Aptitude Test — Round 2",
    candidates: 45,
    status: "ended" as const,
    score: 91,
    date: "May 8, 2026",
    flagged: 2,
  },
  {
    id: "SZ-8819",
    title: "Coding Assessment — Senior",
    candidates: 12,
    status: "ended" as const,
    score: 74,
    date: "May 7, 2026",
    flagged: 3,
  },
  {
    id: "SZ-8818",
    title: "HR Screening — Interns",
    candidates: 60,
    status: "ended" as const,
    score: 93,
    date: "May 6, 2026",
    flagged: 0,
  },
];

const quickActions = [
  {
    icon: "event_note",
    label: "New Session",
    desc: "Create a proctored session",
    href: "/proctor/create",
  },
  {
    icon: "group_add",
    label: "Add Candidates",
    desc: "Invite via email or CSV",
    href: "#",
  },
  {
    icon: "bar_chart",
    label: "Reports",
    desc: "View analytics & exports",
    href: "#",
  },
];

export default function ProctorCommandCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  const getScoreColor = (score: number) =>
    score > 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444";

  return (
        <main className="p-6 lg:p-8">
          {/* ── Header ── */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
                <span className="text-[11px] font-mono text-accent-blue uppercase tracking-wider font-bold">
                  Proctor Console
                </span>
              </div>
              <h1 className="text-[24px] font-semibold text-text-primary font-ui mb-1">
                Command Center
              </h1>
              <p className="text-[13px] text-text-secondary font-ui">
                Welcome back,{" "}
                <span className="text-text-primary font-medium">
                  Dr. Priya Mehta
                </span>
              </p>
            </div>
            <Link href="/proctor/create">
              <button className="proctor-create-btn">
                <Plus size={16} />
                CREATE SESSION
              </button>
            </Link>
          </div>

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi) => {
              const TrendIcon =
                kpi.trend === "up"
                  ? TrendingUp
                  : kpi.trend === "down"
                  ? TrendingDown
                  : ArrowUpRight;
              return (
                <div key={kpi.label} className="proctor-kpi-card group">
                  {/* Top row: icon + label */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="proctor-kpi-icon"
                        style={{
                          borderColor: `${kpi.color}25`,
                          background: `${kpi.color}08`,
                        }}
                      >
                        <span style={{ color: kpi.color }}>{kpi.icon}</span>
                      </div>
                      <span className="text-[11px] font-mono text-text-secondary/60 uppercase tracking-wider">
                        {kpi.label}
                      </span>
                    </div>
                    <MoreVertical
                      size={14}
                      className="text-text-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>

                  {/* Value */}
                  <div className="flex items-end justify-between">
                    <span className="font-mono text-[32px] font-bold text-text-primary leading-none">
                      {kpi.value}
                    </span>
                    <div className="flex items-center gap-1 mb-1">
                      <TrendIcon
                        size={12}
                        style={{
                          color:
                            kpi.trend === "up"
                              ? "#22C55E"
                              : kpi.trend === "down"
                              ? "#EF4444"
                              : "#94A3B8",
                        }}
                      />
                      <span
                        className="text-[11px] font-mono"
                        style={{
                          color:
                            kpi.trend === "up"
                              ? "#22C55E"
                              : kpi.trend === "down"
                              ? "#EF4444"
                              : "#94A3B8",
                        }}
                      >
                        {kpi.subtext}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Active Sessions ── */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-status-secure animate-pulse" />
                <span className="text-[11px] font-mono text-text-secondary/60 uppercase tracking-widest">
                  Active Sessions
                </span>
              </div>
              <Link
                href="#"
                className="text-[11px] font-mono text-accent-blue/60 hover:text-accent-blue flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {recentSessions
                .filter((s) => s.status === "active")
                .map((session) => (
                  <Link
                    key={session.id}
                    href={`/proctor/session/${session.id}`}
                  >
                    <div className="proctor-session-card group">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-accent-blue text-[13px]">
                          {session.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full bg-status-secure"
                            style={{
                              animation: "dotPulse 2s infinite",
                              boxShadow: "0 0 6px #22C55E",
                            }}
                          />
                          <span className="text-[10px] text-status-secure font-mono font-bold uppercase tracking-wider">
                            LIVE
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-[14px] text-text-primary font-semibold mb-3 font-ui">
                        {session.title}
                      </h3>

                      {/* Stats row */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1.5 text-text-secondary/50">
                          <Users size={12} />
                          <span className="text-[11px] font-mono">
                            {session.candidates}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-text-secondary/50">
                          <BarChart3 size={12} />
                          <span className="text-[11px] font-mono">
                            {session.score}%
                          </span>
                        </div>
                        {session.flagged > 0 && (
                          <div className="flex items-center gap-1.5 text-amber-400/60">
                            <AlertTriangle size={12} />
                            <span className="text-[11px] font-mono">
                              {session.flagged}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-between pt-3 border-t border-border-subtle/40">
                        <span className="text-[11px] text-text-secondary/40 font-mono">
                          {session.date}
                        </span>
                        <span className="text-[11px] text-accent-blue font-mono font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          MONITOR{" "}
                          <ArrowUpRight
                            size={12}
                            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}

              {/* Quick action cards */}
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <div className="proctor-quick-action group">
                    <div className="proctor-quick-icon">
                      <span
                        className="material-symbols-outlined text-accent-blue/40 group-hover:text-accent-blue transition-colors"
                        style={{ fontSize: "20px" }}
                      >
                        {action.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-semibold text-text-primary font-ui">
                        {action.label}
                      </h4>
                      <p className="text-[11px] text-text-secondary/40">
                        {action.desc}
                      </p>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-text-secondary/20 group-hover:text-accent-blue/50 ml-auto transition-colors"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Recent Sessions Table ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono text-text-secondary/60 uppercase tracking-widest">
                Recent Sessions
              </span>

              {/* Search & filter */}
              <div className="flex items-center gap-2">
                <div className="proctor-search-box">
                  <Search size={14} className="text-text-secondary/30" />
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-[12px] text-text-primary font-ui placeholder:text-text-secondary/30 w-[160px]"
                  />
                </div>
                <button className="proctor-filter-btn">
                  <Filter size={14} />
                </button>
              </div>
            </div>

            <div className="proctor-table-container">
              {/* Header Row */}
              <div className="proctor-table-header">
                <span className="w-[80px]">Session</span>
                <span className="flex-1">Title</span>
                <span className="w-[90px] text-center">Candidates</span>
                <span className="w-[90px] text-center">Avg Score</span>
                <span className="w-[80px] text-center">Flagged</span>
                <span className="w-[90px] text-center">Status</span>
                <span className="w-[40px]" />
              </div>

              {/* Data Rows */}
              {recentSessions
                .filter(
                  (s) =>
                    !searchQuery ||
                    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.id.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((session) => (
                  <Link
                    key={session.id}
                    href={`/proctor/session/${session.id}`}
                  >
                    <div className="proctor-table-row group">
                      <span className="w-[80px] font-mono text-accent-blue text-[12px]">
                        {session.id}
                      </span>
                      <span className="flex-1 text-text-primary text-[13px] font-ui">
                        {session.title}
                      </span>
                      <span className="w-[90px] text-center font-mono text-text-primary text-[12px]">
                        {session.candidates}
                      </span>
                      <span className="w-[90px] text-center">
                        <span
                          className="font-mono text-[12px] font-semibold px-2 py-0.5 rounded-md"
                          style={{
                            color: getScoreColor(session.score),
                            background: `${getScoreColor(session.score)}10`,
                          }}
                        >
                          {session.score}
                        </span>
                      </span>
                      <span className="w-[80px] text-center">
                        {session.flagged > 0 ? (
                          <span className="font-mono text-[12px] text-amber-400/80">
                            {session.flagged}
                          </span>
                        ) : (
                          <span className="text-[11px] text-text-secondary/30 font-mono">
                            —
                          </span>
                        )}
                      </span>
                      <span className="w-[90px] flex justify-center">
                        <StatusBadge
                          status={
                            session.status === "active"
                              ? "secure"
                              : "suspicious"
                          }
                          label={
                            session.status === "active" ? "LIVE" : "ENDED"
                          }
                        />
                      </span>
                      <span className="w-[40px] flex justify-center">
                        <ChevronRight
                          size={14}
                          className="text-text-secondary/20 group-hover:text-accent-blue/50 transition-colors"
                        />
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </main>
  );
}
