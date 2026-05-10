"use client";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import IntegrityGauge from "@/components/ui/IntegrityGauge";
import StatusBadge from "@/components/ui/StatusBadge";
import GhostButton from "@/components/ui/GhostButton";
import { getSessionById, getParticipantsBySession } from "@/lib/sessions";
import { Download, Printer } from "lucide-react";

const breachEvidence = [
  { time: "10:38:44", module: "KEYSTROKE", event: "Copy-paste sequence detected", confidence: 88, candidate: "Amit Joshi" },
  { time: "10:44:18", module: "GAZE", event: "Extended off-screen gaze — 12.4s", confidence: 91, candidate: "Amit Joshi" },
  { time: "10:45:23", module: "PROCESS", event: "Unauthorized process: chrome.exe", confidence: 94, candidate: "Amit Joshi" },
];

interface Participant {
  id: string;
  candidate_name: string;
  integrity_score: number;
  status: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PostSessionReportPage({ params }: PageProps) {
  const { id } = use(params);
  const [session, setSession] = useState<Record<string, unknown> | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [sess, parts] = await Promise.all([
        getSessionById(id),
        getParticipantsBySession(id),
      ]);
      setSession(sess);
      setParticipants((parts || []) as unknown as Participant[]);
      setLoading(false);
    }
    load();
  }, [id]);

  const getStatus = (s: number) => s > 65 ? "secure" as const : s >= 35 ? "suspicious" as const : "breach" as const;

  const sessionCode = (session?.code as string) || "------";
  const duration = session?.duration_minutes ? `${session.duration_minutes}m` : "—";
  const avgScore = participants.length > 0 
    ? (participants.reduce((acc, p) => acc + (p.integrity_score || 0), 0) / participants.length).toFixed(1)
    : "—";
  const breaches = participants.filter(p => p.status === "breached" || (p.integrity_score && p.integrity_score < 35)).length;

  if (loading) {
    return (
      <main className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[24px] text-accent-blue animate-spin">progress_activity</span>
          <span className="text-text-secondary font-mono text-[13px]">Generating report...</span>
        </div>
      </main>
    );
  }

  return (
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-brand font-bold text-text-primary mb-1">Post-Session Audit Report</h1>
              <p className="text-sm text-text-secondary">Session <span className="font-mono text-accent-blue">{sessionCode}</span> — {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <GhostButton className="!h-[38px] !text-xs !px-4"><Download size={14} /> EXPORT PDF</GhostButton>
              <GhostButton className="!h-[38px] !text-xs !px-4"><Printer size={14} /> PRINT</GhostButton>
            </div>
          </div>

          {/* Session Summary */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Duration", value: duration },
              { label: "Candidates", value: `${participants.length}` },
              { label: "Avg Score", value: avgScore },
              { label: "Breaches", value: `${breaches}` },
            ].map((m) => (
              <div key={m.label} className="glass-panel p-4 text-center">
                <span className="section-header block mb-2">{m.label}</span>
                <span className="font-mono text-2xl font-bold text-text-primary">{m.value}</span>
              </div>
            ))}
          </div>

          {/* Timeline Graph Placeholder */}
          <div className="glass-panel p-5 mb-8">
            <span className="section-header block mb-4">INTEGRITY TIMELINE</span>
            <div className="h-[200px] flex items-end gap-1">
              {Array.from({ length: 60 }).map((_, i) => {
                const h = 40 + Math.sin(i * 0.2) * 20 + (i > 40 ? -(i - 40) * 2 : 0);
                const color = h > 65 ? "#22C55E" : h >= 35 ? "#F59E0B" : "#EF4444";
                return <div key={i} className="flex-1 rounded-t" style={{ height: `${Math.max(h, 10)}%`, backgroundColor: color, opacity: 0.7 }} />;
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-text-secondary font-mono">
              <span>00:00</span><span>00:30</span><span>01:00</span><span>01:30</span><span>{duration}</span>
            </div>
          </div>

          {/* Per-Candidate Scores */}
          <div className="mb-8">
            <span className="section-header block mb-4">CANDIDATE RESULTS</span>
            <div className="glass-panel overflow-hidden">
              <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-border-subtle text-xs text-text-secondary uppercase tracking-wider font-ui">
                <span>Candidate</span><span>Score</span><span>Status</span><span>Verdict</span><span>Details</span>
              </div>
              {participants.length === 0 && (
                <div className="px-4 py-8 text-center text-text-secondary/50 text-sm font-mono">No candidates found</div>
              )}
              {participants.map((p) => {
                const score = p.integrity_score ?? 100;
                const statusStr = getStatus(score);
                const isBreached = p.status === "breached" || score < 35;
                return (
                  <div key={p.id} className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-border-subtle/50 hover:bg-bg-panel/50 transition-colors">
                    <span className="text-sm text-text-primary">{p.candidate_name}</span>
                    <span className="font-mono text-sm" style={{ color: score > 65 ? "#22C55E" : score >= 35 ? "#F59E0B" : "#EF4444" }}>{score}</span>
                    <StatusBadge status={statusStr} />
                    <span className="text-xs font-mono uppercase" style={{ color: isBreached ? "#EF4444" : score > 65 ? "#22C55E" : "#F59E0B" }}>{isBreached ? "BREACHED" : score > 65 ? "PASSED" : "FLAGGED"}</span>
                    <Link href={`/proctor/session/${id}/candidate/${p.id}`} className="text-xs text-accent-blue hover:underline font-mono">VIEW →</Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breach Evidence (Static placeholder for now since we don't have events DB yet) */}
          <div>
            <span className="section-header block mb-4">BREACH EVIDENCE</span>
            <div className="glass-panel overflow-hidden">
              <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-border-subtle text-xs text-text-secondary uppercase tracking-wider font-ui">
                <span>Time</span><span>Module</span><span>Event</span><span>Confidence</span><span>Candidate</span>
              </div>
              {breachEvidence.map((e, i) => (
                <div key={i} className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-border-subtle/50 bg-glow-breach/20">
                  <span className="text-sm font-mono text-text-secondary">{e.time}</span>
                  <span className="text-xs font-mono text-status-breach uppercase">{e.module}</span>
                  <span className="text-sm text-text-primary">{e.event}</span>
                  <span className="text-sm font-mono text-status-breach">{e.confidence}%</span>
                  <span className="text-sm text-text-primary">{e.candidate}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
  );
}
