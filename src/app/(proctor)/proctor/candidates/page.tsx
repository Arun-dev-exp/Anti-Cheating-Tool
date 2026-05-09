"use client";
import { useState } from "react";
import Link from "next/link";

const candidates = [
  { id: "c-001", name: "Arjun Sharma", email: "arjun@example.com", avatar: "AS", sessions: 5, avgScore: 92, lastActive: "May 9, 2026", status: "active" },
  { id: "c-002", name: "Meera Patel", email: "meera@example.com", avatar: "MP", sessions: 3, avgScore: 88, lastActive: "May 9, 2026", status: "active" },
  { id: "c-003", name: "Ravi Kumar", email: "ravi@example.com", avatar: "RK", sessions: 4, avgScore: 61, lastActive: "May 8, 2026", status: "flagged" },
  { id: "c-004", name: "Sneha Reddy", email: "sneha@example.com", avatar: "SR", sessions: 2, avgScore: 95, lastActive: "May 9, 2026", status: "active" },
  { id: "c-005", name: "Amit Joshi", email: "amit@example.com", avatar: "AJ", sessions: 4, avgScore: 28, lastActive: "May 9, 2026", status: "breached" },
  { id: "c-006", name: "Priya Nair", email: "priya@example.com", avatar: "PN", sessions: 1, avgScore: 84, lastActive: "May 7, 2026", status: "active" },
  { id: "c-007", name: "Vikram Singh", email: "vikram@example.com", avatar: "VS", sessions: 6, avgScore: 76, lastActive: "May 6, 2026", status: "active" },
  { id: "c-008", name: "Kavya Menon", email: "kavya@example.com", avatar: "KM", sessions: 2, avgScore: 90, lastActive: "May 5, 2026", status: "active" },
];

const statusConfig = {
  active: { color: "#22C55E", label: "ACTIVE", icon: "check_circle" },
  flagged: { color: "#F59E0B", label: "FLAGGED", icon: "warning" },
  breached: { color: "#EF4444", label: "BREACHED", icon: "error" },
};

type FilterType = "all" | "active" | "flagged" | "breached";

export default function CandidatesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const activeCount = candidates.filter((c) => c.status === "active").length;
  const flaggedCount = candidates.filter((c) => c.status === "flagged").length;
  const breachedCount = candidates.filter((c) => c.status === "breached").length;

  const getScoreColor = (score: number) =>
    score > 80 ? "#22C55E" : score >= 50 ? "#F59E0B" : "#EF4444";

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
                  {candidates.length} registered candidates across all sessions
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-mono font-semibold uppercase tracking-wider transition-all duration-200"
              style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", color: "#3B82F6" }}>
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              Add Candidate
            </button>
          </div>

          {/* KPI Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "TOTAL", value: candidates.length, icon: "groups", color: "#3B82F6" },
              { label: "ACTIVE", value: activeCount, icon: "check_circle", color: "#22C55E" },
              { label: "FLAGGED", value: flaggedCount, icon: "warning", color: "#F59E0B" },
              { label: "BREACHED", value: breachedCount, icon: "error", color: "#EF4444" },
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
                  placeholder="Search candidates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg text-[12px] font-mono bg-bg-surface/30 border border-border-subtle/40 text-text-primary placeholder:text-text-secondary/25 focus:outline-none focus:border-accent-blue/30 transition-colors w-[260px]"
                />
              </div>
              <div className="flex items-center gap-2">
                {(["all", "active", "flagged", "breached"] as const).map((f) => {
                  const isActive = filter === f;
                  const cfg = f === "all"
                    ? { color: "#3B82F6", label: "All" }
                    : { color: statusConfig[f].color, label: statusConfig[f].label };
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
              <span className="col-span-4">Candidate</span>
              <span className="col-span-1">Status</span>
              <span className="col-span-2">Sessions</span>
              <span className="col-span-2">Avg Score</span>
              <span className="col-span-2">Last Active</span>
              <span className="col-span-1 text-right">Actions</span>
            </div>

            {/* Rows */}
            {filtered.map((c, i) => {
              const st = statusConfig[c.status as keyof typeof statusConfig];
              return (
                <div
                  key={c.id}
                  className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b border-border-subtle/20 hover:bg-bg-panel/30 transition-all duration-150 group"
                  style={{ animation: `slideUp 0.35s ease-out ${i * 40}ms both` }}
                >
                  {/* Candidate Info */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold shrink-0"
                      style={{
                        background: `${st.color}06`,
                        border: `1px solid ${st.color}15`,
                        color: st.color,
                      }}
                    >
                      {c.avatar}
                    </div>
                    <div>
                      <span className="text-[13px] text-text-primary font-medium block leading-tight">{c.name}</span>
                      <span className="text-[11px] text-text-secondary/40 font-mono">{c.email}</span>
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

                  {/* Sessions */}
                  <div className="col-span-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-text-secondary/20" style={{ fontSize: "13px" }}>event_note</span>
                    <span className="text-[12px] text-text-secondary/70 font-mono">{c.sessions} sessions</span>
                  </div>

                  {/* Avg Score */}
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="flex-1 h-[4px] bg-[#1A1A3E] rounded-full overflow-hidden max-w-[80px]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${c.avgScore}%`,
                          background: `linear-gradient(90deg, ${getScoreColor(c.avgScore)}80, ${getScoreColor(c.avgScore)})`,
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-bold" style={{ color: getScoreColor(c.avgScore) }}>
                      {c.avgScore}
                    </span>
                  </div>

                  {/* Last Active */}
                  <div className="col-span-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-text-secondary/20" style={{ fontSize: "12px" }}>schedule</span>
                    <span className="text-[11px] text-text-secondary/50 font-mono">{c.lastActive}</span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-1.5">
                    <Link href={`/proctor/session/SZ-8821/candidate/${c.id}`}>
                      <button className="alerts-action-btn" title="View Details">
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>visibility</span>
                      </button>
                    </Link>
                    <button className="alerts-action-btn" title="Message">
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>mail</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-text-secondary/15 mb-3" style={{ fontSize: "40px" }}>search_off</span>
                <span className="text-[13px] text-text-secondary/40 font-ui">No candidates found</span>
                <span className="text-[11px] text-text-secondary/25 font-mono mt-1">Try adjusting your search or filters</span>
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
                {filtered.length} of {candidates.length} candidates
              </span>
            </div>
          </div>
        </main>
  );
}
