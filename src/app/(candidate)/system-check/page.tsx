"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CameraPreview from "@/components/features/CameraPreview";
import GradientButton from "@/components/ui/GradientButton";
import { Camera, Mic, Globe, Wifi, CheckCircle } from "lucide-react";

const systemChecks = [
  { icon: <Camera size={16} />, label: "Camera Access", key: "camera" },
  { icon: <Mic size={16} />, label: "Microphone Access", key: "mic" },
  { icon: <Globe size={16} />, label: "Browser Compatibility", key: "browser" },
  { icon: <Wifi size={16} />, label: "Network Connection", key: "network" },
];

const requirements = [
  "Chrome 98+ or Firefox 100+",
  "WebRTC and MediaDevices API",
  "Stable internet connection (>5 Mbps)",
  "Webcam with minimum 720p resolution",
];

export default function SystemCheckPage() {
  const router = useRouter();
  const [checks, setChecks] = useState<Record<string, boolean>>({
    camera: false, mic: false, browser: false, network: false,
  });

  // Simulate progressive checks
  useEffect(() => {
    const keys = ["browser", "network", "mic", "camera"];
    keys.forEach((key, i) => {
      setTimeout(() => {
        setChecks((prev) => ({ ...prev, [key]: true }));
      }, 800 + i * 600);
    });
  }, []);

  const allReady = Object.values(checks).every(Boolean);

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      <div className="auth-glow" />

      <div className="glass-card w-full max-w-[560px] p-10 relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="font-brand tracking-[0.3em] mb-3" style={{ fontSize: "28px", fontWeight: 700 }}>
            <span className="text-white">SENTINEL</span>{" "}
            <span className="text-accent-blue">ZERO</span>
          </div>
          <span className="section-header">SYSTEM READINESS CHECK</span>
        </div>

        {/* Camera Preview */}
        <div className="flex justify-center mb-6">
          <CameraPreview width={320} height={200} showOverlay={checks.camera} label="PREVIEW" />
        </div>

        {/* Permission Badges */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {systemChecks.map((check) => (
            <div
              key={check.key}
              className={`glass-panel p-3 flex items-center gap-3 transition-all duration-500 ${
                checks[check.key] ? "!border-status-secure" : ""
              }`}
            >
              <span className={checks[check.key] ? "text-status-secure" : "text-text-secondary"}>
                {checks[check.key] ? <CheckCircle size={16} /> : check.icon}
              </span>
              <span className="text-xs font-ui text-text-primary">{check.label}</span>
              {checks[check.key] && (
                <span className="ml-auto status-badge-secure !py-0 !px-1.5" style={{ fontSize: "8px" }}>
                  READY
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Requirements */}
        <div className="glass-panel p-4 mb-6">
          <span className="section-header block mb-3">SYSTEM REQUIREMENTS</span>
          <ul className="space-y-2">
            {requirements.map((r, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                <span className="text-accent-blue">→</span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <GradientButton onClick={() => router.push("/waiting-room")} disabled={!allReady}>
          {allReady ? "ALL SYSTEMS READY — PROCEED TO WAITING ROOM" : "CHECKING SYSTEMS..."}
        </GradientButton>
      </div>
    </div>
  );
}
