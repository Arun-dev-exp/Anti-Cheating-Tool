"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GradientButton from "@/components/ui/GradientButton";
import GhostButton from "@/components/ui/GhostButton";

export default function CalibrationPage() {
  const router = useRouter();
  const [activePoint, setActivePoint] = useState(-1);
  const [calibrated, setCalibrated] = useState<boolean[]>(new Array(9).fill(false));
  const [accuracy, setAccuracy] = useState(0);
  const [complete, setComplete] = useState(false);

  // 3x3 grid positions
  const points = [
    { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
    { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
    { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
  ];

  // Simulate calibration
  useEffect(() => {
    let step = 0;
    const timer = setInterval(() => {
      if (step >= 9) {
        setComplete(true);
        setAccuracy(96);
        clearInterval(timer);
        return;
      }
      setActivePoint(step);
      setCalibrated((prev) => {
        const next = [...prev];
        next[step] = true;
        return next;
      });
      setAccuracy(Math.round(((step + 1) / 9) * 96));
      step++;
    }, 700);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      <div className="auth-glow" />

      <div className="glass-card w-full max-w-[600px] p-10 relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="font-brand tracking-[0.3em] mb-3" style={{ fontSize: "24px", fontWeight: 700 }}>
            <span className="text-white">SENTINEL</span>{" "}
            <span className="text-accent-blue">ZERO</span>
          </div>
          <span className="section-header">GAZE CALIBRATION</span>
        </div>

        <p className="text-text-secondary text-sm text-center mb-8">
          Follow each dot with your eyes. Keep your head still.
        </p>

        {/* 9-Point Grid */}
        <div className="relative mx-auto mb-8 rounded-card border border-border-subtle bg-bg-panel" style={{ width: "400px", height: "300px" }}>
          <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-8">
            {points.map((_, i) => (
              <div key={i} className="flex items-center justify-center">
                <div
                  className={`rounded-full transition-all duration-300 ${
                    calibrated[i]
                      ? "w-3 h-3 bg-status-secure"
                      : i === activePoint
                      ? "w-5 h-5 bg-accent-blue"
                      : "w-3 h-3 bg-border-active"
                  }`}
                  style={{
                    boxShadow: i === activePoint
                      ? "0 0 20px rgba(59, 130, 246, 0.5)"
                      : calibrated[i]
                      ? "0 0 8px rgba(34, 197, 94, 0.3)"
                      : "none",
                    animation: i === activePoint ? "pulse 1s ease-in-out infinite" : "none",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Accuracy Score */}
        <div className="text-center mb-8">
          <span className="section-header block mb-2">CALIBRATION ACCURACY</span>
          <span className="font-mono text-3xl font-bold" style={{ color: accuracy > 80 ? "#22C55E" : "#F59E0B" }}>
            {accuracy}%
          </span>
        </div>

        {/* Actions */}
        {complete && (
          <div className="flex gap-3 animate-fade-in">
            <GhostButton onClick={() => window.location.reload()} className="flex-1">
              RECALIBRATE
            </GhostButton>
            <GradientButton onClick={() => router.push("/session/live")} fullWidth={false} className="flex-1">
              START SESSION →
            </GradientButton>
          </div>
        )}
      </div>
    </div>
  );
}
