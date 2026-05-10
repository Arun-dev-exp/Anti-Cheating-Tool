"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Topbar from "@/components/layout/Topbar";
import Sidebar from "@/components/layout/Sidebar";
import SignalCard from "@/components/ui/SignalCard";
import StatusBadge from "@/components/ui/StatusBadge";
import LiveEventLog from "@/components/features/LiveEventLog";
import CameraPreview from "@/components/features/CameraPreview";
import BreachOverlay from "@/components/features/BreachOverlay";
import { useMonitoringStore } from "@/stores/monitoring-store";
import { useSidebar } from "@/context/SidebarContext";
import { useSession } from "@/context/SessionContext";
import { startGazeEngine, stopGazeEngine, getGazeStats } from "@/detection/gaze-engine";
import { startLivenessEngine, stopLivenessEngine, getLivenessStats } from "@/detection/liveness-engine";

export default function LiveDashboardPage() {
  const {
    integrityScore,
    riskFactors,
    events,
    signals,
    breachOverlayVisible,
    isElectron,
    bridgeConnected,
    initFromBridge,
    setRiskFactors,
    applySignalEvent,
  } = useMonitoringStore();

  const [timer, setTimer] = useState(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [enginesStarted, setEnginesStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { collapsed } = useSidebar();
  const { participantId, candidateName } = useSession();

  // Timer
  useEffect(() => {
    const t = setInterval(() => setTimer((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Connect to IPC bridge on mount
  useEffect(() => {
    const cleanup = initFromBridge();

    // If in Electron, send session:start to trigger keystroke/process/network engines
    if (typeof window !== "undefined" && (window as any).sentinelBridge) {
      (window as any).sentinelBridge.send("session:start", {
        participantId,
        ts: Date.now(),
      });
    }

    return () => {
      cleanup();
      // Send session:end
      if (typeof window !== "undefined" && (window as any).sentinelBridge) {
        (window as any).sentinelBridge.send("session:end", { ts: Date.now() });
      }
    };
  }, []);

  // Start gaze + liveness engines when camera is ready
  const handleCameraReady = useCallback(async (stream: MediaStream) => {
    setCameraStream(stream);
  }, []);

  useEffect(() => {
    if (!cameraStream || enginesStarted || !videoRef.current) return;

    const video = videoRef.current;

    // Wait for video to be ready
    const startEngines = async () => {
      if (video.readyState < 2) {
        await new Promise<void>((resolve) => {
          video.addEventListener("loadeddata", () => resolve(), { once: true });
        });
      }

      // Start gaze engine with signal callback
      await startGazeEngine(video, (data) => {
        const { riskFactors } = useMonitoringStore.getState();
        const newRisk = data.offScreen
          ? Math.min(100, riskFactors.gaze + 10)
          : Math.max(0, riskFactors.gaze - 2);
        const newFactors = { ...riskFactors, gaze: newRisk };
        useMonitoringStore.getState().setRiskFactors(newFactors);
        useMonitoringStore.getState().applySignalEvent(
          "gaze",
          data.offScreen,
          data.offScreen ? `Off-screen gaze — ${(data.durationMs / 1000).toFixed(1)}s continuous` : undefined
        );
      });

      // Start liveness engine with signal callback
      await startLivenessEngine(video, undefined, (data) => {
        const { riskFactors } = useMonitoringStore.getState();
        const newRisk = !data.live
          ? Math.min(100, riskFactors.liveness + 15)
          : Math.max(0, riskFactors.liveness - 2);
        const newFactors = { ...riskFactors, liveness: newRisk };
        useMonitoringStore.getState().setRiskFactors(newFactors);
        useMonitoringStore.getState().applySignalEvent(
          "liveness",
          !data.live,
          !data.live
            ? (data.faceCount === 0 ? "No face detected in frame" : `Multiple faces detected (${data.faceCount})`)
            : undefined
        );
      });

      setEnginesStarted(true);
      console.log("[LiveSession] All detection engines started");
    };

    startEngines();

    return () => {
      stopGazeEngine();
      stopLivenessEngine();
    };
  }, [cameraStream, enginesStarted]);

  // Post score updates to Supabase
  useEffect(() => {
    if (!participantId) return;

    fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, integrityScore, riskFactors }),
    }).catch((err) => console.error("Failed to push score:", err));
  }, [integrityScore, riskFactors, participantId]);

  const status: "secure" | "suspicious" | "breach" =
    integrityScore > 65 ? "secure" : integrityScore >= 35 ? "suspicious" : "breach";

  const fmtTimer = `${String(Math.floor(timer / 3600)).padStart(2, "0")}:${String(Math.floor((timer % 3600) / 60)).padStart(2, "0")}:${String(timer % 60).padStart(2, "0")}`;

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
          candidateName={candidateName ?? "CANDIDATE"}
          timer={fmtTimer}
          status={status}
          variant="candidate"
        />

        {/* Content */}
        <main className="p-6">
          {/* Engine Status Bar */}
          <div
            className="rounded-xl border bg-bg-surface/50 p-3 mb-6 flex items-center gap-4"
            style={{
              backdropFilter: "blur(8px)",
              borderColor: enginesStarted ? "rgba(34,197,94,0.15)" : "rgba(59,130,246,0.15)",
            }}
          >
            <span className="flex items-center gap-1.5 text-[11px] font-mono mr-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: enginesStarted ? "#22C55E" : "#3B82F6",
                  animation: enginesStarted ? "none" : "dotPulse 1.5s infinite",
                }}
              />
              <span style={{ color: enginesStarted ? "#22C55E" : "#3B82F6" }}>
                {enginesStarted ? "ENGINES ACTIVE" : "INITIALIZING..."}
              </span>
            </span>

            {/* Module status pills */}
            {[
              { name: "Keystroke", active: bridgeConnected },
              { name: "Gaze", active: enginesStarted },
              { name: "Process", active: bridgeConnected },
              { name: "Liveness", active: enginesStarted },
              { name: "Network", active: bridgeConnected },
            ].map((m) => (
              <span
                key={m.name}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider"
                style={{
                  color: m.active ? "#22C55E" : "#6B7280",
                  background: m.active ? "rgba(34,197,94,0.06)" : "rgba(107,114,128,0.06)",
                  border: `1px solid ${m.active ? "rgba(34,197,94,0.15)" : "rgba(107,114,128,0.1)"}`,
                }}
              >
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: m.active ? "#22C55E" : "#6B7280" }}
                />
                {m.name}
              </span>
            ))}

            {!isElectron && (
              <span className="ml-auto text-[10px] text-status-suspicious font-mono flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>info</span>
                Keystroke/Process/Network require Electron
              </span>
            )}
          </div>

          {/* Two-column: Camera + Signals */}
          <div className="grid grid-cols-[280px_1fr] gap-6 mb-6">
            {/* Camera Preview */}
            <div>
              <CameraPreview
                width={280}
                height={210}
                showOverlay={true}
                label="LIVE FEED"
                onStreamReady={handleCameraReady}
                videoRef={videoRef}
              />
              <div className="mt-2 flex items-center justify-center gap-3">
                {enginesStarted && (
                  <span className="text-[9px] font-mono text-status-secure/60 flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>check_circle</span>
                    MediaPipe Active
                  </span>
                )}
              </div>
            </div>

            {/* Signal Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-accent-blue">monitoring</span>
                  <span className="section-header">SIGNAL MONITORING</span>
                </div>
                <StatusBadge status={status} />
              </div>
              <div className="grid grid-cols-5 gap-3">
                {signals.map((signal) => (
                  <SignalCard key={signal.module} data={signal} />
                ))}
              </div>
            </div>
          </div>

          {/* Event Log */}
          <LiveEventLog events={events} maxHeight="400px" />
        </main>
      </div>
    </div>
  );
}
