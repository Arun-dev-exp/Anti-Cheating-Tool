"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GradientButton from "@/components/ui/GradientButton";

const candidates = [
  { name: "Arjun Sharma", email: "arjun@example.com", systemCheck: true, liveness: true, joinedAt: "10:32 AM", avatar: "AS" },
  { name: "Meera Patel", email: "meera@example.com", systemCheck: true, liveness: true, joinedAt: "10:33 AM", avatar: "MP" },
  { name: "Ravi Kumar", email: "ravi@example.com", systemCheck: true, liveness: true, joinedAt: "10:35 AM", avatar: "RK" },
  { name: "Sneha Reddy", email: "sneha@example.com", systemCheck: false, liveness: false, joinedAt: "10:36 AM", avatar: "SR" },
  { name: "Amit Joshi", email: "amit@example.com", systemCheck: true, liveness: true, joinedAt: "10:37 AM", avatar: "AJ" },
  { name: "Priya Nair", email: "priya@example.com", systemCheck: true, liveness: false, joinedAt: "10:38 AM", avatar: "PN" },
];

export default function ProctorWaitingPage() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const readyCount = candidates.filter((c) => c.systemCheck && c.liveness).length;
  const pendingCount = candidates.length - readyCount;

  useEffect(() => {
    const t = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtTime = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  const handleStart = () => {
    setStarting(true);
    setTimeout(() => router.push("/proctor/session/SZ-8821"), 800);
  };

  return (
        <main className="p-6 md:p-8">

          {/* ── Page Header ── */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.08))", border: "1px solid rgba(59,130,246,0.2)" }}>
                <span className="material-symbols-outlined text-[22px] text-accent-blue">hourglass_top</span>
              </div>
              <div>
                <h1 className="text-[20px] font-ui font-semibold text-text-primary leading-tight">Waiting Room</h1>
                <p className="text-[13px] text-text-secondary flex items-center gap-1.5">
                  Session <span className="font-mono text-accent-blue">SZ-8821</span>
                  <span className="text-text-secondary/30">•</span>
                  <span className="font-mono text-text-secondary/60">{fmtTime} elapsed</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GradientButton onClick={handleStart} fullWidth={false} className="!w-auto !px-8" disabled={starting || pendingCount > 0}>
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    {starting ? "progress_activity" : "play_arrow"}
                  </span>
                  {starting ? "STARTING..." : "START SESSION"}
                </span>
              </GradientButton>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Joined", value: candidates.length, max: "30", icon: "group_add", color: "#3B82F6" },
              { label: "System Ready", value: readyCount, max: String(candidates.length), icon: "check_circle", color: "#22C55E" },
              { label: "Pending", value: pendingCount, max: null, icon: "pending", color: pendingCount > 0 ? "#F59E0B" : "#22C55E" },
              { label: "Capacity", value: `${Math.round((candidates.length / 30) * 100)}%`, max: null, icon: "donut_large", color: "#06B6D4" },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl border border-border-subtle bg-bg-surface/40 p-4 flex items-center gap-3"
                style={{ backdropFilter: "blur(8px)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}20` }}>
                  <span className="material-symbols-outlined text-[20px]" style={{ color: stat.color }}>{stat.icon}</span>
                </div>
                <div>
                  <span className="text-[9px] text-text-secondary/50 uppercase font-mono tracking-wider block">{stat.label}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-[22px] font-bold text-text-primary leading-none">{stat.value}</span>
                    {stat.max && <span className="text-[12px] text-text-secondary/40 font-mono">/ {stat.max}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Candidate Table ── */}
          <div className="rounded-xl border border-border-subtle bg-bg-surface/40 overflow-hidden"
            style={{ backdropFilter: "blur(8px)" }}>

            {/* Table Header */}
            <div className="px-5 py-3 border-b border-border-subtle/50 flex items-center justify-between bg-bg-surface/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-accent-cyan">groups</span>
                <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">Candidates</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-secure" style={{ animation: "dotPulse 2s infinite" }} />
                  <span className="text-[10px] text-status-secure font-mono">LIVE</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-bg-base/50 text-text-secondary border border-border-subtle/50">
                  {candidates.length} joined
                </span>
              </div>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-4 px-5 py-2.5 border-b border-border-subtle/30 text-[9px] text-text-secondary/40 uppercase tracking-widest font-mono">
              <span className="col-span-4">Candidate</span>
              <span className="col-span-2">Joined At</span>
              <span className="col-span-2">System Check</span>
              <span className="col-span-2">Liveness</span>
              <span className="col-span-2 text-right">Status</span>
            </div>

            {/* Rows */}
            {candidates.map((c, i) => {
              const isReady = c.systemCheck && c.liveness;
              return (
                <div
                  key={c.email}
                  className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b border-border-subtle/20 hover:bg-bg-panel/30 transition-all duration-150 group"
                  style={{ animation: `slideUp 0.4s ease-out ${i * 60}ms both` }}
                >
                  {/* Candidate */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold shrink-0"
                      style={{
                        background: isReady ? "rgba(34,197,94,0.06)" : "rgba(245,158,11,0.06)",
                        border: `1px solid ${isReady ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)"}`,
                        color: isReady ? "#22C55E" : "#F59E0B",
                      }}>
                      {c.avatar}
                    </div>
                    <div>
                      <span className="text-[13px] text-text-primary font-medium block leading-tight">{c.name}</span>
                      <span className="text-[11px] text-text-secondary/40 font-mono">{c.email}</span>
                    </div>
                  </div>

                  {/* Joined At */}
                  <div className="col-span-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[13px] text-text-secondary/30">schedule</span>
                    <span className="text-[12px] text-text-secondary/70 font-mono">{c.joinedAt}</span>
                  </div>

                  {/* System Check */}
                  <div className="col-span-2 flex items-center gap-1.5">
                    {c.systemCheck ? (
                      <>
                        <span className="material-symbols-outlined text-[14px] text-status-secure">check_circle</span>
                        <span className="text-[11px] text-status-secure font-mono font-medium">PASSED</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[14px] text-status-suspicious">pending</span>
                        <span className="text-[11px] text-status-suspicious font-mono font-medium">PENDING</span>
                      </>
                    )}
                  </div>

                  {/* Liveness */}
                  <div className="col-span-2 flex items-center gap-1.5">
                    {c.liveness ? (
                      <>
                        <span className="material-symbols-outlined text-[14px] text-status-secure">face</span>
                        <span className="text-[11px] text-status-secure font-mono font-medium">VERIFIED</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[14px] text-status-suspicious">face_retouching_off</span>
                        <span className="text-[11px] text-status-suspicious font-mono font-medium">WAITING</span>
                      </>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex items-center justify-end">
                    {isReady ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider"
                        style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22C55E" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-status-secure" style={{ boxShadow: "0 0 4px #22C55E" }} />
                        Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider"
                        style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-status-suspicious" style={{ boxShadow: "0 0 4px #F59E0B", animation: "dotPulse 2s infinite" }} />
                        Pending
                      </span>
                    ) }
                  </div>
                </div>
              );
            })}

            {/* Table Footer */}
            <div className="px-5 py-3 flex items-center justify-between bg-bg-surface/20">
              <div className="flex items-center gap-4 text-[10px] font-mono text-text-secondary/40">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">encrypted</span>
                  E2E ENCRYPTED
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">dns</span>
                  ON-DEVICE AI
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[12px] text-status-secure">wifi</span>
                <span className="text-[10px] text-status-secure font-mono">CONNECTED</span>
              </div>
            </div>
          </div>

        </main>
  );
}
