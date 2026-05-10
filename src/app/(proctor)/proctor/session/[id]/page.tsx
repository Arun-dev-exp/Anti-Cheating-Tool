"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import IntegrityGauge from "@/components/ui/IntegrityGauge";
import StatusBadge from "@/components/ui/StatusBadge";
import EndSessionModal from "@/components/features/EndSessionModal";
import { getSessionById, getParticipantsBySession, endSession, subscribeToParticipants } from "@/lib/sessions";
import { supabase } from "@/lib/supabase";

interface Participant {
  id: string;
  candidate_name: string;
  integrity_score: number;
  risk_factors: { keystroke: number; gaze: number; process: number; liveness: number; network: number };
  status: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProctorDashboardPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<Record<string, unknown> | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showEndModal, setShowEndModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    async function load() {
      const [sess, parts] = await Promise.all([
        getSessionById(id),
        getParticipantsBySession(id),
      ]);
      setSession(sess);
      // Map participants to include safe defaults for risk_factors
      const mappedParts = (parts || []).map((p: Record<string, unknown>) => ({
        ...p,
        integrity_score: p.integrity_score ?? 100,
        risk_factors: p.risk_factors || { keystroke: 0, gaze: 0, process: 0, liveness: 0, network: 0 },
      }));
      setParticipants(mappedParts as Participant[]);
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const channel = subscribeToParticipants(
      id,
      (newParticipant) => {
        setParticipants((prev) => {
          if (prev.find((p) => p.id === (newParticipant as unknown as Participant).id)) return prev;
          const mapped = {
            ...newParticipant,
            integrity_score: newParticipant.integrity_score ?? 100,
            risk_factors: newParticipant.risk_factors || { keystroke: 0, gaze: 0, process: 0, liveness: 0, network: 0 },
          };
          return [...prev, mapped as Participant];
        });
      },
      (updatedParticipant) => {
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === (updatedParticipant as unknown as Participant).id
              ? ({
                  ...updatedParticipant,
                  integrity_score: updatedParticipant.integrity_score ?? 100,
                  risk_factors: updatedParticipant.risk_factors || { keystroke: 0, gaze: 0, process: 0, liveness: 0, network: 0 },
                } as Participant)
              : p
          )
        );
      }
    );

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleEndSession = async () => {
    setEnding(true);
    try {
      await endSession(id);
      setShowEndModal(false);
      router.push(`/proctor/session/${id}/report`);
    } catch {
      setEnding(false);
    }
  };

  const getStatus = (score: number) => score > 65 ? "secure" as const : score >= 35 ? "suspicious" as const : "breach" as const;

  const sessionCode = (session?.code as string) || "------";

  if (loading) {
    return (
      <main className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[24px] text-accent-blue animate-spin">progress_activity</span>
          <span className="text-text-secondary font-mono text-[13px]">Loading session dashboard...</span>
        </div>
      </main>
    );
  }

  return (
    <>
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-brand font-bold text-text-primary mb-1">Session Dashboard</h1>
              <p className="text-sm text-text-secondary">Session <span className="font-mono text-accent-blue">{sessionCode}</span> — {participants.length} candidates</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/proctor/session/${id}/alerts`}><button className="btn-ghost !h-[38px] !text-xs !px-4">VIEW ALERTS</button></Link>
              <button onClick={() => setShowEndModal(true)} disabled={ending} className="h-[38px] px-4 rounded-input text-xs font-semibold uppercase tracking-wider text-white bg-status-breach hover:brightness-110 transition-all">
                {ending ? "ENDING..." : "END SESSION"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {participants.length === 0 ? (
               <div className="col-span-3 text-center py-12 text-text-secondary/50 font-mono text-sm">
                 No candidates have joined yet.
               </div>
            ) : (
              participants.map((p) => (
                <Link key={p.id} href={`/proctor/session/${id}/candidate/${p.id}`}>
                  <div className={`glass-panel p-5 hover:border-border-active hover:shadow-glow-blue transition-all duration-300 cursor-pointer ${p.status === "breached" ? "!border-status-breach animate-pulse-breach" : ""}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-text-primary">{p.candidate_name}</span>
                      <StatusBadge status={getStatus(p.integrity_score)} />
                    </div>
                    <div className="flex items-center gap-4">
                      <IntegrityGauge score={p.integrity_score} size={80} strokeWidth={6} showLabel={false} />
                      <div className="flex-1 space-y-2">
                        {Object.entries(p.risk_factors).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-[10px] text-text-secondary uppercase font-mono w-16">{key}</span>
                            <div className="flex-1 h-1 bg-[#1A1A3E] rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-accent-blue" style={{ width: `${val}%` }} />
                            </div>
                            <span className="text-[10px] font-mono w-6 text-right" style={{ color: (val as number) > 65 ? "#EF4444" : (val as number) >= 35 ? "#F59E0B" : "#22C55E" }}>{val}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {p.status === "breached" && <div className="mt-3 pt-3 border-t border-border-subtle"><span className="text-xs font-mono uppercase text-[#EF4444]">BREACHED</span></div>}
                  </div>
                </Link>
              ))
            )}
          </div>
        </main>
      <EndSessionModal visible={showEndModal} onCancel={() => setShowEndModal(false)} onConfirm={handleEndSession} />
    </>
  );
}
