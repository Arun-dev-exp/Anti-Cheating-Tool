"use client";
import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import IntegrityGauge from "@/components/ui/IntegrityGauge";
import StatusBadge from "@/components/ui/StatusBadge";
import EndSessionModal from "@/components/features/EndSessionModal";
import { useSessionStore } from "@/stores/session-store";

export default function ProctorDashboardPage() {
  const { participants } = useSessionStore();
  const [showEndModal, setShowEndModal] = useState(false);

  const getStatus = (score: number) => score > 65 ? "secure" as const : score >= 35 ? "suspicious" as const : "breach" as const;

  const getVerdict = (v: string | null) => {
    if (!v) return null;
    const colors: Record<string, string> = { passed: "#22C55E", flagged: "#F59E0B", breached: "#EF4444" };
    return <span className="text-xs font-mono uppercase" style={{ color: colors[v] }}>{v}</span>;
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <Sidebar variant="proctor" />
      <div className="ml-[220px]">
        <Topbar variant="proctor" />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-brand font-bold text-text-primary mb-1">Session Dashboard</h1>
              <p className="text-sm text-text-secondary">Session <span className="font-mono text-accent-blue">SZ-8821</span> — {participants.length} candidates</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/proctor/session/SZ-8821/alerts"><button className="btn-ghost !h-[38px] !text-xs !px-4">VIEW ALERTS</button></Link>
              <button onClick={() => setShowEndModal(true)} className="h-[38px] px-4 rounded-input text-xs font-semibold uppercase tracking-wider text-white bg-status-breach hover:brightness-110 transition-all">END SESSION</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {participants.map((p) => (
              <Link key={p.id} href={`/proctor/session/SZ-8821/candidate/${p.candidateId}`}>
                <div className={`glass-panel p-5 hover:border-border-active hover:shadow-glow-blue transition-all duration-300 cursor-pointer ${p.status === "breached" ? "!border-status-breach animate-pulse-breach" : ""}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-text-primary">{p.candidateName}</span>
                    <StatusBadge status={getStatus(p.integrityScore)} />
                  </div>
                  <div className="flex items-center gap-4">
                    <IntegrityGauge score={p.integrityScore} size={80} strokeWidth={6} showLabel={false} />
                    <div className="flex-1 space-y-2">
                      {Object.entries(p.riskFactors).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-[10px] text-text-secondary uppercase font-mono w-16">{key}</span>
                          <div className="flex-1 h-1 bg-[#1A1A3E] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-accent-blue" style={{ width: `${val}%` }} />
                          </div>
                          <span className="text-[10px] font-mono w-6 text-right" style={{ color: val > 65 ? "#EF4444" : val >= 35 ? "#F59E0B" : "#22C55E" }}>{val}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {p.verdict && <div className="mt-3 pt-3 border-t border-border-subtle">{getVerdict(p.verdict)}</div>}
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
      <EndSessionModal visible={showEndModal} onCancel={() => setShowEndModal(false)} onConfirm={() => { setShowEndModal(false); window.location.href = "/proctor/session/SZ-8821/report"; }} />
    </div>
  );
}
