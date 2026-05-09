"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CameraPreview from "@/components/features/CameraPreview";
import GradientButton from "@/components/ui/GradientButton";
import {
  Camera,
  Mic,
  Globe,
  Wifi,
  CheckCircle2,
  ArrowRight,
  Loader2,
  CircleDot,
  Info,
} from "lucide-react";

interface SystemCheck {
  icon: React.ReactNode;
  matIcon: string;
  label: string;
  key: string;
  desc: string;
  successMsg: string;
  color: string;
}

const systemChecks: SystemCheck[] = [
  {
    icon: <Globe size={18} />,
    matIcon: "language",
    label: "Browser Compatibility",
    key: "browser",
    desc: "Checking WebRTC & MediaDevices APIs",
    successMsg: "Secure environment verified",
    color: "#3B82F6",
  },
  {
    icon: <Wifi size={18} />,
    matIcon: "wifi",
    label: "Network Connection",
    key: "network",
    desc: "Testing latency & bandwidth",
    successMsg: "Low latency confirmed (<45ms)",
    color: "#06B6D4",
  },
  {
    icon: <Mic size={18} />,
    matIcon: "mic",
    label: "Microphone Access",
    key: "mic",
    desc: "Requesting audio hardware access",
    successMsg: "Audio input hardware verified",
    color: "#8B5CF6",
  },
  {
    icon: <Camera size={18} />,
    matIcon: "videocam",
    label: "Camera Access",
    key: "camera",
    desc: "Requesting video hardware access",
    successMsg: "720p+ camera detected",
    color: "#22C55E",
  },
];

const requirements = [
  { label: "Chrome 98+ or Firefox 100+", icon: "web" },
  { label: "WebRTC and MediaDevices API", icon: "api" },
  { label: "Stable connection (>5 Mbps)", icon: "speed" },
  { label: "Webcam with 720p+ resolution", icon: "camera" },
];

export default function SystemCheckPage() {
  const router = useRouter();
  const [checks, setChecks] = useState<Record<string, "pending" | "checking" | "done">>({
    browser: "pending",
    network: "pending",
    mic: "pending",
    camera: "pending",
  });
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

  // Progressive checks with checking -> done states
  useEffect(() => {
    const keys = ["browser", "network", "mic", "camera"];
    keys.forEach((key, i) => {
      // Start checking
      setTimeout(() => {
        setChecks((prev) => ({ ...prev, [key]: "checking" }));
      }, 300 + i * 900);
      // Complete check
      setTimeout(() => {
        setChecks((prev) => ({ ...prev, [key]: "done" }));
      }, 300 + i * 900 + 700);
    });
  }, []);

  const allReady = Object.values(checks).every((v) => v === "done");
  const completedCount = Object.values(checks).filter((v) => v === "done").length;
  const progress = (completedCount / systemChecks.length) * 100;

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
            "radial-gradient(circle, rgba(6, 182, 212, 0.05) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(59, 130, 246, 0.02) 1px, transparent 1px)",
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
            "0 0 80px rgba(59, 130, 246, 0.06), 0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* ── LEFT: Diagnostic Visualization Panel ── */}
        <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden border-r border-border-subtle/50 p-10">
          {/* Gradient BG */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "linear-gradient(160deg, rgba(59, 130, 246, 0.06) 0%, rgba(6, 182, 212, 0.04) 50%, rgba(4, 4, 15, 0.95) 100%)",
            }}
          />

          {/* Particle field */}
          <div className="absolute inset-0 z-[1] overflow-hidden">
            {dots.map((d, i) => (
              <div
                key={i}
                className="absolute w-[2px] h-[2px] rounded-full bg-accent-cyan/40"
                style={{
                  left: `${d.x}%`,
                  top: `${d.y}%`,
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
                "linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.25), transparent)",
              animation: "authScanLine 6s ease-in-out infinite",
            }}
          />

          {/* Central orb */}
          <div
            className="absolute z-[1] w-[280px] h-[280px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)",
              animation: "authOrbPulse 5s ease-in-out infinite",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center gap-6 w-full">
            {/* Camera preview */}
            <div className="syscheck-camera-wrapper">
              <CameraPreview
                width={280}
                height={175}
                showOverlay={checks.camera === "done"}
                label={checks.camera === "done" ? "AI PREVIEW ACTIVE" : "INITIALIZING..."}
                className="!rounded-xl"
              />
              {/* Corner brackets for camera */}
              <div className="syscheck-corner syscheck-corner-tl" />
              <div className="syscheck-corner syscheck-corner-tr" />
              <div className="syscheck-corner syscheck-corner-bl" />
              <div className="syscheck-corner syscheck-corner-br" />
            </div>

            {/* Status text */}
            <div>
              <h2 className="font-brand text-[18px] tracking-[0.2em] text-text-primary mb-2 uppercase">
                {allReady ? "Systems Ready" : "Diagnosing..."}
              </h2>
              <p className="text-text-secondary/60 text-[12px] font-ui">
                {allReady
                  ? "All hardware checks passed successfully"
                  : "Running pre-session diagnostics"}
              </p>
            </div>

            {/* Circular progress */}
            <div className="relative w-[100px] h-[100px]">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="rgba(26, 26, 62, 0.5)"
                  strokeWidth="4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={allReady ? "#22C55E" : "#06B6D4"}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                  style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="font-mono font-bold text-[24px] transition-colors duration-300"
                  style={{ color: allReady ? "#22C55E" : "#06B6D4" }}
                >
                  {completedCount}/{systemChecks.length}
                </span>
                <span className="text-[9px] text-text-secondary/50 font-mono uppercase tracking-wider">
                  Checks
                </span>
              </div>
            </div>

            {/* Requirements list */}
            <div className="w-full max-w-[280px]">
              <span className="text-[10px] font-mono text-text-secondary/40 uppercase tracking-widest block mb-2">
                Requirements
              </span>
              <div className="flex flex-col gap-1.5">
                {requirements.map((req) => (
                  <div
                    key={req.label}
                    className="flex items-center gap-2 text-[11px] text-text-secondary/50"
                  >
                    <span
                      className="material-symbols-outlined text-accent-blue/30"
                      style={{ fontSize: "14px" }}
                    >
                      {req.icon}
                    </span>
                    {req.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Diagnostic Results Panel ── */}
        <div className="relative flex flex-col justify-center p-8 sm:p-10 lg:p-12">
          {/* Mobile-only camera */}
          <div className="lg:hidden flex justify-center mb-6">
            <CameraPreview
              width={280}
              height={175}
              showOverlay={checks.camera === "done"}
              label={checks.camera === "done" ? "AI PREVIEW ACTIVE" : "INITIALIZING..."}
            />
          </div>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  allReady ? "bg-status-secure" : "bg-accent-cyan animate-pulse"
                }`}
              />
              <span
                className={`text-[11px] font-mono uppercase tracking-wider font-bold transition-colors duration-300 ${
                  allReady ? "text-status-secure" : "text-accent-cyan"
                }`}
              >
                {allReady ? "All Systems Go" : "Pre-Proctoring Diagnostic"}
              </span>
            </div>
            <h1 className="text-[22px] font-semibold text-text-primary font-ui mb-2">
              System Readiness Check
            </h1>
            <p className="text-text-secondary text-[13px] font-ui leading-relaxed">
              Verifying hardware and environment compatibility for your proctored session.
            </p>
          </div>

          {/* Global progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-text-secondary/60 uppercase tracking-wider">
                Overall Progress
              </span>
              <span
                className="text-[11px] font-mono font-bold transition-colors duration-300"
                style={{ color: allReady ? "#22C55E" : "#06B6D4" }}
              >
                {completedCount}/{systemChecks.length} passed
              </span>
            </div>
            <div className="w-full h-[4px] rounded-full bg-border-subtle/50 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progress}%`,
                  background: allReady
                    ? "linear-gradient(90deg, #22C55E, #16A34A)"
                    : "linear-gradient(90deg, #3B82F6, #06B6D4)",
                }}
              />
            </div>
          </div>

          {/* Check Items */}
          <div className="flex flex-col gap-3 mb-6">
            {systemChecks.map((check) => {
              const status = checks[check.key];
              return (
                <div key={check.key} className="syscheck-card">
                  <div className="flex items-center gap-4 w-full">
                    {/* Icon container */}
                    <div
                      className="syscheck-icon-box"
                      style={{
                        borderColor:
                          status === "done"
                            ? `${check.color}30`
                            : "rgba(26, 26, 62, 0.6)",
                        background:
                          status === "done"
                            ? `${check.color}08`
                            : "rgba(10, 10, 30, 0.4)",
                      }}
                    >
                      {status === "done" ? (
                        <CheckCircle2 size={18} style={{ color: check.color }} />
                      ) : status === "checking" ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                          style={{ color: check.color }}
                        />
                      ) : (
                        <span
                          className="material-symbols-outlined text-text-secondary/30"
                          style={{ fontSize: "18px" }}
                        >
                          {check.matIcon}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[13px] font-semibold transition-colors duration-300 ${
                          status === "done"
                            ? "text-text-primary"
                            : "text-text-secondary/70"
                        }`}
                      >
                        {check.label}
                      </div>
                      <p
                        className={`text-[11px] mt-0.5 transition-colors duration-300 ${
                          status === "done"
                            ? "text-text-secondary/60"
                            : "text-text-secondary/40"
                        }`}
                      >
                        {status === "done"
                          ? check.successMsg
                          : status === "checking"
                          ? check.desc
                          : "Waiting..."}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div className="shrink-0">
                      {status === "done" ? (
                        <span className="syscheck-badge-ready">
                          <CheckCircle2 size={10} />
                          READY
                        </span>
                      ) : status === "checking" ? (
                        <span className="syscheck-badge-checking">
                          <CircleDot size={10} />
                          CHECKING
                        </span>
                      ) : (
                        <span className="syscheck-badge-pending">
                          PENDING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Inline progress bar per check */}
                  <div className="mt-3 w-full h-[2px] rounded-full bg-border-subtle/30 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width:
                          status === "done"
                            ? "100%"
                            : status === "checking"
                            ? "60%"
                            : "0%",
                        background: check.color,
                        opacity: status === "pending" ? 0 : 0.6,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info banner */}
          <div className="syscheck-info-banner mb-6">
            <Info size={14} className="text-accent-blue/60 shrink-0 mt-0.5" />
            <p className="text-[11px] text-text-secondary/50 leading-relaxed">
              All diagnostics run locally in your browser. If a check fails, please ensure
              you&apos;ve granted the necessary permissions and try refreshing the page.
            </p>
          </div>

          {/* CTA */}
          <GradientButton
            onClick={() => router.push("/waiting-room")}
            disabled={!allReady}
          >
            {allReady ? (
              <>
                <CheckCircle2 size={16} />
                ALL SYSTEMS READY — PROCEED
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                <Loader2 size={16} className="animate-spin" />
                RUNNING DIAGNOSTICS…
              </>
            )}
          </GradientButton>

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
