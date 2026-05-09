"use client";
import IntegrityGauge from "@/components/ui/IntegrityGauge";
import RiskBar from "@/components/ui/RiskBar";
import SignalCard from "@/components/ui/SignalCard";
import LiveEventLog from "@/components/features/LiveEventLog";
import CameraPreview from "@/components/features/CameraPreview";
import GhostButton from "@/components/ui/GhostButton";
import StatusBadge from "@/components/ui/StatusBadge";
import { generateMockEvents } from "@/lib/integrity-engine";
import { SignalData } from "@/types";

const signals: SignalData[] = [
  { module: "keystroke", icon: "⌨", value: "42", unit: "ms", state: "NORMAL", readings: [30, 35, 38, 40, 42, 41, 39, 40, 42, 43] },
  { module: "gaze", icon: "👁", value: "97", unit: "%", state: "NORMAL", readings: [95, 96, 97, 96, 98, 97, 97, 96, 97, 97] },
  { module: "process", icon: "⚙", value: "3", unit: "active", state: "NORMAL", readings: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3] },
  { module: "liveness", icon: "🔲", value: "99", unit: "%", state: "NORMAL", readings: [98, 99, 99, 99, 98, 99, 99, 99, 99, 99] },
];

export default function MonitorViewPage() {
  const events = generateMockEvents(12);

  return (
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-brand font-bold text-text-primary mb-1">Arjun Sharma</h1>
              <p className="text-sm text-text-secondary font-mono">Candidate ID: c-001</p>
            </div>
            <div className="flex items-center gap-3">
              <GhostButton className="!h-[38px] !text-xs !px-4">FLAG CANDIDATE</GhostButton>
              <button className="h-[38px] px-4 rounded-input text-xs font-semibold uppercase tracking-wider text-white bg-status-suspicious hover:brightness-110 transition-all">SEND WARNING</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-1">
              <CameraPreview width={320} height={240} showOverlay={true} label="LIVE FEED" />
              <div className="mt-4 flex justify-center">
                <IntegrityGauge score={92} size={160} strokeWidth={10} />
              </div>
              <div className="mt-4 space-y-3">
                <RiskBar label="KEYSTROKE" value={8} />
                <RiskBar label="GAZE" value={12} />
                <RiskBar label="PROCESS" value={5} />
                <RiskBar label="LIVENESS" value={3} />
              </div>
            </div>
            <div className="col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="section-header">SIGNAL BREAKDOWN</span>
                <StatusBadge status="secure" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {signals.map((s) => <SignalCard key={s.module} data={s} />)}
              </div>
              <LiveEventLog events={events} maxHeight="300px" />
            </div>
          </div>
        </main>
  );
}
