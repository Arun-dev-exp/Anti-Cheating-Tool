"use client";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

/* Animated grid dot — small particle effect */
function GridDot({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <div
      className="absolute w-[2px] h-[2px] rounded-full bg-accent-blue/40"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animation: `authDotPulse 3s ${delay}s ease-in-out infinite`,
      }}
    />
  );
}

export default function AuthCard({ children, className = "" }: AuthCardProps) {
  const [dots, setDots] = useState<{ x: number; y: number; d: number }[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 40 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      d: Math.random() * 4,
    }));
    setDots(generated);
  }, []);

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      {/* Full-page background effects */}
      <div className="auth-glow" />
      <div
        className="auth-glow"
        style={{
          animationDelay: "2s",
          opacity: 0.12,
          background:
            "radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Subtle grid pattern across the whole page */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(59, 130, 246, 0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Main Card: split layout */}
      <div
        className={`relative z-10 w-full max-w-[960px] grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] overflow-hidden rounded-[20px] border border-border-active/60 animate-fade-in ${className}`}
        style={{
          background: "rgba(10, 10, 30, 0.7)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          boxShadow:
            "0 0 80px rgba(59, 130, 246, 0.06), 0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* ── LEFT: Branding Panel ── */}
        <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden border-r border-border-subtle/50 p-12">
          {/* Gradient background */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "linear-gradient(160deg, rgba(59, 130, 246, 0.08) 0%, rgba(6, 182, 212, 0.04) 50%, rgba(4, 4, 15, 0.95) 100%)",
            }}
          />

          {/* Particle field */}
          <div className="absolute inset-0 z-[1] overflow-hidden">
            {dots.map((d, i) => (
              <GridDot key={i} x={d.x} y={d.y} delay={d.d} />
            ))}
          </div>

          {/* Scanning line */}
          <div
            className="absolute left-0 right-0 h-[1px] z-[2]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.25), transparent)",
              animation: "authScanLine 6s ease-in-out infinite",
            }}
          />

          {/* Central orb glow */}
          <div
            className="absolute z-[1] w-[300px] h-[300px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(59, 130, 246, 0.10) 0%, transparent 70%)",
              animation: "authOrbPulse 5s ease-in-out infinite",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center gap-8">
            {/* Shield icon */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center border border-accent-blue/20"
              style={{
                background:
                  "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.06))",
                boxShadow: "0 0 40px rgba(59, 130, 246, 0.1)",
              }}
            >
              <span
                className="material-symbols-outlined text-accent-blue"
                style={{ fontSize: "36px" }}
              >
                verified_user
              </span>
            </div>

            {/* Logo */}
            <div>
              <div
                className="font-brand tracking-[0.35em] mb-3"
                style={{ fontSize: "26px", fontWeight: 700 }}
              >
                <span className="text-white">SENTINEL</span>{" "}
                <span className="text-accent-blue">ZERO</span>
              </div>
              <p className="text-text-secondary text-[13px] font-ui leading-relaxed max-w-[260px]">
                AI-Powered Behavioral Proctoring
                <br />
                <span className="text-text-secondary/60">
                  Privacy-first. Explainable. Secure.
                </span>
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex flex-col gap-3 mt-4">
              {[
                {
                  icon: "lock",
                  text: "End-to-end encrypted",
                },
                {
                  icon: "visibility_off",
                  text: "No data leaves your device",
                },
                {
                  icon: "shield",
                  text: "SOC 2 Type II compliant",
                },
              ].map((badge) => (
                <div
                  key={badge.icon}
                  className="flex items-center gap-3 text-text-secondary/70 text-[12px] font-ui"
                >
                  <span
                    className="material-symbols-outlined text-accent-blue/50"
                    style={{ fontSize: "16px" }}
                  >
                    {badge.icon}
                  </span>
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form Panel ── */}
        <div className="relative flex flex-col justify-center p-8 sm:p-12">
          {/* Mobile-only header */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="font-brand tracking-[0.3em] mb-1"
              style={{ fontSize: "24px", fontWeight: 700 }}
            >
              <span className="text-white">SENTINEL</span>{" "}
              <span className="text-accent-blue">ZERO</span>
            </div>
            <p className="text-text-secondary text-[12px] font-ui">
              AI-Powered Behavioral Proctoring
            </p>
          </div>

          {children}

          {/* Bottom security badge — mobile & desktop */}
          <div className="flex items-center justify-center gap-2 mt-8 text-text-secondary/40 text-[11px] font-mono">
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
