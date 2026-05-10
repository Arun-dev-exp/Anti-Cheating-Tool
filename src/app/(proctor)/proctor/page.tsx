"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { listSessions } from "@/lib/sessions";
import {
  Activity,
  Users,
  BarChart3,
  AlertTriangle,
  Plus,
  ChevronRight,
  Clock,
  ArrowUpRight,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react";

interface SessionRow {
  id: string;
  code: string;
  title: string;
  interviewer_name: string;
  max_candidates: number;
  duration_minutes: number;
  status: string;
  created_at: string;
}

const quickActions = [
  {
    icon: "event_note",
    label: "New Session",
    desc: "Create a monitored session",
    href: "/proctor/create",
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
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const data = await listSessions();
        setSessions(data as unknown as SessionRow[]);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  const activeSessions = sessions.filter((s) => s.status === "active" || s.status === "waiting");
  const endedSessions = sessions.filter((s) => s.status === "ended");

  const kpis = [
    {
      label: "Total Sessions",
      value: String(sessions.length),
      subtext: `${activeSessions.length} active`,
      icon: <Activity size={18} />,
      color: "#3B82F6",
    },
    {
      label: "Active Now",
      value: String(activeSessions.length),
      subtext: `${sessions.filter(s => s.status === "waiting").length} waiting`,
      icon: <Users size={18} />,
      color: "#06B6D4",
    },
    {
      label: "Completed",
      value: String(endedSessions.length),
      subtext: "sessions ended",
      icon: <BarChart3 size={18} />,
      color: "#22C55E",
    },
    {
      label: "Waiting",
      value: String(sessions.filter(s => s.status === "waiting").length),
      subtext: "not started yet",
      icon: <Clock size={18} />,
      color: "#F59E0B",
    },
  ];

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "—";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return { status: "secure" as const, label: "LIVE" };
      case "waiting": return { status: "suspicious" as const, label: "WAITING" };
      case "ended": return { status: "suspicious" as const, label: "ENDED" };
      default: return { status: "suspicious" as const, label: status.toUpperCase() };
    }
  };

  return (
        <main className="p-6 lg:p-8">
          {/* ── Header ── */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
                <span className="text-[11px] font-mono text-accent-blue uppercase tracking-wider font-bold">
                  Interviewer Console
                </span>
              </div>
              <h1 className="text-[24px] font-semibold text-text-primary font-ui mb-1">
                Command Center
              </h1>
              <p className="text-[13px] text-text-secondary font-ui">
                Manage your interview sessions
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
            {kpis.map((kpi) => (
              <div key={kpi.label} className="proctor-kpi-card group">
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
                <div className="flex items-end justify-between">
                  <span className="font-mono text-[32px] font-bold text-text-primary leading-none">
                    {loading ? "—" : kpi.value}
                  </span>
                  <span className="text-[11px] font-mono text-text-secondary/50 mb-1">
                    {kpi.subtext}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Active / Waiting Sessions ── */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-status-secure animate-pulse" />
                <span className="text-[11px] font-mono text-text-secondary/60 uppercase tracking-widest">
                  Active & Waiting Sessions
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <span className="material-symbols-outlined text-[24px] text-accent-blue animate-spin">progress_activity</span>
                <span className="text-text-secondary font-mono text-[13px] ml-3">Loading sessions...</span>
              </div>
            ) : activeSessions.length === 0 ? (
              <div className="rounded-xl border border-border-subtle bg-bg-surface/40 p-12 text-center">
                <span className="material-symbols-outlined text-[36px] text-text-secondary/20 block mb-3">event_available</span>
                <p className="text-[14px] text-text-secondary/50 font-ui mb-2">No active sessions</p>
                <p className="text-[12px] text-text-secondary/30">Create a new session to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={session.status === "waiting" ? `/proctor/session/${session.id}/waiting` : `/proctor/session/${session.id}`}
                  >
                    <div className="proctor-session-card group">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-accent-blue text-[13px]">
                          {session.code}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${session.status === "active" ? "bg-status-secure" : "bg-amber-400"}`}
                            style={{
                              animation: "dotPulse 2s infinite",
                              boxShadow: session.status === "active" ? "0 0 6px #22C55E" : "0 0 6px #F59E0B",
                            }}
                          />
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${session.status === "active" ? "text-status-secure" : "text-amber-400"}`}>
                            {session.status === "active" ? "LIVE" : "WAITING"}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-[14px] text-text-primary font-semibold mb-3 font-ui">
                        {session.title}
                      </h3>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1.5 text-text-secondary/50">
                          <Users size={12} />
                          <span className="text-[11px] font-mono">
                            {session.max_candidates} max
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-text-secondary/50">
                          <Clock size={12} />
                          <span className="text-[11px] font-mono">
                            {session.duration_minutes}m
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border-subtle/40">
                        <span className="text-[11px] text-text-secondary/40 font-mono">
                          {fmtDate(session.created_at)}
                        </span>
                        <span className="text-[11px] text-accent-blue font-mono font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          {session.status === "waiting" ? "OPEN" : "MONITOR"}{" "}
                          <ArrowUpRight
                            size={12}
                            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Quick actions */}
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
            )}
          </div>

          {/* ── All Sessions Table ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono text-text-secondary/60 uppercase tracking-widest">
                All Sessions
              </span>

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
                <span className="w-[90px]">Code</span>
                <span className="flex-1">Title</span>
                <span className="w-[100px]">Interviewer</span>
                <span className="w-[80px] text-center">Capacity</span>
                <span className="w-[80px] text-center">Duration</span>
                <span className="w-[90px] text-center">Status</span>
                <span className="w-[40px]" />
              </div>

              {/* Data Rows */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <span className="material-symbols-outlined text-[20px] text-accent-blue animate-spin">progress_activity</span>
                </div>
              ) : sessions.length === 0 ? (
                <div className="px-5 py-8 text-center text-[13px] text-text-secondary/40 font-mono">
                  No sessions yet. Create your first one!
                </div>
              ) : (
                sessions
                  .filter(
                    (s) =>
                      !searchQuery ||
                      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      s.code.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((session) => {
                    const badge = getStatusBadge(session.status);
                    return (
                      <Link
                        key={session.id}
                        href={session.status === "waiting" ? `/proctor/session/${session.id}/waiting` : `/proctor/session/${session.id}`}
                      >
                        <div className="proctor-table-row group">
                          <span className="w-[90px] font-mono text-accent-blue text-[12px]">
                            {session.code}
                          </span>
                          <span className="flex-1 text-text-primary text-[13px] font-ui truncate">
                            {session.title}
                          </span>
                          <span className="w-[100px] text-text-secondary/60 text-[12px] font-ui truncate">
                            {session.interviewer_name}
                          </span>
                          <span className="w-[80px] text-center font-mono text-text-primary text-[12px]">
                            {session.max_candidates}
                          </span>
                          <span className="w-[80px] text-center font-mono text-text-primary text-[12px]">
                            {session.duration_minutes}m
                          </span>
                          <span className="w-[90px] flex justify-center">
                            <StatusBadge
                              status={badge.status}
                              label={badge.label}
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
                    );
                  })
              )}
            </div>
          </div>
        </main>
  );
}
