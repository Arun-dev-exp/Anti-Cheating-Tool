"use client";
import { motion, AnimatePresence } from "framer-motion";
import GradientButton from "@/components/ui/GradientButton";
import GhostButton from "@/components/ui/GhostButton";

interface EndSessionModalProps {
  visible: boolean;
  candidateCount?: number;
  sessionTitle?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function EndSessionModal({
  visible,
  candidateCount = 24,
  sessionTitle = "Technical Interview — Batch 7",
  onCancel,
  onConfirm,
}: EndSessionModalProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(4, 4, 15, 0.85)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="glass-card w-full max-w-[520px] p-10"
          >
            {/* Warning Icon */}
            <div className="text-center mb-6">
              <span className="text-5xl text-status-suspicious">⚠</span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-brand font-bold text-center text-text-primary mb-2">
              END SESSION
            </h2>
            <p className="text-sm text-text-secondary text-center mb-8">
              This will terminate monitoring for all candidates. This action cannot be undone.
            </p>

            {/* Summary */}
            <div className="glass-panel p-4 mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-text-secondary uppercase tracking-wider">Session</span>
                <span className="text-sm text-text-primary font-mono">{sessionTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-secondary uppercase tracking-wider">Active Candidates</span>
                <span className="text-sm text-text-primary font-mono">{candidateCount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <GhostButton onClick={onCancel} className="flex-1">CANCEL</GhostButton>
              <button
                onClick={onConfirm}
                className="flex-1 h-[48px] rounded-input text-sm font-semibold uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all duration-150 hover:brightness-110"
                style={{ backgroundColor: "#EF4444" }}
              >
                END SESSION & GENERATE REPORTS
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
