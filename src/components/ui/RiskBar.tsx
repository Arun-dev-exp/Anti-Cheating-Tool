"use client";

interface RiskBarProps {
  label: string;
  value: number; // 0-100
  className?: string;
}

export default function RiskBar({ label, value, className = "" }: RiskBarProps) {
  const color = value > 65 ? "#EF4444" : value >= 35 ? "#F59E0B" : "#22C55E";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span
        className="text-text-secondary uppercase font-mono shrink-0"
        style={{ fontSize: "11px", width: "80px" }}
      >
        {label}
      </span>
      <div className="flex-1 h-[6px] bg-[#1A1A3E] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-800 ease-out"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, #3B82F6, ${color})`,
          }}
        />
      </div>
      <span
        className="font-mono shrink-0 text-right"
        style={{ fontSize: "11px", width: "36px", color }}
      >
        {value}%
      </span>
    </div>
  );
}
