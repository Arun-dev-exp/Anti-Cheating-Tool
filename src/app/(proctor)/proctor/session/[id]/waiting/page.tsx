"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import GradientButton from "@/components/ui/GradientButton";
import { getSessionById, getParticipantsBySession, startSession, subscribeToParticipants } from "@/lib/sessions";
import { supabase } from "@/lib/supabase";

interface Participant {
  id: string;
  candidate_name: string;
  status: string;
  joined_at: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProctorWaitingPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [session, setSession] = useState<Record<string, unknown> | null>(null);
  const [candidates, setCandidates] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch session and participants
  useEffect(() => {
    async function load() {
      const [sess, parts] = await Promise.all([
        getSessionById(id),
        getParticipantsBySession(id),
      ]);
      setSession(sess);
      setCandidates((parts || []) as unknown as Participant[]);
      setLoading(false);
    }
    load();
  }, [id]);

  // Subscribe to new participants joining in real-time
  useEffect(() => {
    if (!id) return;

    const channel = subscribeToParticipants(
      id,
      (newParticipant) => {
        setCandidates((prev) => {
          // Avoid duplicates
          if (prev.find((p) => p.id === (newParticipant as unknown as Participant).id)) return prev;
          return [...prev, newParticipant as unknown as Participant];
        });
      },
      (updatedParticipant) => {
        setCandidates((prev) =>
          prev.map((p) =>
            p.id === (updatedParticipant as unknown as Participant).id
              ? (updatedParticipant as unknown as Participant)
              : p
          )
        );
      }
    );

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const sessionCode = (session?.code as string) || "------";
  const maxCandidates = (session?.max_candidates as number) || 30;
  const fmtTime = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  const handleStart = async () => {
    setStarting(true);
    try {
      await startSession(id);
      router.push(`/proctor/session/${id}`);
    } catch {
      setStarting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const fmtJoinedAt = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    } catch {
      return "—";
    }
  };

  if (loading) {
    return (
      <main className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[24px] text-accent-blue animate-spin">progress_activity</span>
          <span className="text-text-secondary font-mono text-[13px]">Loading waiting room...</span>
        </div>
      </main>
    );
  }

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
                  Session <span className="font-mono text-accent-blue">{sessionCode}</span>
                  <span className="text-text-secondary/30">•</span>
                  <span className="font-mono text-text-secondary/60">{fmtTime} elapsed</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GradientButton onClick={handleStart} fullWidth={false} className="!w-auto !px-8" disabled={starting || candidates.length === 0}>
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
              { label: "Total Joined", value: candidates.length, max: String(maxCandidates), icon: "group_add", color: "#3B82F6" },
              { label: "Ready", value: candidates.filter(c => c.status === "waiting").length, max: String(candidates.length), icon: "check_circle", color: "#22C55E" },
              { label: "In Progress", value: candidates.filter(c => c.status === "active").length, max: null, icon: "pending", color: "#F59E0B" },
              { label: "Capacity", value: `${Math.round((candidates.length / maxCandidates) * 100)}%`, max: null, icon: "donut_large", color: "#06B6D4" },
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
              <span className="col-span-5">Candidate</span>
              <span className="col-span-3">Joined At</span>
              <span className="col-span-4 text-right">Status</span>
            </div>

            {/* Rows — REAL DATA */}
            {candidates.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <span className="material-symbols-outlined text-[36px] text-text-secondary/20 mb-3 block">person_search</span>
                <p className="text-[14px] text-text-secondary/50 font-ui mb-1">No candidates have joined yet</p>
                <p className="text-[12px] text-text-secondary/30 font-mono">Share code <span className="text-accent-blue">{sessionCode}</span> with your candidates</p>
              </div>
            ) : (
              candidates.map((c, i) => (
                <div
                  key={c.id}
                  className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b border-border-subtle/20 hover:bg-bg-panel/30 transition-all duration-150 group"
                  style={{ animation: `slideUp 0.4s ease-out ${i * 60}ms both` }}
                >
                  {/* Candidate */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold shrink-0"
                      style={{
                        background: "rgba(34,197,94,0.06)",
                        border: "1px solid rgba(34,197,94,0.15)",
                        color: "#22C55E",
                      }}>
                      {getInitials(c.candidate_name)}
                    </div>
                    <div>
                      <span className="text-[13px] text-text-primary font-medium block leading-tight">{c.candidate_name}</span>
                      <span className="text-[11px] text-text-secondary/40 font-mono">{c.id.slice(0, 8)}</span>
                    </div>
                  </div>

                  {/* Joined At */}
                  <div className="col-span-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[13px] text-text-secondary/30">schedule</span>
                    <span className="text-[12px] text-text-secondary/70 font-mono">{fmtJoinedAt(c.joined_at)}</span>
                  </div>

                  {/* Status */}
                  <div className="col-span-4 flex items-center justify-end">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider"
                      style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22C55E" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-status-secure" style={{ boxShadow: "0 0 4px #22C55E" }} />
                      Ready
                    </span>
                  </div>
                </div>
              ))
            )}

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
