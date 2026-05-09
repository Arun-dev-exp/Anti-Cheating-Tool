"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import GradientButton from "@/components/ui/GradientButton";

const steps = [
  { instruction: "Look straight at the camera", icon: "face", hint: "Keep your face centered in the frame" },
  { instruction: "Slowly turn your head left", icon: "arrow_back", hint: "Turn about 30° and hold briefly" },
  { instruction: "Slowly turn your head right", icon: "arrow_forward", hint: "Turn about 30° and hold briefly" },
  { instruction: "Blink naturally", icon: "visibility", hint: "Blink 2-3 times at normal pace" },
];

export default function LivenessPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [verified, setVerified] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Timer
  useEffect(() => {
    if (verified) return;
    const t = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, [verified]);

  // Simulate step progression
  useEffect(() => {
    if (verified) return;
    const timer = setInterval(() => {
      setConfidence((prev) => {
        if (prev >= 95) {
          if (currentStep < steps.length - 1) {
            setCurrentStep((s) => s + 1);
            return 0;
          } else {
            setVerified(true);
            clearInterval(timer);
            return 100;
          }
        }
        return prev + Math.random() * 8;
      });
    }, 200);
    return () => clearInterval(timer);
  }, [currentStep, verified]);

  const confDisplay = Math.min(Math.round(confidence), 100);
  const safeStep = steps[Math.min(currentStep, steps.length - 1)];
  const fmt = useCallback((s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`, []);

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "radial-gradient(circle, #3B82F6 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", animation: "pulseGlow 6s infinite alternate" }} />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-[600px]" style={{ animation: "scaleIn 0.5s ease forwards" }}>
        <div className="absolute -inset-1 rounded-[22px] opacity-30 blur-xl pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.08))" }} />

        <div className="relative bg-bg-panel/90 border border-border-subtle rounded-[20px] overflow-hidden"
          style={{ backdropFilter: "blur(20px)", boxShadow: "0 25px 80px rgba(0,0,0,0.4), 0 0 40px rgba(59,130,246,0.06)" }}>

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border-subtle bg-bg-surface/40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-accent-blue">verified_user</span>
              <span className="font-mono text-[11px] text-text-secondary uppercase tracking-wider">Liveness Verification</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-status-breach" style={{ animation: "dotPulse 1.5s infinite" }} />
                <span className="text-[10px] text-text-secondary font-mono">REC</span>
              </div>
              <span className="text-[11px] text-text-mono font-mono">{fmt(elapsed)}</span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Camera Feed */}
            <div className="relative mx-auto mb-6 rounded-2xl overflow-hidden border border-border-subtle"
              style={{ aspectRatio: "4/3", maxWidth: "440px", boxShadow: "inset 0 0 60px rgba(0,0,0,0.3)" }}>
              <div className="absolute inset-0 bg-bg-base flex items-center justify-center">
                {/* Face silhouette */}
                <svg width="140" height="140" viewBox="0 0 140 140" className="opacity-20">
                  <circle cx="70" cy="50" r="32" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 3" />
                  <ellipse cx="70" cy="95" rx="38" ry="22" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 3" />
                </svg>
              </div>

              {/* Face detection frame */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative" style={{ width: "55%", height: "70%" }}>
                  {/* Corner brackets */}
                  {[
                    "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                    "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                    "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                    "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
                  ].map((cls, i) => (
                    <div key={i} className={`absolute w-6 h-6 ${cls} transition-colors duration-500`}
                      style={{ borderColor: verified ? "#22C55E" : "#3B82F6" }} />
                  ))}
                  {/* Scanning line */}
                  {!verified && (
                    <div className="absolute left-2 right-2 h-0.5 rounded-full"
                      style={{
                        background: "linear-gradient(90deg, transparent, #3B82F6, transparent)",
                        animation: "scanLine 2s ease-in-out infinite",
                      }} />
                  )}
                </div>
              </div>

              {/* Confidence bar at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-bg-base/50">
                <div className="h-full transition-all duration-300 rounded-r-full"
                  style={{
                    width: `${confDisplay}%`,
                    background: verified ? "#22C55E" : "linear-gradient(90deg, #3B82F6, #06B6D4)",
                  }} />
              </div>

              {/* Top-left confidence readout */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-bg-base/70 border border-border-subtle/50"
                style={{ backdropFilter: "blur(8px)" }}>
                <span className="text-[11px] font-mono" style={{ color: verified ? "#22C55E" : "#7DD3FC" }}>
                  {confDisplay}%
                </span>
              </div>

              {/* Verified overlay */}
              {verified && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg-base/40" style={{ animation: "fadeIn 0.5s ease" }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(34,197,94,0.15)", border: "2px solid #22C55E", boxShadow: "0 0 30px rgba(34,197,94,0.2)" }}>
                    <span className="material-symbols-outlined text-[32px] text-status-secure">check</span>
                  </div>
                </div>
              )}
            </div>

            {/* Step instruction */}
            <div className="text-center mb-6">
              {verified ? (
                <div style={{ animation: "revealUp 0.5s ease forwards" }}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[20px] text-status-secure">check_circle</span>
                    <span className="text-status-secure font-semibold text-[15px] uppercase tracking-wider">Identity Verified</span>
                  </div>
                  <p className="text-text-secondary text-[13px]">Liveness check passed successfully</p>
                </div>
              ) : (
                <div>
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                    style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                    <span className="material-symbols-outlined text-[22px] text-accent-blue">{safeStep.icon}</span>
                  </div>
                  <p className="text-text-primary font-semibold text-[16px] mb-1">{safeStep.instruction}</p>
                  <p className="text-text-secondary text-[12px]">{safeStep.hint}</p>
                </div>
              )}
            </div>

            {/* Step progress */}
            <div className="flex items-center justify-center gap-1 mb-6">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    i < currentStep || verified
                      ? "border-status-secure bg-status-secure/10"
                      : i === currentStep && !verified
                      ? "border-accent-blue bg-accent-blue/10"
                      : "border-border-subtle bg-transparent"
                  }`}>
                    {i < currentStep || verified ? (
                      <span className="material-symbols-outlined text-[14px] text-status-secure">check</span>
                    ) : (
                      <span className={`font-mono text-[11px] font-bold ${i === currentStep ? "text-accent-blue" : "text-text-secondary/50"}`}>{i + 1}</span>
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-8 h-0.5 mx-0.5 rounded-full transition-all duration-500"
                      style={{ backgroundColor: i < currentStep || verified ? "#22C55E" : "rgba(26,26,62,0.8)" }} />
                  )}
                </div>
              ))}
            </div>

            {/* Continue button */}
            {verified && (
              <div style={{ animation: "revealUp 0.5s ease forwards" }}>
                <GradientButton onClick={() => router.push("/calibration")}>
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    CONTINUE TO CALIBRATION
                  </span>
                </GradientButton>
              </div>
            )}
          </div>

          {/* Bottom status bar */}
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
            <span className="text-[10px] text-text-secondary/40 font-mono">
              STEP {verified ? steps.length : currentStep + 1}/{steps.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
