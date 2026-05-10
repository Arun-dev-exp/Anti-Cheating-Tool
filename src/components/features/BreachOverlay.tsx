"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface BreachOverlayProps {
  visible: boolean;
  reason?: string;
  onDismiss?: () => void;
}

export default function BreachOverlay({
  visible,
  reason = "Multiple integrity violations detected across keystroke, gaze, and process modules. Session has been flagged for review.",
  onDismiss,
}: BreachOverlayProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(60);

  // Reset countdown when overlay becomes visible
  useEffect(() => {
    if (!visible) {
      setCountdown(60);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/join");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, router]);

  const handleReturn = () => {
    router.push("/join");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: "rgba(4, 4, 15, 0.96)" }}
        >
          <div className="text-center max-w-lg px-8">
            {/* Pulsing Warning Icon */}
            <div
              className="mx-auto mb-8 flex items-center justify-center"
              style={{
                width: "96px",
                height: "96px",
                animation: "breach-pulse 1.5s ease-in-out infinite",
              }}
            >
              <span className="text-7xl text-status-breach" style={{ filter: "drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))" }}>
                ⚠
              </span>
            </div>

            {/* Title */}
            <h1
              className="font-brand text-status-breach uppercase tracking-[0.2em] mb-4"
              style={{ fontSize: "28px", fontWeight: 700 }}
            >
              INTEGRITY BREACH DETECTED
            </h1>

            {/* Reason */}
            <p className="text-text-secondary text-sm leading-relaxed mb-6 max-w-md mx-auto">
              {reason}
            </p>

            {/* Status */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-status-breach bg-glow-breach mb-8">
              <span className="w-2 h-2 rounded-full bg-status-breach" style={{ animation: "dotPulse 1s infinite" }} />
              <span className="text-status-breach text-xs font-mono uppercase tracking-wider">
                SESSION FLAGGED FOR REVIEW
              </span>
            </div>

            {/* Info text */}
            <p className="text-text-secondary/50 text-[12px] font-mono mb-8 max-w-sm mx-auto leading-relaxed">
              This incident has been recorded and reported to your interviewer.
              You will be redirected to the session entry screen.
            </p>

            {/* Return button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={handleReturn}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-ui font-semibold transition-all duration-300 hover:scale-[1.03] mb-4"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.1))",
                border: "1px solid rgba(59,130,246,0.3)",
                color: "#3B82F6",
              }}
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Return to Session Entry
              <span className="material-symbols-outlined text-[14px]">login</span>
            </motion.button>

            {/* Countdown timer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <div className="flex items-center justify-center gap-2 text-text-secondary/30 text-[11px] font-mono">
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>timer</span>
                Auto-redirecting in{" "}
                <span className="text-text-secondary/60 font-bold tabular-nums">{countdown}s</span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 mx-auto max-w-[200px] h-[2px] bg-border-subtle/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #3B82F6, #06B6D4)" }}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 60, ease: "linear" }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
