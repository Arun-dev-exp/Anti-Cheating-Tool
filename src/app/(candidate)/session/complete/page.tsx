"use client";
import { useRouter } from "next/navigation";
import IntegrityGauge from "@/components/ui/IntegrityGauge";
import RiskBar from "@/components/ui/RiskBar";
import GradientButton from "@/components/ui/GradientButton";
import GhostButton from "@/components/ui/GhostButton";
import { CheckCircle, Download } from "lucide-react";

export default function SessionCompletePage() {
  const router = useRouter();
  const score = 87;
  const riskFactors = { keystroke: 10, gaze: 14, process: 6, liveness: 4 };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      <div className="auth-glow" />

      <div className="glass-card w-full max-w-[560px] p-10 relative z-10 animate-fade-in">
        {/* Green Checkmark */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full bg-status-secure/10 border border-status-secure/30 flex items-center justify-center"
            style={{ boxShadow: "0 0 30px rgba(34, 197, 94, 0.2)" }}
          >
            <CheckCircle size={40} className="text-status-secure" />
          </div>
        </div>

        <h2 className="text-xl font-brand font-bold text-center text-text-primary mb-1">
          SESSION COMPLETE
        </h2>
        <p className="text-sm text-text-secondary text-center mb-8">
          Your proctored session has ended successfully.
        </p>

        {/* Integrity Gauge */}
        <div className="flex justify-center mb-6">
          <IntegrityGauge score={score} size={180} strokeWidth={10} />
        </div>

        <div className="divider-gradient mb-6" />

        {/* Session Summary */}
        <div className="glass-panel p-4 mb-6">
          <span className="section-header block mb-3">SESSION SUMMARY</span>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-xs text-text-secondary block mb-1">Duration</span>
              <span className="font-mono text-text-primary">01:58:24</span>
            </div>
            <div>
              <span className="text-xs text-text-secondary block mb-1">Session ID</span>
              <span className="font-mono text-accent-blue">SZ-8821</span>
            </div>
            <div>
              <span className="text-xs text-text-secondary block mb-1">Date</span>
              <span className="font-mono text-text-primary">May 9, 2026</span>
            </div>
          </div>
        </div>

        {/* Risk Breakdown */}
        <div className="mb-6">
          <span className="section-header block mb-4">RISK BREAKDOWN</span>
          <div className="flex flex-col gap-3">
            <RiskBar label="KEYSTROKE" value={riskFactors.keystroke} />
            <RiskBar label="GAZE" value={riskFactors.gaze} />
            <RiskBar label="PROCESS" value={riskFactors.process} />
            <RiskBar label="LIVENESS" value={riskFactors.liveness} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <GhostButton onClick={() => {}} className="flex-1">
            <Download size={16} />
            DOWNLOAD REPORT
          </GhostButton>
          <GradientButton onClick={() => router.push("/")} fullWidth={false} className="flex-1">
            RETURN TO DASHBOARD
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
