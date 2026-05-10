"use client";
import { SignalData } from "@/types";

interface SignalCardProps {
  data: SignalData;
  className?: string;
}

const stateColors = {
  NORMAL: "#22C55E",
  ELEVATED: "#F59E0B",
  FLAGGED: "#EF4444",
};

const moduleIcons: Record<string, string> = {
  keystroke: "keyboard",
  gaze: "visibility",
  process: "memory",
  liveness: "face",
  network: "language",
};

export default function SignalCard({ data, className = "" }: SignalCardProps) {
  const dotColor = stateColors[data.state];
  const max = Math.max(...data.readings, 1);

  return (
    <div className={`relative group overflow-hidden rounded-xl border border-border-subtle bg-bg-surface/50 p-4 transition-all duration-300 hover:border-border-active ${className}`}
      style={{ backdropFilter: "blur(8px)" }}>

      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${dotColor}40, transparent)` }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${dotColor}10`, border: `1px solid ${dotColor}20` }}>
            <span className="material-symbols-outlined text-[14px]" style={{ color: dotColor }}>
              {moduleIcons[data.module] || "analytics"}
            </span>
          </div>
          <span className="text-text-secondary uppercase font-ui font-medium" style={{ fontSize: "11px", letterSpacing: "0.08em" }}>
            {data.module}
          </span>
        </div>
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            backgroundColor: dotColor,
            boxShadow: `0 0 8px ${dotColor}`,
          }}
        />
      </div>

      {/* Value */}
      <div className="flex items-end justify-between mb-3">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-[28px] font-bold text-text-primary leading-none">
            {data.value}
          </span>
          <span className="text-[12px] text-text-secondary font-mono">{data.unit}</span>
        </div>
      </div>

      {/* Micro Sparkline */}
      <div className="flex items-end gap-[2px] h-[24px] mb-3 px-0.5">
        {data.readings.map((r, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-300"
            style={{
              height: `${Math.max((r / max) * 100, 4)}%`,
              background: `linear-gradient(to top, ${dotColor}60, ${dotColor})`,
              opacity: 0.35 + (i / data.readings.length) * 0.65,
            }}
          />
        ))}
      </div>

      {/* State Label */}
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[12px]" style={{ color: dotColor }}>
          {data.state === "NORMAL" ? "check_circle" : data.state === "ELEVATED" ? "warning" : "error"}
        </span>
        <span
          className="font-mono uppercase font-medium"
          style={{ fontSize: "10px", color: dotColor, letterSpacing: "0.1em" }}
        >
          {data.state}
        </span>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at center, ${dotColor}04, transparent 70%)` }} />
    </div>
  );
}
