"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import GradientButton from "@/components/ui/GradientButton";
import {
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Eye,
  Crosshair,
  Target,
} from "lucide-react";

/* 9-point calibration grid (3x3) */
const points = [
  { row: 0, col: 0 },
  { row: 0, col: 1 },
  { row: 0, col: 2 },
  { row: 1, col: 0 },
  { row: 1, col: 1 },
  { row: 1, col: 2 },
  { row: 2, col: 0 },
  { row: 2, col: 1 },
  { row: 2, col: 2 },
];

/* Step phases for the UI */
type Phase = "intro" | "calibrating" | "complete";

export default function CalibrationPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [activePoint, setActivePoint] = useState(-1);
  const [calibrated, setCalibrated] = useState<boolean[]>(
    new Array(9).fill(false)
  );
  const [accuracy, setAccuracy] = useState(0);
  const [dots, setDots] = useState<{ x: number; y: number; d: number }[]>([]);

  useEffect(() => {
    setDots(
      Array.from({ length: 25 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        d: Math.random() * 4,
      }))
    );
  }, []);

  const startCalibration = useCallback(() => {
    setPhase("calibrating");
    setActivePoint(-1);
    setCalibrated(new Array(9).fill(false));
    setAccuracy(0);

    let step = 0;
    const timer = setInterval(() => {
      if (step >= 9) {
        setPhase("complete");
        setAccuracy(96);
        clearInterval(timer);
        return;
      }
      setActivePoint(step);
      setCalibrated((prev) => {
        const next = [...prev];
        next[step] = true;
        return next;
      });
      setAccuracy(Math.round(((step + 1) / 9) * 96));
      step++;
    }, 700);

    return () => clearInterval(timer);
  }, []);

  // Auto-start after a brief intro
  useEffect(() => {
    const t = setTimeout(() => startCalibration(), 2000);
    return () => clearTimeout(t);
  }, [startCalibration]);

  const completedCount = calibrated.filter(Boolean).length;
  const progress = (completedCount / 9) * 100;

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="auth-glow" />
      <div
        className="auth-glow"
        style={{
          animationDelay: "2s",
          opacity: 0.1,
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(139, 92, 246, 0.02) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Main Card */}
      <div
        className="relative z-10 w-full max-w-[1020px] grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] overflow-hidden rounded-[20px] border border-border-active/60 animate-fade-in"
        style={{
          background: "rgba(10, 10, 30, 0.7)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          boxShadow:
            "0 0 80px rgba(139, 92, 246, 0.04), 0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* ── LEFT: Calibration Visualization Panel ── */}
        <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden border-r border-border-subtle/50 p-10">
          {/* Gradient BG */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "linear-gradient(160deg, rgba(139, 92, 246, 0.06) 0%, rgba(59, 130, 246, 0.04) 50%, rgba(4, 4, 15, 0.95) 100%)",
            }}
          />

          {/* Particle field */}
          <div className="absolute inset-0 z-[1] overflow-hidden">
            {dots.map((d, i) => (
              <div
                key={i}
                className="absolute w-[2px] h-[2px] rounded-full"
                style={{
                  left: `${d.x}%`,
                  top: `${d.y}%`,
                  backgroundColor: "rgba(139, 92, 246, 0.4)",
                  animation: `authDotPulse 3s ${d.d}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>

          {/* Scanning line */}
          <div
            className="absolute left-0 right-0 h-[1px] z-[2]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.2), transparent)",
              animation: "authScanLine 6s ease-in-out infinite",
            }}
          />

          {/* Central orb */}
          <div
            className="absolute z-[1] w-[280px] h-[280px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
              animation: "authOrbPulse 5s ease-in-out infinite",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center gap-6 w-full">
            {/* Eye tracking icon */}
            <div className="calib-eye-container">
              <div className="calib-eye-ring" />
              <div className="calib-eye-icon">
                <Eye size={30} className="text-purple-400" />
              </div>
            </div>

            {/* Title */}
            <div>
              <h2 className="font-brand text-[18px] tracking-[0.2em] text-text-primary mb-2 uppercase">
                Gaze Calibration
              </h2>
              <p className="text-text-secondary/60 text-[12px] font-ui leading-relaxed max-w-[260px]">
                {phase === "intro"
                  ? "Preparing eye-tracking calibration system"
                  : phase === "calibrating"
                  ? "Follow each dot with your eyes — keep your head still"
                  : "Calibration complete with excellent accuracy"}
              </p>
            </div>

            {/* Accuracy gauge */}
            <div className="relative w-[120px] h-[120px]">
              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="rgba(26, 26, 62, 0.5)"
                  strokeWidth="5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={
                    phase === "complete"
                      ? "#22C55E"
                      : accuracy > 60
                      ? "#8B5CF6"
                      : "#3B82F6"
                  }
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 42 * (1 - accuracy / 100)
                  }`}
                  style={{
                    transition:
                      "stroke-dashoffset 0.5s ease, stroke 0.3s ease",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="font-mono font-bold text-[28px] transition-colors duration-300"
                  style={{
                    color:
                      phase === "complete"
                        ? "#22C55E"
                        : accuracy > 60
                        ? "#8B5CF6"
                        : "#3B82F6",
                  }}
                >
                  {accuracy}%
                </span>
                <span className="text-[9px] text-text-secondary/50 font-mono uppercase tracking-wider">
                  Accuracy
                </span>
              </div>
            </div>

            {/* Step info */}
            <div className="flex flex-col gap-3 w-full max-w-[260px]">
              {[
                {
                  icon: "visibility",
                  label: "Follow the active dot",
                  done: phase !== "intro",
                },
                {
                  icon: "center_focus_strong",
                  label: "Keep head still during scan",
                  done: completedCount >= 5,
                },
                {
                  icon: "check_circle",
                  label: "9-point grid verification",
                  done: phase === "complete",
                },
              ].map((step) => (
                <div
                  key={step.label}
                  className="flex items-center gap-3 text-[11px]"
                >
                  <span
                    className={`material-symbols-outlined transition-colors duration-300 ${
                      step.done ? "text-purple-400" : "text-text-secondary/30"
                    }`}
                    style={{ fontSize: "16px" }}
                  >
                    {step.icon}
                  </span>
                  <span
                    className={`transition-colors duration-300 ${
                      step.done
                        ? "text-text-secondary/70"
                        : "text-text-secondary/40"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Calibration Grid Panel ── */}
        <div className="relative flex flex-col justify-center p-8 sm:p-10 lg:p-12">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  phase === "complete"
                    ? "bg-status-secure"
                    : "bg-purple-400 animate-pulse"
                }`}
              />
              <span
                className={`text-[11px] font-mono uppercase tracking-wider font-bold transition-colors duration-300 ${
                  phase === "complete"
                    ? "text-status-secure"
                    : "text-purple-400"
                }`}
              >
                {phase === "intro"
                  ? "Initializing"
                  : phase === "calibrating"
                  ? `Calibrating — Point ${Math.min(completedCount + 1, 9)} of 9`
                  : "Calibration Successful"}
              </span>
            </div>
            <h1 className="text-[22px] font-semibold text-text-primary font-ui mb-2">
              Eye-Gaze Calibration
            </h1>
            <p className="text-text-secondary text-[13px] font-ui leading-relaxed">
              Focus on each highlighted point as it appears. This calibrates the
              gaze-tracking model for your session.
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-text-secondary/60 uppercase tracking-wider">
                Calibration Progress
              </span>
              <span
                className="text-[11px] font-mono font-bold transition-colors duration-300"
                style={{
                  color:
                    phase === "complete"
                      ? "#22C55E"
                      : "#8B5CF6",
                }}
              >
                {completedCount}/9 points
              </span>
            </div>
            <div className="w-full h-[4px] rounded-full bg-border-subtle/50 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  background:
                    phase === "complete"
                      ? "linear-gradient(90deg, #22C55E, #16A34A)"
                      : "linear-gradient(90deg, #8B5CF6, #3B82F6)",
                }}
              />
            </div>
          </div>

          {/* 9-Point Calibration Grid */}
          <div className="calib-grid-container mb-6">
            {/* Corner brackets */}
            <div className="calib-corner calib-corner-tl" />
            <div className="calib-corner calib-corner-tr" />
            <div className="calib-corner calib-corner-bl" />
            <div className="calib-corner calib-corner-br" />

            {/* Crosshair overlay lines */}
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute left-1/2 top-0 bottom-0 w-[1px]"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, rgba(139, 92, 246, 0.06), transparent)",
                }}
              />
              <div
                className="absolute top-1/2 left-0 right-0 h-[1px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.06), transparent)",
                }}
              />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-8 relative z-10">
              {points.map((_, i) => (
                <div key={i} className="flex items-center justify-center">
                  <div className="calib-point-wrapper">
                    {/* Outer pulse ring (active only) */}
                    {i === activePoint && phase === "calibrating" && (
                      <div className="calib-pulse-ring" />
                    )}

                    {/* Main dot */}
                    <div
                      className={`calib-dot ${
                        calibrated[i]
                          ? "calib-dot-done"
                          : i === activePoint
                          ? "calib-dot-active"
                          : "calib-dot-idle"
                      }`}
                    >
                      {calibrated[i] && (
                        <CheckCircle2
                          size={10}
                          className="text-white animate-fade-in"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Center label */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              <Crosshair
                size={12}
                className="text-text-secondary/30"
              />
              <span className="text-[10px] font-mono text-text-secondary/30 uppercase tracking-wider">
                {phase === "calibrating"
                  ? "Tracking active"
                  : phase === "complete"
                  ? "Grid verified"
                  : "Initializing"}
              </span>
            </div>
          </div>

          {/* Accuracy display */}
          <div className="calib-accuracy-bar mb-6">
            <div className="flex items-center gap-3">
              <div
                className="calib-accuracy-icon"
                style={{
                  borderColor:
                    phase === "complete"
                      ? "rgba(34, 197, 94, 0.2)"
                      : "rgba(139, 92, 246, 0.2)",
                  background:
                    phase === "complete"
                      ? "rgba(34, 197, 94, 0.06)"
                      : "rgba(139, 92, 246, 0.06)",
                }}
              >
                <Target
                  size={18}
                  style={{
                    color:
                      phase === "complete" ? "#22C55E" : "#8B5CF6",
                  }}
                />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-text-secondary/60 uppercase tracking-wider">
                  Calibration Accuracy
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-mono text-[28px] font-bold transition-colors duration-300"
                    style={{
                      color:
                        phase === "complete"
                          ? "#22C55E"
                          : accuracy > 60
                          ? "#8B5CF6"
                          : "#3B82F6",
                    }}
                  >
                    {accuracy}%
                  </span>
                  {phase === "complete" && (
                    <span className="text-[10px] font-mono text-status-secure font-bold uppercase tracking-wider animate-fade-in">
                      Excellent
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mini segmented bar */}
            <div className="flex gap-1 mt-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[3px] flex-1 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor:
                      i < Math.round((accuracy / 100) * 12)
                        ? phase === "complete"
                          ? "#22C55E"
                          : "#8B5CF6"
                        : "rgba(26, 26, 62, 0.5)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          {phase === "complete" ? (
            <div className="flex gap-3 animate-fade-in">
              <button
                onClick={() => {
                  setPhase("intro");
                  setTimeout(() => startCalibration(), 500);
                }}
                className="auth-btn-ghost flex-1 flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} />
                RECALIBRATE
              </button>
              <GradientButton
                onClick={() => router.push("/waiting-room")}
                fullWidth={false}
                className="flex-1"
              >
                ENTER WAITING ROOM
                <ArrowRight size={16} />
              </GradientButton>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 py-4">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[12px] text-text-secondary/60 font-ui">
                {phase === "intro"
                  ? "Initializing eye-tracker…"
                  : "Collecting gaze samples — keep eyes on the active point"}
              </span>
            </div>
          )}

          {/* Bottom badge */}
          <div className="flex items-center justify-center gap-2 mt-6 text-text-secondary/40 text-[11px] font-mono">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "13px" }}
            >
              encrypted
            </span>
            256-bit TLS encrypted session
          </div>
        </div>
      </div>

      {/* Bottom attribution */}
      <div className="absolute bottom-4 text-center w-full z-10">
        <p className="text-text-secondary/30 text-[11px] font-ui">
          © {new Date().getFullYear()} Sentinel Zero · All rights reserved
        </p>
      </div>
    </div>
  );
}
