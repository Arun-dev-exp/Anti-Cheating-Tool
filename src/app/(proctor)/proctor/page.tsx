"use client";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { Activity, Users, BarChart3, AlertTriangle } from "lucide-react";

const recentSessions = [
  { id: "SZ-8821", title: "Technical Interview — Batch 7", candidates: 24, status: "active" as const, score: 87, date: "May 9, 2026" },
  { id: "SZ-8820", title: "Aptitude Test — Round 2", candidates: 45, status: "ended" as const, score: 91, date: "May 8, 2026" },
  { id: "SZ-8819", title: "Coding Assessment — Senior", candidates: 12, status: "ended" as const, score: 74, date: "May 7, 2026" },
  { id: "SZ-8818", title: "HR Screening — Interns", candidates: 60, status: "ended" as const, score: 93, date: "May 6, 2026" },
];

export default function ProctorCommandCenter() {
  return (
    <div className="min-h-screen bg-bg-base">
      <Sidebar variant="proctor" />
      <div className="ml-[220px]">
        <Topbar variant="proctor" />

        <main className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-brand font-bold text-text-primary mb-1">Command Center</h1>
              <p className="text-sm text-text-secondary">Welcome back, Dr. Priya Mehta</p>
            </div>
            <Link href="/proctor/create">
              <button className="btn-gradient !w-auto !px-6 !h-[42px]">
                + CREATE SESSION
              </button>
            </Link>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <MetricCard label="TOTAL SESSIONS" value="156" subtext="↑ 12% this month" icon={<Activity size={18} />} trend="up" />
            <MetricCard label="ACTIVE NOW" value="3" subtext="24 candidates live" icon={<Users size={18} />} trend="neutral" />
            <MetricCard label="AVG SCORE" value="87.4" subtext="↑ 2.1 from last week" icon={<BarChart3 size={18} />} trend="up" />
            <MetricCard label="FLAGGED" value="7" subtext="↓ 3 from last week" icon={<AlertTriangle size={18} />} trend="down" />
          </div>

          {/* Active Sessions */}
          <div className="mb-8">
            <span className="section-header block mb-4">ACTIVE SESSIONS</span>
            <div className="grid grid-cols-3 gap-4">
              {recentSessions
                .filter((s) => s.status === "active")
                .map((session) => (
                  <Link key={session.id} href={`/proctor/session/${session.id}`}>
                    <div className="glass-panel p-5 hover:border-border-active hover:shadow-glow-blue transition-all duration-300 cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-accent-blue text-sm">{session.id}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-status-secure" style={{ animation: "dotPulse 2s infinite" }} />
                          <span className="text-xs text-status-secure font-mono">LIVE</span>
                        </div>
                      </div>
                      <h3 className="text-sm text-text-primary font-semibold mb-2">{session.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-secondary">{session.candidates} candidates</span>
                        <span className="text-xs text-accent-blue font-mono">MONITOR →</span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* Recent Sessions Table */}
          <div>
            <span className="section-header block mb-4">RECENT SESSIONS</span>
            <div className="glass-panel overflow-hidden">
              {/* Header Row */}
              <div className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-border-subtle text-xs text-text-secondary uppercase tracking-wider font-ui">
                <span>Session</span>
                <span className="col-span-2">Title</span>
                <span>Candidates</span>
                <span>Avg Score</span>
                <span>Status</span>
              </div>
              {/* Data Rows */}
              {recentSessions.map((session) => (
                <Link key={session.id} href={`/proctor/session/${session.id}`}>
                  <div className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-border-subtle/50 hover:bg-bg-panel/50 transition-colors cursor-pointer text-sm">
                    <span className="font-mono text-accent-blue">{session.id}</span>
                    <span className="text-text-primary col-span-2">{session.title}</span>
                    <span className="font-mono text-text-primary">{session.candidates}</span>
                    <span className="font-mono text-text-primary">{session.score}</span>
                    <span>
                      <StatusBadge
                        status={session.status === "active" ? "secure" : "suspicious"}
                        label={session.status === "active" ? "LIVE" : "ENDED"}
                      />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
