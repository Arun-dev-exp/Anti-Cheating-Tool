"use client";
import { IntegrityEvent } from "@/types";

interface EventLogRowProps {
  event: IntegrityEvent;
}

const severityConfig = {
  info: { color: "#22C55E", dot: "●" },
  warning: { color: "#F59E0B", dot: "⚠" },
  breach: { color: "#EF4444", dot: "✕" },
};

const moduleIcons: Record<string, string> = {
  keystroke: "⌨",
  gaze: "👁",
  process: "⚙",
  liveness: "🔲",
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
    <div className="log-entry">
      {/* Timestamp */}
      <span className="text-text-secondary shrink-0" style={{ width: "70px" }}>
        {time}
      </span>

      {/* Severity Dot */}
      <span style={{ color: config.color }} className="shrink-0">
        {config.dot}
      </span>

      {/* Module Icon */}
      <span className="shrink-0">{moduleIcons[event.module]}</span>

      {/* Message */}
      <span className="text-text-primary truncate flex-1">{event.message}</span>

      {/* Confidence */}
      <span className="text-text-secondary shrink-0" style={{ fontSize: "10px" }}>
        {event.confidence}%
      </span>
    </div>
  );
}
