"use client";
import { IntegrityEvent } from "@/types";

interface EventLogRowProps {
  event: IntegrityEvent;
}

const severityConfig = {
  info: { color: "#22C55E", icon: "check_circle" },
  warning: { color: "#F59E0B", icon: "warning" },
  breach: { color: "#EF4444", icon: "error" },
};

const moduleIcons: Record<string, string> = {
  keystroke: "keyboard",
  gaze: "visibility",
  process: "memory",
  liveness: "face",
};

export default function EventLogRow({ event }: EventLogRowProps) {
  const config = severityConfig[event.severity];
  const time = new Date(event.timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div className="log-entry group hover:bg-bg-panel/30 transition-colors duration-150 px-5">
      {/* Timestamp */}
      <span className="text-text-secondary/70 shrink-0 font-mono" style={{ width: "70px", fontSize: "11px" }}>
        {time}
      </span>

      {/* Severity Icon */}
      <span className="material-symbols-outlined shrink-0" style={{ color: config.color, fontSize: "14px" }}>
        {config.icon}
      </span>

      {/* Module Icon */}
      <span className="material-symbols-outlined shrink-0 text-text-secondary/50" style={{ fontSize: "14px" }}>
        {moduleIcons[event.module] || "info"}
      </span>

      {/* Message */}
      <span className="text-text-primary truncate flex-1 text-[12px]">{event.message}</span>

      {/* Confidence */}
      <span className="text-text-secondary/50 shrink-0 font-mono text-right" style={{ fontSize: "10px", width: "40px" }}>
        {event.confidence}%
      </span>
    </div>
  );
}
