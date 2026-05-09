"use client";
import { useState, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import Sidebar from "@/components/layout/Sidebar";
import SignalCard from "@/components/ui/SignalCard";
import StatusBadge from "@/components/ui/StatusBadge";
import LiveEventLog from "@/components/features/LiveEventLog";
import BreachOverlay from "@/components/features/BreachOverlay";
import { useMonitoringStore } from "@/stores/monitoring-store";
import { IntegrityState } from "@/types";
import { useSidebar } from "@/context/SidebarContext";

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
  const [timer, setTimer] = useState(0);
  const { collapsed } = useSidebar();

  useEffect(() => {
    const t = setInterval(() => setTimer((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const status: "secure" | "suspicious" | "breach" =
    integrityScore > 65 ? "secure" : integrityScore >= 35 ? "suspicious" : "breach";

  const fmtTimer = `${String(Math.floor(timer / 3600)).padStart(2, "0")}:${String(Math.floor((timer % 3600) / 60)).padStart(2, "0")}:${String(timer % 60).padStart(2, "0")}`;

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
      <div style={{ marginLeft: collapsed ? 68 : 240, transition: 'margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)' }}>
        {/* Topbar */}
        <Topbar
          candidateName="ARJUN SHARMA"
          timer={fmtTimer}
          status={status}
          variant="candidate"
        />

        {/* Content */}
        <main className="p-6">
          {/* Demo State Switcher */}
          <div className="rounded-xl border border-border-subtle bg-bg-surface/50 p-3 mb-6 flex items-center gap-3"
            style={{ backdropFilter: "blur(8px)" }}>
            <span className="flex items-center gap-1.5 text-[11px] text-text-secondary font-mono mr-1">
              <span className="material-symbols-outlined text-[14px]">science</span>
              DEMO:
            </span>
            {(["secure", "suspicious", "breach"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleDemoSwitch(s)}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 border ${
                  demoState === s
                    ? s === "secure"
                      ? "border-status-secure bg-status-secure/10 text-status-secure shadow-[0_0_12px_rgba(34,197,94,0.15)]"
                      : s === "suspicious"
                      ? "border-status-suspicious bg-status-suspicious/10 text-status-suspicious shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                      : "border-status-breach bg-status-breach/10 text-status-breach shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                    : "border-border-subtle text-text-secondary hover:border-border-active hover:bg-bg-panel/50"
                }`}
              >
                {s}
              </button>
            ))}
            {breachOverlayVisible && (
              <button
                onClick={() => toggleBreachOverlay(false)}
                className="ml-auto text-[11px] text-accent-blue hover:text-accent-cyan transition-colors font-mono flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
                DISMISS
              </button>
            )}
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-accent-blue">monitoring</span>
              <span className="section-header">SIGNAL MONITORING</span>
            </div>
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
