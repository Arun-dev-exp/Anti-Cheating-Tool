"use client";
import { useEffect, useRef, useState } from "react";

interface CameraPreviewProps {
  width?: number;
  height?: number;
  className?: string;
  showOverlay?: boolean;
  label?: string;
  stream?: MediaStream | null;
  onStreamReady?: (stream: MediaStream) => void;
  /** Reference to the video element for external use (e.g., MediaPipe) */
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export default function CameraPreview({
  width = 320,
  height = 200,
  className = "",
  showOverlay = false,
  label,
  stream: externalStream,
  onStreamReady,
  videoRef: externalVideoRef,
}: CameraPreviewProps) {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoElement = externalVideoRef ?? internalVideoRef;
  const [hasStream, setHasStream] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let localStream: MediaStream | null = null;

    async function startCamera() {
      try {
        if (externalStream) {
          // Use externally provided stream
          if (videoElement.current) {
            videoElement.current.srcObject = externalStream;
            await videoElement.current.play().catch(() => {});
          }
          setHasStream(true);
          return;
        }

        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        });
        localStream = stream;

        if (videoElement.current) {
          videoElement.current.srcObject = stream;
          await videoElement.current.play().catch(() => {});
        }
        setHasStream(true);
        onStreamReady?.(stream);
      } catch (err: any) {
        console.error("[CameraPreview] Failed to access camera:", err);
        setError(err.name === "NotAllowedError" ? "Camera access denied" : "Camera unavailable");
      }
    }

    startCamera();

    return () => {
      // Only stop local stream, not externally provided one
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [externalStream]);

  return (
    <div
      className={`relative rounded-card overflow-hidden border border-border-subtle ${className}`}
      style={{ width, height }}
    >
      {/* Real camera feed */}
      <video
        ref={videoElement}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: "scaleX(-1)", display: hasStream ? "block" : "none" }}
        muted
        playsInline
        autoPlay
      />

      {/* Fallback: no camera */}
      {!hasStream && (
        <div className="absolute inset-0 bg-bg-panel flex flex-col items-center justify-center gap-2">
          {error ? (
            <>
              <span className="material-symbols-outlined text-status-breach/40" style={{ fontSize: "28px" }}>videocam_off</span>
              <span className="text-[10px] text-status-breach/60 font-mono">{error}</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-text-secondary/20 animate-pulse" style={{ fontSize: "28px" }}>videocam</span>
              <span className="text-[10px] text-text-secondary/30 font-mono">Connecting camera...</span>
            </>
          )}
        </div>
      )}

      {/* Face detection overlay */}
      {showOverlay && hasStream && (
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
      {hasStream && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full bg-status-breach"
            style={{ animation: "dotPulse 1.5s infinite" }}
          />
          <span className="text-xs text-text-secondary font-mono">REC</span>
        </div>
      )}
    </div>
  );
}
