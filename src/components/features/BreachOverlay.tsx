"use client";
import { motion, AnimatePresence } from "framer-motion";

interface BreachOverlayProps {
  visible: boolean;
  reason?: string;
}

export default function BreachOverlay({
  visible,
  reason = "Multiple integrity violations detected. Session has been flagged for review.",
}: BreachOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: "rgba(4, 4, 15, 0.92)" }}
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
            <p className="text-text-secondary text-sm leading-relaxed mb-8 max-w-md mx-auto">
              {reason}
            </p>

            {/* Status */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-status-breach bg-glow-breach">
              <span className="w-2 h-2 rounded-full bg-status-breach" style={{ animation: "dotPulse 1s infinite" }} />
              <span className="text-status-breach text-xs font-mono uppercase tracking-wider">
                SESSION FLAGGED FOR REVIEW
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
