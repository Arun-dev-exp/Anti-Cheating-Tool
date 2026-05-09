"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GradientButton from "@/components/ui/GradientButton";
import { CheckCircle } from "lucide-react";

const steps = [
  { instruction: "Look straight at the camera", icon: "👤" },
  { instruction: "Slowly turn your head left", icon: "◀" },
  { instruction: "Slowly turn your head right", icon: "▶" },
  { instruction: "Blink naturally", icon: "👁" },
];

export default function LivenessPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [verified, setVerified] = useState(false);

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

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      <div className="auth-glow" />

      <div className="glass-card w-full max-w-[560px] p-10 relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="font-brand tracking-[0.3em] mb-3" style={{ fontSize: "24px", fontWeight: 700 }}>
            <span className="text-white">SENTINEL</span>{" "}
            <span className="text-accent-blue">ZERO</span>
          </div>
          <span className="section-header">LIVENESS VERIFICATION</span>
        </div>

        {/* Camera Feed Area */}
        <div className="relative mx-auto mb-6 rounded-card overflow-hidden border border-border-subtle" style={{ width: "400px", height: "300px" }}>
          <div className="absolute inset-0 bg-bg-panel flex items-center justify-center">
            <svg width="120" height="120" viewBox="0 0 120 120" className="opacity-30">
              <circle cx="60" cy="45" r="30" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
              <ellipse cx="60" cy="85" rx="35" ry="20" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Face Detection Box */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`border-2 rounded-lg transition-all duration-500 ${
                verified ? "border-status-secure" : "border-accent-blue"
              }`}
              style={{
                width: "55%",
                height: "70%",
                boxShadow: verified
                  ? "0 0 20px rgba(34, 197, 94, 0.3)"
                  : "0 0 15px rgba(59, 130, 246, 0.2)",
              }}
            />
          </div>

          {/* REC indicator */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-breach" style={{ animation: "dotPulse 1.5s infinite" }} />
            <span className="text-xs text-text-secondary font-mono">REC</span>
          </div>

          {/* Confidence overlay */}
          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded bg-bg-base/80">
            <span className="text-xs font-mono text-text-mono">
              CONF: {Math.min(Math.round(confidence), 100)}%
            </span>
          </div>
        </div>

        {/* Step Instructions */}
        <div className="text-center mb-6">
          {verified ? (
            <div className="flex items-center justify-center gap-3 animate-fade-in">
              <CheckCircle size={24} className="text-status-secure" />
              <span className="text-status-secure font-semibold uppercase tracking-wider text-sm">
                VERIFIED — IDENTITY CONFIRMED
              </span>
            </div>
          ) : (
            <>
              <div className="text-3xl mb-3">{steps[currentStep].icon}</div>
              <p className="text-text-primary font-ui">{steps[currentStep].instruction}</p>
              <div className="flex justify-center gap-2 mt-4">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i < currentStep
                        ? "bg-status-secure"
                        : i === currentStep
                        ? "bg-accent-blue"
                        : "bg-border-subtle"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Continue Button */}
        {verified && (
          <GradientButton onClick={() => router.push("/calibration")} className="animate-fade-in">
            CONTINUE TO CALIBRATION →
          </GradientButton>
        )}
      </div>
    </div>
  );
}
