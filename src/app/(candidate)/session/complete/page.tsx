"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import IntegrityGauge from "@/components/ui/IntegrityGauge";
import GradientButton from "@/components/ui/GradientButton";
import {
  CheckCircle2,
  Download,
  ArrowRight,
  ShieldCheck,
  Clock,
  Hash,
  CalendarDays,
  Keyboard,
  Eye,
  Monitor,
  ScanFace,
  Wifi,
  ChevronRight,
} from "lucide-react";

interface RiskFactor {
  label: string;
  key: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const riskFactors: RiskFactor[] = [
  {
    label: "Keystroke Dynamics",
    key: "keystroke",
    value: 10,
    icon: <Keyboard size={16} />,
    color: "#22C55E",
  },
  {
    label: "Gaze Tracking",
    key: "gaze",
    value: 14,
    icon: <Eye size={16} />,
    color: "#F59E0B",
  },
  {
    label: "Process Monitor",
    key: "process",
    value: 6,
    icon: <Monitor size={16} />,
    color: "#22C55E",
  },
  {
    label: "Liveness Detection",
    key: "liveness",
    value: 4,
    icon: <ScanFace size={16} />,
    color: "#22C55E",
  },
  {
    label: "Network Monitor",
    key: "network",
    value: 2,
    icon: <Wifi size={16} />,
    color: "#22C55E",
  },
];

const sessionStats = [
  { label: "Duration", value: "01:58:24", icon: <Clock size={14} /> },
  { label: "Session ID", value: "SZ-8821", icon: <Hash size={14} /> },
  { label: "Date", value: "May 9, 2026", icon: <CalendarDays size={14} /> },
];

export default function SessionCompletePage() {
  const router = useRouter();
  const score = 87;
  const [dots, setDots] = useState<{ x: number; y: number; d: number }[]>([]);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setDots(
      Array.from({ length: 25 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        d: Math.random() * 4,
      }))
    );
    // Stagger content reveal
    setTimeout(() => setShowContent(true), 300);
  }, []);

  const getRiskColor = (value: number) =>
    value > 65 ? "#EF4444" : value >= 35 ? "#F59E0B" : "#22C55E";

  const getRiskLabel = (value: number) =>
    value > 65 ? "HIGH" : value >= 35 ? "MEDIUM" : "LOW";

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
            "radial-gradient(circle, rgba(34, 197, 94, 0.05) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(34, 197, 94, 0.02) 1px, transparent 1px)",
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
            "0 0 80px rgba(34, 197, 94, 0.04), 0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* ── LEFT: Score Visualization Panel ── */}
        <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden border-r border-border-subtle/50 p-10">
          {/* Gradient BG */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "linear-gradient(160deg, rgba(34, 197, 94, 0.06) 0%, rgba(59, 130, 246, 0.04) 50%, rgba(4, 4, 15, 0.95) 100%)",
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
                  backgroundColor: "rgba(34, 197, 94, 0.4)",
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
                "linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.2), transparent)",
              animation: "authScanLine 6s ease-in-out infinite",
            }}
          />

          {/* Central orb */}
          <div
            className="absolute z-[1] w-[280px] h-[280px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%)",
              animation: "authOrbPulse 5s ease-in-out infinite",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center gap-5 w-full">
            {/* Shield icon */}
            <div className="consent-shield-container">
              <div className="consent-shield-ring" />
              <div className="consent-shield-icon">
                <ShieldCheck size={28} className="text-green-400" />
              </div>
            </div>

            {/* Title */}
            <div>
              <h2 className="font-brand text-[18px] tracking-[0.2em] text-text-primary mb-2 uppercase">
                Session Complete
              </h2>
              <p className="text-text-secondary/60 text-[12px] font-ui leading-relaxed max-w-[260px]">
                Your proctored session has ended successfully with high integrity
              </p>
            </div>

            {/* Integrity Gauge */}
            <div className="my-2">
              <IntegrityGauge score={score} size={160} strokeWidth={8} />
            </div>

            {/* Session stats */}
            <div className="flex flex-col gap-2.5 w-full max-w-[260px]">
              {sessionStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between text-[11px]"
                >
                  <div className="flex items-center gap-2 text-text-secondary/40">
                    {stat.icon}
                    {stat.label}
                  </div>
                  <span className="font-mono text-text-secondary/70">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Results Panel ── */}
        <div className="relative flex flex-col justify-center p-8 sm:p-10 lg:p-12">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-status-secure" />
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-status-secure">
                Proctoring Complete
              </span>
            </div>
            <h1 className="text-[22px] font-semibold text-text-primary font-ui mb-2">
              Session Results
            </h1>
            <p className="text-text-secondary text-[13px] font-ui leading-relaxed">
              All behavioral monitoring modules have completed analysis. Here&apos;s your integrity report.
            </p>
          </div>

          {/* Mobile-only gauge */}
          <div className="lg:hidden flex justify-center mb-6">
            <IntegrityGauge score={score} size={140} strokeWidth={8} />
          </div>

          {/* Mobile session stats */}
          <div className="lg:hidden grid grid-cols-3 gap-3 mb-6">
            {sessionStats.map((stat) => (
              <div key={stat.label} className="complete-stat-card">
                <span className="text-text-secondary/40 mb-1">{stat.icon}</span>
                <span className="text-[10px] text-text-secondary/50 uppercase tracking-wider">
                  {stat.label}
                </span>
                <span className="font-mono text-[13px] text-text-primary">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Integrity Score summary bar */}
          <div
            className={`complete-score-banner mb-6 transition-all duration-500 ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="complete-score-icon">
                <CheckCircle2 size={20} className="text-green-400" />
              </div>
              <div>
                <div className="text-[11px] font-mono text-text-secondary/50 uppercase tracking-wider">
                  Overall Integrity Score
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[28px] font-bold text-status-secure">
                    {score}
                  </span>
                  <span className="text-[11px] text-text-secondary/40 font-ui">
                    / 100
                  </span>
                  <span className="text-[10px] font-mono text-status-secure font-bold uppercase tracking-wider ml-1">
                    Excellent
                  </span>
                </div>
              </div>
            </div>

            {/* Score bar */}
            <div className="flex gap-1 mt-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[3px] flex-1 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor:
                      i < Math.round((score / 100) * 12)
                        ? "#22C55E"
                        : "rgba(26, 26, 62, 0.5)",
                    transitionDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Risk Breakdown */}
          <div className="mb-6">
            <span className="text-[11px] font-mono text-text-secondary/50 uppercase tracking-widest block mb-3">
              Risk Breakdown by Module
            </span>
            <div className="flex flex-col gap-2.5">
              {riskFactors.map((risk, idx) => (
                <div
                  key={risk.key}
                  className={`complete-risk-card transition-all duration-400 ${
                    showContent
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  }`}
                  style={{ transitionDelay: `${200 + idx * 100}ms` }}
                >
                  <div className="flex items-center gap-3 w-full">
                    {/* Icon */}
                    <div
                      className="complete-risk-icon"
                      style={{
                        borderColor: `${getRiskColor(risk.value)}20`,
                        background: `${getRiskColor(risk.value)}08`,
                      }}
                    >
                      <span style={{ color: getRiskColor(risk.value) }}>
                        {risk.icon}
                      </span>
                    </div>

                    {/* Label & bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] font-semibold text-text-primary">
                          {risk.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-mono font-bold uppercase tracking-wider"
                            style={{ color: getRiskColor(risk.value) }}
                          >
                            {getRiskLabel(risk.value)}
                          </span>
                          <span
                            className="font-mono text-[12px] font-bold"
                            style={{ color: getRiskColor(risk.value) }}
                          >
                            {risk.value}%
                          </span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full h-[4px] rounded-full bg-border-subtle/40 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${risk.value}%`,
                            background: `linear-gradient(90deg, ${getRiskColor(
                              risk.value
                            )}60, ${getRiskColor(risk.value)})`,
                            transitionDelay: `${400 + idx * 100}ms`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data privacy notice */}
          <div className="complete-privacy-notice mb-6">
            <ShieldCheck size={14} className="text-green-500/60 shrink-0 mt-0.5" />
            <p className="text-[11px] text-text-secondary/50 leading-relaxed">
              All session data has been auto-purged from your device. Only encrypted integrity scores were transmitted.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {}}
              className="auth-btn-ghost flex-1 flex items-center justify-center gap-2"
            >
              <Download size={14} />
              DOWNLOAD REPORT
            </button>
            <GradientButton
              onClick={() => router.push("/")}
              fullWidth={false}
              className="flex-1"
            >
              RETURN HOME
              <ArrowRight size={16} />
            </GradientButton>
          </div>

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
