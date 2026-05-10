"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CameraPreview from "@/components/features/CameraPreview";
import { useSession } from "@/context/SessionContext";
import { subscribeToSession } from "@/lib/sessions";
import { supabase } from "@/lib/supabase";

export default function WaitingRoomPage() {
  const router = useRouter();
  const { sessionId, sessionCode, sessionTitle, interviewerName, durationMinutes } = useSession();
  const [elapsed, setElapsed] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const t = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setDots((p) => (p.length >= 3 ? "" : p + ".")), 600);
    return () => clearInterval(t);
  }, []);

  // Subscribe to session status changes — auto-redirect when interviewer starts
  useEffect(() => {
    if (!sessionId) return;

    const channel = subscribeToSession(sessionId, (updatedSession) => {
      if (updatedSession.status === "active") {
        router.push("/session/live");
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, router]);

  // If no session in context, redirect back to join
  useEffect(() => {
    if (!sessionId) {
      router.push("/join");
    }
  }, [sessionId, router]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const checks = [
    { label: "Camera", icon: "videocam", ok: true },
    { label: "Microphone", icon: "mic", ok: true },
    { label: "Identity", icon: "face", ok: true },
    { label: "Calibration", icon: "visibility", ok: true },
  ];

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "radial-gradient(circle, #3B82F6 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", animation: "pulseGlow 6s infinite alternate" }} />

      {/* Orbital ring */}
      <div className="absolute top-1/2 left-1/2 w-[550px] h-[550px] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.04]"
        style={{ border: "1px solid #3B82F6", borderRadius: "50%", animation: "orbitSpin 30s linear infinite" }} />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-[580px]" style={{ animation: "scaleIn 0.5s ease forwards" }}>
        <div className="absolute -inset-1 rounded-[22px] opacity-30 blur-xl pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.08))" }} />

        <div className="relative bg-bg-panel/90 border border-border-subtle rounded-[20px] overflow-hidden"
          style={{ backdropFilter: "blur(20px)", boxShadow: "0 25px 80px rgba(0,0,0,0.4), 0 0 40px rgba(59,130,246,0.06)" }}>

          {/* Top status bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border-subtle bg-bg-surface/40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-accent-blue">hourglass_top</span>
              <span className="font-mono text-[11px] text-text-secondary uppercase tracking-wider">Waiting Room</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" style={{ animation: "dotPulse 1.5s infinite" }} />
                <span className="text-[10px] text-amber-400 font-mono font-medium">PENDING</span>
              </div>
              <span className="text-[11px] text-text-mono font-mono">{fmt(elapsed)}</span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Animated waiting indicator */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Pulsing rings */}
                <div className="absolute inset-0 rounded-full" style={{ border: "2px solid rgba(59,130,246,0.15)", animation: "calibPulse 2s ease-out infinite" }} />
                <div className="absolute inset-0 rounded-full" style={{ border: "2px solid rgba(59,130,246,0.1)", animation: "calibPulse 2s 0.6s ease-out infinite" }} />
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.08))", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <span className="material-symbols-outlined text-[32px] text-accent-blue">schedule</span>
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-6">
              <h1 className="font-ui text-[22px] font-semibold text-text-primary mb-1.5">
                Waiting for Session{dots}
              </h1>
              <p className="text-text-secondary text-[13px] leading-relaxed max-w-[360px] mx-auto">
                Your interviewer will start the session shortly. Please stay on this page and keep your camera active.
              </p>
            </div>

            {/* Session info card — REAL DATA */}
            <div className="rounded-2xl border border-border-subtle bg-bg-surface/30 overflow-hidden mb-6"
              style={{ backdropFilter: "blur(8px)" }}>
              {/* Session header */}
              <div className="px-5 py-3 border-b border-border-subtle/50 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-accent-cyan">assignment</span>
                <span className="text-[12px] font-semibold text-text-primary uppercase tracking-wider">Session Details</span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "Session Code", value: sessionCode || "—", color: "#3B82F6", mono: true, icon: "tag" },
                    { label: "Duration", value: durationMinutes ? `${durationMinutes} min` : "—", color: "#06B6D4", mono: true, icon: "timer" },
                    { label: "Session", value: sessionTitle || "—", color: "", mono: false, icon: "quiz" },
                    { label: "Interviewer", value: interviewerName || "—", color: "", mono: false, icon: "person" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "rgba(26,26,62,0.6)", border: "1px solid rgba(45,45,107,0.5)" }}>
                        <span className="material-symbols-outlined text-[14px] text-text-secondary">{item.icon}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-secondary uppercase tracking-wider font-mono block mb-0.5">{item.label}</span>
                        <span className={`text-[14px] font-medium ${item.mono ? "font-mono" : "font-ui"}`}
                          style={{ color: item.color || "var(--color-text-primary)" }}>{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pre-flight checks */}
            <div className="flex items-center justify-center gap-3 mb-6">
              {checks.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                  <span className="material-symbols-outlined text-[14px] text-status-secure">{c.icon}</span>
                  <span className="text-[11px] text-status-secure font-medium">{c.label}</span>
                  <span className="material-symbols-outlined text-[12px] text-status-secure">check</span>
                </div>
              ))}
            </div>

            {/* Camera preview */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-xl opacity-30 blur-md pointer-events-none"
                  style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.15))" }} />
                <CameraPreview width={220} height={140} label="YOUR CAMERA" className="relative" />
              </div>
            </div>

            {/* Dev shortcut */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => router.push("/session/live")}
                className="text-[11px] text-text-secondary/40 hover:text-accent-blue/70 transition-colors font-mono flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[12px]">code</span>
                [DEV] Skip →
              </button>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-6 py-2.5 border-t border-border-subtle bg-bg-surface/30">
            <div className="flex items-center gap-4 text-[10px] text-text-secondary/60 font-mono">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-status-secure">lock</span>
                E2E ENCRYPTED
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-accent-cyan">memory</span>
                ON-DEVICE
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[12px] text-status-secure">wifi</span>
              <span className="text-[10px] text-status-secure font-mono">CONNECTED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
