"use client";

interface RiskBarProps {
  label: string;
  value: number; // 0-100
  icon?: string;
  className?: string;
}

export default function RiskBar({ label, value, icon, className = "" }: RiskBarProps) {
  const color = value > 65 ? "#EF4444" : value >= 35 ? "#F59E0B" : "#22C55E";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {icon && (
        <span className="material-symbols-outlined text-text-secondary/50 shrink-0" style={{ fontSize: "14px" }}>
          {icon}
        </span>
      )}
      <span
        className="text-text-secondary uppercase font-mono shrink-0"
        style={{ fontSize: "10px", width: "70px" }}
      >
        {label}
      </span>
      <div className="flex-1 h-[5px] bg-[#1A1A3E] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-800 ease-out"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, #3B82F6, ${color})`,
            boxShadow: value > 35 ? `0 0 6px ${color}40` : "none",
          }}
        />
      </div>
      <span
        className="font-mono shrink-0 text-right font-medium"
        style={{ fontSize: "10px", width: "32px", color }}
      >
        {value}%
      </span>
    </div>
  );
}
