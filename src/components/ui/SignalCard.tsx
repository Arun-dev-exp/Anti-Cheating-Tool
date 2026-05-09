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

export default function SignalCard({ data, className = "" }: SignalCardProps) {
  const dotColor = stateColors[data.state];
  const max = Math.max(...data.readings, 1);

  return (
    <div className={`signal-card ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{data.icon}</span>
        <span className="text-text-secondary uppercase font-ui" style={{ fontSize: "11px", letterSpacing: "0.1em" }}>
          {data.module}
        </span>
      </div>

      {/* Value */}
      <div className="flex items-end justify-between mb-3">
        <span className="font-mono text-2xl font-bold text-text-primary">
          {data.value}
          <span className="text-sm text-text-secondary ml-1">{data.unit}</span>
        </span>
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{
            backgroundColor: dotColor,
            boxShadow: `0 0 8px ${dotColor}`,
          }}
        />
      </div>

      {/* Micro Sparkline */}
      <div className="flex items-end gap-[2px] h-[20px] mb-2">
        {data.readings.map((r, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${(r / max) * 100}%`,
              backgroundColor: dotColor,
              opacity: 0.4 + (i / data.readings.length) * 0.6,
            }}
          />
        ))}
      </div>

      {/* State Label */}
      <span
        className="font-mono uppercase"
        style={{ fontSize: "10px", color: dotColor, letterSpacing: "0.1em" }}
      >
        {data.state}
      </span>
    </div>
  );
}
