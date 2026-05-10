"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface Participant {
  id: string;
  name: string;
  session_id: string;
  risk_score: number;
  status: string;
  joined_at: string;
  session_code?: string;
  session_title?: string;
}

const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
  monitoring: { color: "#22C55E", label: "LIVE", icon: "sensors" },
  joined: { color: "#3B82F6", label: "JOINED", icon: "check_circle" },
  waiting: { color: "#F59E0B", label: "WAITING", icon: "schedule" },
  ended: { color: "#6B7280", label: "ENDED", icon: "stop_circle" },
  flagged: { color: "#EF4444", label: "FLAGGED", icon: "warning" },
};

type FilterType = "all" | "monitoring" | "joined" | "waiting" | "flagged";

export default function CandidatesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchParticipants() {
      try {
        // First get this interviewer's sessions, then get their participants
        const { data: sessions } = await supabase
          .from("sessions")
          .select("id, code, title")
          .eq("interviewer_id", user!.id);

        if (!sessions || sessions.length === 0) {
          setParticipants([]);
          setLoading(false);
          return;
        }

        const sessionIds = sessions.map((s) => s.id);
        const sessionMap = new Map(sessions.map((s) => [s.id, s]));

        const { data: parts } = await supabase
          .from("participants")
          .select("*")
          .in("session_id", sessionIds)
          .order("joined_at", { ascending: false });

        if (parts) {
          setParticipants(
            parts.map((p) => ({
              ...p,
              session_code: sessionMap.get(p.session_id)?.code ?? "—",
              session_title: sessionMap.get(p.session_id)?.title ?? "—",
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch participants:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchParticipants();
  }, [user]);

  const filtered = participants.filter((c) => {
    const matchesSearch =
      (c.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.id ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.session_code ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getScoreColor = (score: number) =>
    score > 80 ? "#22C55E" : score >= 50 ? "#F59E0B" : "#EF4444";

  const getStatus = (status: string) =>
    statusConfig[status] ?? statusConfig.joined;

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "—";
    }
  };

  const getInitials = (name: string | undefined | null) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "??";

  if (loading) {
    return (
      <main className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-accent-blue animate-spin" style={{ fontSize: "32px" }}>progress_activity</span>
          <span className="text-[13px] text-text-secondary/50 font-mono">Loading candidates...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.08))",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <span className="material-symbols-outlined text-[24px] text-accent-blue">groups</span>
          </div>
          <div>
            <h1 className="text-[22px] font-ui font-semibold text-text-primary leading-tight">Candidates</h1>
            <p className="text-[13px] text-text-secondary">
              {participants.length} participant{participants.length !== 1 ? "s" : ""} across your sessions
            </p>
          </div>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "TOTAL", value: participants.length, icon: "groups", color: "#3B82F6" },
          { label: "LIVE", value: participants.filter((c) => c.status === "monitoring").length, icon: "sensors", color: "#22C55E" },
          { label: "JOINED", value: participants.filter((c) => c.status === "joined").length, icon: "check_circle", color: "#06B6D4" },
          { label: "WAITING", value: participants.filter((c) => c.status === "waiting").length, icon: "schedule", color: "#F59E0B" },
        ].map((kpi, i) => (
          <div key={i} className="alerts-kpi-card" style={{ animationDelay: `${i * 60}ms` }}>
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
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/25" style={{ fontSize: "16px" }}>search</span>
            <input
              type="text"
              placeholder="Search by name or session code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg text-[12px] font-mono bg-bg-surface/30 border border-border-subtle/40 text-text-primary placeholder:text-text-secondary/25 focus:outline-none focus:border-accent-blue/30 transition-colors w-[280px]"
            />
          </div>
          <div className="flex items-center gap-2">
            {(["all", "monitoring", "joined", "waiting"] as const).map((f) => {
              const isActive = filter === f;
              const cfg = f === "all"
                ? { color: "#3B82F6", label: "All" }
                : { color: (statusConfig[f]?.color ?? "#3B82F6"), label: (statusConfig[f]?.label ?? f) };
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
        </div>
        <span className="text-[10px] font-mono text-text-secondary/30">
          {filtered.length} candidates shown
        </span>
      </div>

      {/* Candidate Table */}
      <div className="rounded-xl border border-border-subtle bg-bg-surface/40 overflow-hidden" style={{ backdropFilter: "blur(8px)" }}>
        {/* Column Headers */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border-subtle/50 text-[9px] text-text-secondary/40 uppercase tracking-widest font-mono bg-bg-surface/30">
          <span className="col-span-3">Candidate</span>
          <span className="col-span-2">Session</span>
          <span className="col-span-1">Status</span>
          <span className="col-span-2">Risk Score</span>
          <span className="col-span-2">Joined</span>
          <span className="col-span-2 text-right">Actions</span>
        </div>

        {/* Rows */}
        {filtered.map((c, i) => {
          const st = getStatus(c.status);
          return (
            <div
              key={c.id}
              className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b border-border-subtle/20 hover:bg-bg-panel/30 transition-all duration-150 group"
              style={{ animation: `slideUp 0.35s ease-out ${i * 40}ms both` }}
            >
              {/* Candidate Info */}
              <div className="col-span-3 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold shrink-0"
                  style={{
                    background: `${st.color}06`,
                    border: `1px solid ${st.color}15`,
                    color: st.color,
                  }}
                >
                  {getInitials(c.name)}
                </div>
                <div>
                  <span className="text-[13px] text-text-primary font-medium block leading-tight">{c.name}</span>
                  <span className="text-[11px] text-text-secondary/40 font-mono">{c.id.slice(0, 8)}</span>
                </div>
              </div>

              {/* Session */}
              <div className="col-span-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-text-secondary/20" style={{ fontSize: "13px" }}>event_note</span>
                <div>
                  <span className="text-[11px] text-text-secondary/60 font-mono block">{c.session_code}</span>
                  <span className="text-[10px] text-text-secondary/30 font-mono truncate block max-w-[120px]">{c.session_title}</span>
                </div>
              </div>

              {/* Status */}
              <div className="col-span-1 flex items-center">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider"
                  style={{
                    color: st.color,
                    background: `${st.color}10`,
                    border: `1px solid ${st.color}15`,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>{st.icon}</span>
                  {st.label}
                </span>
              </div>

              {/* Risk Score */}
              <div className="col-span-2 flex items-center gap-2">
                <div className="flex-1 h-[4px] bg-[#1A1A3E] rounded-full overflow-hidden max-w-[80px]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${c.risk_score}%`,
                      background: `linear-gradient(90deg, ${getScoreColor(c.risk_score)}80, ${getScoreColor(c.risk_score)})`,
                    }}
                  />
                </div>
                <span className="text-[11px] font-mono font-bold" style={{ color: getScoreColor(c.risk_score) }}>
                  {c.risk_score}
                </span>
              </div>

              {/* Joined */}
              <div className="col-span-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-text-secondary/20" style={{ fontSize: "12px" }}>schedule</span>
                <span className="text-[11px] text-text-secondary/50 font-mono">{fmtDate(c.joined_at)}</span>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-1.5">
                <Link href={`/proctor/session/${c.session_id}/candidate/${c.id}`}>
                  <button className="alerts-action-btn" title="View Full Report">
                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>visibility</span>
                  </button>
                </Link>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-text-secondary/15 mb-3" style={{ fontSize: "40px" }}>group_off</span>
            <span className="text-[13px] text-text-secondary/40 font-ui">No candidates yet</span>
            <span className="text-[11px] text-text-secondary/25 font-mono mt-1">
              Candidates will appear here once they join your sessions
            </span>
          </div>
        )}

        {/* Table Footer */}
        <div className="px-5 py-3 flex items-center justify-between bg-bg-surface/20">
          <div className="flex items-center gap-4 text-[10px] font-mono text-text-secondary/30">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>encrypted</span>
              E2E ENCRYPTED
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>dns</span>
              ON-DEVICE AI
            </span>
          </div>
          <span className="text-[10px] font-mono text-text-secondary/25">
            {filtered.length} of {participants.length} candidates
          </span>
        </div>
      </div>
    </main>
  );
}
