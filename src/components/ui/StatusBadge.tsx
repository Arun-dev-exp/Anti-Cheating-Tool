"use client";

interface StatusBadgeProps {
  status: "secure" | "suspicious" | "breach";
  label?: string;
}

const statusConfig = {
  secure: { icon: "check_circle", text: "SECURE", color: "#22C55E" },
  suspicious: { icon: "warning", text: "SUSPICIOUS", color: "#F59E0B" },
  breach: { icon: "error", text: "BREACH", color: "#EF4444" },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider"
      style={{
        color: config.color,
        background: `${config.color}10`,
        border: `1px solid ${config.color}25`,
        boxShadow: `0 0 10px ${config.color}10`,
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{config.icon}</span>
      <span>{label || config.text}</span>
    </span>
  );
}
