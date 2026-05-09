"use client";

interface CameraPreviewProps {
  width?: number;
  height?: number;
  className?: string;
  showOverlay?: boolean;
  label?: string;
}

export default function CameraPreview({
  width = 320,
  height = 200,
  className = "",
  showOverlay = false,
  label,
}: CameraPreviewProps) {
  return (
    <div
      className={`relative rounded-card overflow-hidden border border-border-subtle ${className}`}
      style={{ width, height }}
    >
      {/* Simulated camera feed (dark placeholder) */}
      <div className="absolute inset-0 bg-bg-panel flex items-center justify-center">
        {/* Abstract face outline for demo */}
        <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-20">
          <circle cx="40" cy="30" r="20" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
          <ellipse cx="40" cy="55" rx="25" ry="15" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Face detection overlay */}
      {showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="border-2 border-status-secure rounded-lg"
            style={{
              width: "50%",
              height: "65%",
              boxShadow: "0 0 15px rgba(34, 197, 94, 0.3)",
            }}
          />
        </div>
      )}

      {/* Label */}
      {label && (
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-bg-base/80 text-xs text-text-secondary font-mono">
          {label}
        </div>
      )}

      {/* Recording indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full bg-status-breach"
          style={{ animation: "dotPulse 1.5s infinite" }}
        />
        <span className="text-xs text-text-secondary font-mono">REC</span>
      </div>
    </div>
  );
}
