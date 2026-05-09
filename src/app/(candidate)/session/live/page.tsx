"use client";
import { useState } from "react";
import Topbar from "@/components/layout/Topbar";
import Sidebar from "@/components/layout/Sidebar";
import SignalCard from "@/components/ui/SignalCard";
import StatusBadge from "@/components/ui/StatusBadge";
import LiveEventLog from "@/components/features/LiveEventLog";
import BreachOverlay from "@/components/features/BreachOverlay";
import { useMonitoringStore } from "@/stores/monitoring-store";
import { IntegrityState } from "@/types";

export default function LiveDashboardPage() {
  const {
    integrityScore,
    riskFactors,
    events,
    signals,
    breachOverlayVisible,
    loadDemoState,
    toggleBreachOverlay,
  } = useMonitoringStore();
  const [demoState, setDemoState] = useState<IntegrityState>("secure");

  const status: "secure" | "suspicious" | "breach" =
    integrityScore > 65 ? "secure" : integrityScore >= 35 ? "suspicious" : "breach";

  const timer = "01:24:36";

  const handleDemoSwitch = (state: IntegrityState) => {
    setDemoState(state);
    loadDemoState(state);
  };

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Breach Overlay */}
      <BreachOverlay
        visible={breachOverlayVisible}
        reason="Multiple integrity violations detected across keystroke, gaze, and process modules. Session has been flagged for review."
      />

      {/* Sidebar */}
      <Sidebar variant="candidate" score={integrityScore} riskFactors={riskFactors} />

      {/* Main Content */}
      <div className="ml-[220px]">
        {/* Topbar */}
        <Topbar
          candidateName="ARJUN SHARMA"
          timer={timer}
          status={status}
          variant="candidate"
        />

        {/* Content */}
        <main className="p-6">
          {/* Demo State Switcher */}
          <div className="glass-panel p-3 mb-6 flex items-center gap-3">
            <span className="text-xs text-text-secondary font-mono mr-2">DEMO STATE:</span>
            {(["secure", "suspicious", "breach"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleDemoSwitch(s)}
                className={`px-3 py-1.5 rounded-input text-xs font-semibold uppercase tracking-wider transition-all duration-200 border ${
                  demoState === s
                    ? s === "secure"
                      ? "border-status-secure bg-glow-secure text-status-secure"
                      : s === "suspicious"
                      ? "border-status-suspicious bg-glow-suspicious text-status-suspicious"
                      : "border-status-breach bg-glow-breach text-status-breach"
                    : "border-border-subtle text-text-secondary hover:border-border-active"
                }`}
              >
                {s}
              </button>
            ))}
            {breachOverlayVisible && (
              <button
                onClick={() => toggleBreachOverlay(false)}
                className="ml-auto text-xs text-accent-blue hover:underline font-mono"
              >
                DISMISS OVERLAY
              </button>
            )}
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="section-header">SIGNAL MONITORING</span>
            <StatusBadge status={status} />
          </div>

          {/* Signal Cards — 4 columns */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {signals.map((signal) => (
              <SignalCard key={signal.module} data={signal} />
            ))}
          </div>

          {/* Event Log */}
          <LiveEventLog events={events} maxHeight="400px" />
        </main>
      </div>
    </div>
  );
}
