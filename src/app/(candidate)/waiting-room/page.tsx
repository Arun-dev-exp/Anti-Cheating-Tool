"use client";
import { useRouter } from "next/navigation";
import CameraPreview from "@/components/features/CameraPreview";

export default function WaitingRoomPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      <div className="auth-glow" />

      <div className="glass-card w-full max-w-[520px] p-10 relative z-10 animate-fade-in text-center">
        {/* Logotype */}
        <div className="font-brand tracking-[0.3em] mb-6" style={{ fontSize: "28px", fontWeight: 700 }}>
          <span className="text-white">SENTINEL</span>{" "}
          <span className="text-accent-blue">ZERO</span>
        </div>

        {/* Status */}
        <div className="mb-6">
          <span className="section-header block mb-3">WAITING FOR SESSION TO BEGIN</span>
          <p className="text-sm text-text-secondary">
            Your proctor will start the session shortly. Please remain on this page.
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full bg-accent-blue"
              style={{
                animation: "dotPulse 1.5s ease-in-out infinite",
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        {/* Session Info */}
        <div className="glass-panel p-4 mb-6 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-text-secondary uppercase tracking-wider block mb-1">Session Code</span>
              <span className="font-mono text-accent-blue text-lg">SZ-8821</span>
            </div>
            <div>
              <span className="text-xs text-text-secondary uppercase tracking-wider block mb-1">Duration</span>
              <span className="font-mono text-text-primary text-lg">120 min</span>
            </div>
            <div>
              <span className="text-xs text-text-secondary uppercase tracking-wider block mb-1">Session</span>
              <span className="text-sm text-text-primary">Technical Interview</span>
            </div>
            <div>
              <span className="text-xs text-text-secondary uppercase tracking-wider block mb-1">Proctor</span>
              <span className="text-sm text-text-primary">Dr. Priya Mehta</span>
            </div>
          </div>
        </div>

        {/* Camera Preview (corner) */}
        <div className="flex justify-center">
          <CameraPreview width={200} height={130} label="YOUR CAMERA" />
        </div>

        {/* Dev shortcut */}
        <button
          onClick={() => router.push("/liveness")}
          className="mt-6 text-xs text-text-secondary hover:text-accent-blue transition-colors font-mono"
        >
          [DEV] Skip to Liveness →
        </button>
      </div>
    </div>
  );
}
