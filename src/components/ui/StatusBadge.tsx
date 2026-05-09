"use client";

interface StatusBadgeProps {
  status: "secure" | "suspicious" | "breach";
  label?: string;
}

const statusConfig = {
  secure: { dot: "●", text: "SECURE", className: "status-badge-secure" },
  suspicious: { dot: "⚠", text: "SUSPICIOUS", className: "status-badge-suspicious" },
  breach: { dot: "✕", text: "BREACH", className: "status-badge-breach" },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={config.className}>
      <span>{config.dot}</span>
      <span>{label || config.text}</span>
    </span>
  );
}
