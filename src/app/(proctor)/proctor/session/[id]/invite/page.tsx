"use client";
import Link from "next/link";
import GradientButton from "@/components/ui/GradientButton";
import { useState, useMemo, useEffect, use } from "react";
import { getSessionById } from "@/lib/sessions";

/* Deterministic QR grid generator */
function generateQR(seed: string): boolean[] {
  const grid: boolean[] = [];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  for (let i = 0; i < 441; i++) {
    hash = ((hash * 1103515245 + 12345) | 0) >>> 0;
    grid.push((hash % 100) > 42);
  }
  const set = (r: number, c: number, v: boolean) => { grid[r * 21 + c] = v; };
  for (let dr = 0; dr < 7; dr++)
    for (let dc = 0; dc < 7; dc++) {
      const on = dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
      set(dr, dc, on);
      set(dr, 14 + dc, on);
      set(14 + dr, dc, on);
    }
  return grid;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SessionInvitePage({ params }: PageProps) {
  const { id } = use(params);
  const [copied, setCopied] = useState<string | null>(null);
  const [session, setSession] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      const data = await getSessionById(id);
      setSession(data);
      setLoading(false);
    }
    fetchSession();
  }, [id]);

  const sessionCode = (session?.code as string) || "------";
  const sessionTitle = (session?.title as string) || "Session";
  const maxCandidates = (session?.max_candidates as number) || 30;
  const durationMinutes = (session?.duration_minutes as number) || 120;
  const createdAt = session?.created_at
    ? new Date(session.created_at as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  const qrGrid = useMemo(() => generateQR(sessionCode), [sessionCode]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const sessionDetails = [
    { label: "Session Code", value: sessionCode, icon: "tag" },
    { label: "Created", value: createdAt, icon: "schedule" },
    { label: "Capacity", value: `${maxCandidates} candidates`, icon: "groups" },
    { label: "Duration", value: `${durationMinutes} minutes`, icon: "timer" },
  ];

  if (loading) {
    return (
      <main className="p-6 md:p-8 max-w-4xl flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[24px] text-accent-blue animate-spin">progress_activity</span>
          <span className="text-text-secondary font-mono text-[13px]">Loading session...</span>
        </div>
      </main>
    );
  }

  return (
        <main className="p-6 md:p-8 max-w-4xl">

          {/* ── Success Banner ── */}
          <div className="rounded-xl border overflow-hidden mb-6"
            style={{ borderColor: "rgba(34,197,94,0.15)", background: "linear-gradient(135deg, rgba(34,197,94,0.04), rgba(6,182,212,0.02))", animation: "slideUp 0.4s ease-out" }}>
            <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, transparent, #22C55E, #06B6D4, transparent)" }} />
            <div className="px-6 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", boxShadow: "0 0 24px rgba(34,197,94,0.1)" }}>
                <span className="material-symbols-outlined text-[24px] text-status-secure">check_circle</span>
              </div>
              <div className="flex-1">
                <h1 className="text-[18px] font-ui font-semibold text-text-primary leading-tight">Session Created Successfully</h1>
                <p className="text-[13px] text-text-secondary mt-0.5">Share the session code with your candidates — <span className="font-mono text-accent-blue font-semibold">{sessionTitle}</span></p>
              </div>
              <Link href={`/proctor/session/${id}/waiting`}>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-mono font-semibold uppercase tracking-wider transition-all duration-200"
                  style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22C55E" }}>
                  <span className="material-symbols-outlined text-[16px]">meeting_room</span>
                  Open Waiting Room
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-6">
            {/* ── Left Column: Code + Link + Details ── */}
            <div className="col-span-3 flex flex-col gap-5">

              {/* Session Code Card */}
              <div className="rounded-xl border border-border-subtle bg-bg-surface/40 overflow-hidden"
                style={{ backdropFilter: "blur(8px)", animation: "slideUp 0.4s ease-out 0.05s both" }}>
                <div className="px-5 py-3 border-b border-border-subtle/50 flex items-center gap-2 bg-bg-surface/30">
                  <span className="material-symbols-outlined text-[16px] text-accent-cyan">passkey</span>
                  <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">Session Code</span>
                </div>
                <div className="p-6 text-center">
                  <div className="font-mono text-[42px] font-bold text-accent-blue tracking-[0.35em] leading-none mb-4"
                    style={{ textShadow: "0 0 30px rgba(59,130,246,0.15)" }}>
                    {sessionCode}
                  </div>
                  <button
                    onClick={() => handleCopy(sessionCode, "code")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-mono font-semibold uppercase tracking-wider transition-all duration-200"
                    style={{
                      background: copied === "code" ? "rgba(34,197,94,0.08)" : "rgba(59,130,246,0.06)",
                      border: `1px solid ${copied === "code" ? "rgba(34,197,94,0.2)" : "rgba(59,130,246,0.15)"}`,
                      color: copied === "code" ? "#22C55E" : "#3B82F6",
                    }}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copied === "code" ? "check" : "content_copy"}
                    </span>
                    {copied === "code" ? "Copied!" : "Copy Code"}
                  </button>
                </div>
              </div>

              {/* Shareable Link Card */}
              <div className="rounded-xl border border-border-subtle bg-bg-surface/40 overflow-hidden"
                style={{ backdropFilter: "blur(8px)", animation: "slideUp 0.4s ease-out 0.1s both" }}>
                <div className="px-5 py-3 border-b border-border-subtle/50 flex items-center gap-2 bg-bg-surface/30">
                  <span className="material-symbols-outlined text-[16px] text-accent-cyan">link</span>
                  <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">Invite Link</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-2.5 rounded-lg bg-bg-base/50 border border-border-subtle/40 font-mono text-[12px] text-text-secondary/70 truncate">
                      {typeof window !== "undefined" ? `${window.location.origin}/join` : "sentinelzero.app/join"} (Code: {sessionCode})
                    </div>
                    <button
                      onClick={() => handleCopy(sessionCode, "link")}
                      className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                      style={{
                        background: copied === "link" ? "rgba(34,197,94,0.08)" : "rgba(59,130,246,0.06)",
                        border: `1px solid ${copied === "link" ? "rgba(34,197,94,0.2)" : "rgba(59,130,246,0.15)"}`,
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]"
                        style={{ color: copied === "link" ? "#22C55E" : "#3B82F6" }}>
                        {copied === "link" ? "check" : "content_copy"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Session Details Card */}
              <div className="rounded-xl border border-border-subtle bg-bg-surface/40 overflow-hidden"
                style={{ backdropFilter: "blur(8px)", animation: "slideUp 0.4s ease-out 0.15s both" }}>
                <div className="px-5 py-3 border-b border-border-subtle/50 flex items-center gap-2 bg-bg-surface/30">
                  <span className="material-symbols-outlined text-[16px] text-accent-cyan">info</span>
                  <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">Session Details</span>
                </div>
                <div className="p-5 grid grid-cols-2 gap-3">
                  {sessionDetails.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-bg-base/30 border border-border-subtle/30">
                      <span className="material-symbols-outlined text-[14px] text-text-secondary/30">{item.icon}</span>
                      <div>
                        <span className="text-[9px] text-text-secondary/40 uppercase font-mono tracking-wider block">{item.label}</span>
                        <span className="text-[12px] text-text-primary font-medium font-mono">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share Actions */}
              <div className="grid grid-cols-3 gap-3" style={{ animation: "slideUp 0.4s ease-out 0.2s both" }}>
                <button
                  onClick={() => handleCopy(`Session: ${sessionCode} | Title: ${sessionTitle}`, "all")}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[11px] font-mono font-semibold uppercase tracking-wider transition-all duration-200 border border-border-subtle bg-bg-surface/30 text-text-secondary/50 hover:border-accent-blue/20 hover:text-accent-blue"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied === "all" ? "check" : "copy_all"}
                  </span>
                  {copied === "all" ? "Copied!" : "Copy All"}
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[11px] font-mono font-semibold uppercase tracking-wider transition-all duration-200 border border-border-subtle bg-bg-surface/30 text-text-secondary/50 hover:border-accent-blue/20 hover:text-accent-blue">
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  Email Invite
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[11px] font-mono font-semibold uppercase tracking-wider transition-all duration-200 border border-border-subtle bg-bg-surface/30 text-text-secondary/50 hover:border-accent-blue/20 hover:text-accent-blue">
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Export PDF
                </button>
              </div>
            </div>

            {/* ── Right Column: QR Code ── */}
            <div className="col-span-2 flex flex-col gap-5">
              <div className="rounded-xl border border-border-subtle bg-bg-surface/40 overflow-hidden"
                style={{ backdropFilter: "blur(8px)", animation: "slideUp 0.4s ease-out 0.08s both" }}>
                <div className="px-5 py-3 border-b border-border-subtle/50 flex items-center gap-2 bg-bg-surface/30">
                  <span className="material-symbols-outlined text-[16px] text-accent-cyan">qr_code_2</span>
                  <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">QR Code</span>
                </div>
                <div className="p-6 flex flex-col items-center">
                  <div className="rounded-xl p-4 bg-white mb-4" style={{ boxShadow: "0 0 30px rgba(59,130,246,0.08)" }}>
                    <div className="w-[168px] h-[168px] grid grid-cols-[repeat(21,1fr)] grid-rows-[repeat(21,1fr)] gap-[1px]">
                      {qrGrid.map((filled, i) => (
                        <div key={i} className={`rounded-[1px] ${filled ? "bg-[#0A0A1E]" : "bg-white"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-text-secondary/50 font-mono text-center mb-1">
                    Scan to join session
                  </p>
                  <span className="text-[10px] text-text-secondary/30 font-mono">
                    Code: {sessionCode}
                  </span>
                </div>
              </div>

              {/* Quick Instructions */}
              <div className="rounded-xl border border-border-subtle bg-bg-surface/40 overflow-hidden"
                style={{ backdropFilter: "blur(8px)", animation: "slideUp 0.4s ease-out 0.12s both" }}>
                <div className="px-5 py-3 border-b border-border-subtle/50 flex items-center gap-2 bg-bg-surface/30">
                  <span className="material-symbols-outlined text-[16px] text-accent-cyan">help</span>
                  <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">Candidate Instructions</span>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { step: "1", text: "Open the Sentinel Zero join page" },
                    { step: "2", text: `Enter session code ${sessionCode}` },
                    { step: "3", text: "Complete system check & consent" },
                    { step: "4", text: "Wait in the lobby until session starts" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}>
                        <span className="text-[10px] font-mono font-bold text-accent-blue">{item.step}</span>
                      </div>
                      <span className="text-[12px] text-text-secondary/60 leading-relaxed">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border-subtle/30 bg-bg-base/30"
                style={{ animation: "slideUp 0.4s ease-out 0.18s both" }}>
                <span className="material-symbols-outlined text-[14px] text-accent-cyan/40">encrypted</span>
                <span className="text-[10px] text-text-secondary/30 font-mono">
                  All session data is end-to-end encrypted. Session codes expire when session ends.
                </span>
              </div>
            </div>
          </div>

        </main>
  );
}
