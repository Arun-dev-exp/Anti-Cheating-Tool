"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/ui/InputField";
import GradientButton from "@/components/ui/GradientButton";
import {
  Shield,
  Eye,
  Keyboard,
  Monitor,
  ArrowRight,
  Loader2,
  Lock,
  CheckCircle2,
  Fingerprint,
} from "lucide-react";

const monitoringModules = [
  {
    icon: <Keyboard size={20} />,
    matIcon: "keyboard",
    title: "Keystroke Dynamics",
    desc: "Typing rhythm and cadence pattern analysis",
    badge: "LOCAL ONLY",
    color: "#3B82F6",
  },
  {
    icon: <Eye size={20} />,
    matIcon: "visibility",
    title: "Gaze Tracking",
    desc: "Eye movement and focus zone monitoring",
    badge: "LOCAL ONLY",
    color: "#06B6D4",
  },
  {
    icon: <Monitor size={20} />,
    matIcon: "monitor",
    title: "Process Monitor",
    desc: "Active application and window detection",
    badge: "LOCAL ONLY",
    color: "#8B5CF6",
  },
  {
    icon: <Shield size={20} />,
    matIcon: "face",
    title: "Liveness Detection",
    desc: "Continuous face presence verification",
    badge: "LOCAL ONLY",
    color: "#22C55E",
  },
];

const privacyPoints = [
  {
    icon: "lock",
    title: "Zero Cloud Storage",
    desc: "No behavioral data is ever uploaded or stored on external servers.",
  },
  {
    icon: "encrypted",
    title: "End-to-End Encrypted",
    desc: "Only encrypted integrity scores leave your device — never raw data.",
  },
  {
    icon: "delete_forever",
    title: "Auto-Purge on Exit",
    desc: "All session data is permanently deleted when your exam ends.",
  },
];

/* Animated particle dot for the left panel */
function ConsentDot({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <div
      className="absolute w-[2px] h-[2px] rounded-full bg-status-secure/40"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animation: `authDotPulse 3s ${delay}s ease-in-out infinite`,
      }}
    />
  );
}

export default function ConsentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [consented, setConsented] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [dots, setDots] = useState<{ x: number; y: number; d: number }[]>([]);

  useEffect(() => {
    setDots(
      Array.from({ length: 30 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        d: Math.random() * 4,
      }))
    );
  }, []);

  const handleConsent = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/join");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      {/* Full-page background effects */}
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

      {/* Grid pattern */}
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
        className="relative z-10 w-full max-w-[1060px] grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] overflow-hidden rounded-[20px] border border-border-active/60 animate-fade-in"
        style={{
          background: "rgba(10, 10, 30, 0.7)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          boxShadow:
            "0 0 80px rgba(34, 197, 94, 0.04), 0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* ── LEFT: Security Visualization Panel ── */}
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
              <ConsentDot key={i} x={d.x} y={d.y} delay={d.d} />
            ))}
          </div>

          {/* Scanning line (green tint) */}
          <div
            className="absolute left-0 right-0 h-[1px] z-[2]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.2), transparent)",
              animation: "authScanLine 6s ease-in-out infinite",
            }}
          />

          {/* Central shield orb */}
          <div
            className="absolute z-[1] w-[300px] h-[300px] rounded-full"
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
          <div className="relative z-10 flex flex-col items-center text-center gap-6">
            {/* Animated shield */}
            <div className="consent-shield-container">
              <div className="consent-shield-ring" />
              <div className="consent-shield-icon">
                <Fingerprint size={32} className="text-status-secure" />
              </div>
            </div>

            {/* Header */}
            <div>
              <h2 className="font-brand text-[20px] tracking-[0.2em] text-text-primary mb-2 uppercase">
                Privacy First
              </h2>
              <p className="text-text-secondary/70 text-[13px] font-ui leading-relaxed max-w-[280px]">
                Your behavioral data never leaves this device. Here&apos;s exactly what we monitor and why.
              </p>
            </div>

            {/* Privacy assurance points */}
            <div className="flex flex-col gap-4 mt-2 w-full max-w-[300px]">
              {privacyPoints.map((point) => (
                <div
                  key={point.icon}
                  className="consent-privacy-point"
                >
                  <div className="consent-privacy-icon">
                    <span
                      className="material-symbols-outlined text-status-secure"
                      style={{ fontSize: "18px" }}
                    >
                      {point.icon}
                    </span>
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-[12px] font-semibold text-text-primary">
                      {point.title}
                    </div>
                    <div className="text-[11px] text-text-secondary/50 leading-relaxed mt-0.5">
                      {point.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Compliance badges */}
            <div className="flex items-center gap-3 mt-4">
              {["SOC 2", "GDPR", "FERPA"].map((badge) => (
                <div
                  key={badge}
                  className="px-3 py-1.5 rounded-full border border-status-secure/20 bg-status-secure/5 text-status-secure text-[10px] font-mono font-bold tracking-wider"
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Consent Form Panel ── */}
        <div className="relative flex flex-col justify-center p-8 sm:p-10 lg:p-12 overflow-y-auto max-h-screen lg:max-h-[90vh]">
          {/* Mobile-only header */}
          <div className="lg:hidden text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Fingerprint size={24} className="text-status-secure" />
              <span
                className="font-brand tracking-[0.2em] text-[18px] font-bold text-text-primary uppercase"
              >
                Privacy First
              </span>
            </div>
            <p className="text-text-secondary text-[12px] font-ui">
              Your data stays on your device
            </p>
          </div>

          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-status-secure animate-pulse" />
              <span className="text-[11px] font-mono text-status-secure uppercase tracking-wider font-bold">
                Consent Required
              </span>
            </div>
            <h1 className="text-[22px] font-semibold text-text-primary font-ui mb-2">
              Monitoring Disclosure
            </h1>
            <p className="text-text-secondary text-[13px] font-ui leading-relaxed">
              Review the behavioral signals monitored during your session before proceeding.
            </p>
          </div>

          {/* Privacy banner (mobile) */}
          <div className="lg:hidden consent-privacy-banner mb-5">
            <Lock size={16} className="text-status-secure shrink-0" />
            <div>
              <span className="text-[12px] font-semibold text-text-primary">
                100% Local Processing
              </span>
              <p className="text-[11px] text-text-secondary mt-0.5">
                All analysis runs in your browser. Only integrity scores are transmitted.
              </p>
            </div>
          </div>

          {/* Monitoring Modules */}
          <div className="mb-6">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary font-ui block mb-3">
              Monitoring Modules
            </span>
            <div className="grid grid-cols-1 gap-2.5">
              {monitoringModules.map((mod, idx) => (
                <button
                  key={mod.title}
                  type="button"
                  onClick={() =>
                    setExpandedModule(expandedModule === idx ? null : idx)
                  }
                  className="consent-module-card group text-left w-full"
                >
                  <div className="flex items-center gap-4 w-full">
                    {/* Icon */}
                    <div
                      className="consent-module-icon"
                      style={{
                        borderColor: `${mod.color}25`,
                        background: `${mod.color}08`,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "20px", color: mod.color }}
                      >
                        {mod.matIcon}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-text-primary group-hover:text-white transition-colors">
                        {mod.title}
                      </div>
                      <p className="text-[11px] text-text-secondary/60 mt-0.5 truncate">
                        {mod.desc}
                      </p>
                    </div>

                    {/* Badge + Chevron */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="consent-local-badge">
                        <Lock size={9} />
                        {mod.badge}
                      </span>
                      <span
                        className={`material-symbols-outlined text-text-secondary/30 transition-transform duration-200 ${
                          expandedModule === idx ? "rotate-180" : ""
                        }`}
                        style={{ fontSize: "18px" }}
                      >
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      expandedModule === idx
                        ? "max-h-[60px] opacity-100 mt-3"
                        : "max-h-0 opacity-0 mt-0"
                    }`}
                  >
                    <div className="pl-14 text-[11px] text-text-secondary/70 leading-relaxed border-t border-border-subtle/30 pt-3">
                      This module processes data{" "}
                      <span className="text-status-secure font-semibold">
                        entirely on your device
                      </span>
                      . No raw signals are transmitted — only aggregated integrity scores.
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="divider-gradient mb-5" />

          {/* Consent Form */}
          <form onSubmit={handleConsent} className="flex flex-col gap-4">
            {/* Digital signature input */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary font-ui block mb-1">
                Digital Signature
              </span>
              <p className="text-[11px] text-text-secondary/50 mb-3">
                Type your full legal name to acknowledge consent
              </p>
              <InputField
                type="text"
                placeholder="Enter your full legal name"
                icon="draw"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Consent checkbox */}
            <label className="consent-checkbox-label group">
              <div className="relative w-[18px] h-[18px] flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={consented}
                  onChange={(e) => setConsented(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-[18px] h-[18px] rounded-[5px] border border-border-subtle bg-bg-surface peer-checked:bg-status-secure peer-checked:border-status-secure transition-all duration-200" />
                <svg
                  className="absolute top-[4px] left-[4px] w-[10px] h-[10px] text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                  viewBox="0 0 10 10"
                  fill="none"
                >
                  <path
                    d="M2 5L4 7L8 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-[12px] text-text-secondary leading-relaxed group-hover:text-text-secondary/80 transition-colors">
                I understand and consent to behavioral monitoring during this
                session. I acknowledge that{" "}
                <span className="text-status-secure font-medium">
                  all processing occurs locally on my device
                </span>{" "}
                and no raw data leaves my browser.
              </span>
            </label>

            {/* Submit button */}
            <GradientButton
              type="submit"
              disabled={!consented || !name || loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  INITIALIZING SESSION…
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  I CONSENT — BEGIN SESSION
                  <ArrowRight size={16} />
                </>
              )}
            </GradientButton>

            {/* Fine print */}
            <p className="text-center text-[11px] text-text-secondary/40 mt-1 font-ui leading-relaxed">
              By proceeding, you agree to the{" "}
              <span className="text-accent-blue/60 hover:text-accent-blue cursor-pointer transition-colors">
                Monitoring Terms
              </span>{" "}
              and{" "}
              <span className="text-accent-blue/60 hover:text-accent-blue cursor-pointer transition-colors">
                Data Privacy Policy
              </span>
            </p>
          </form>

          {/* Bottom security badge */}
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
