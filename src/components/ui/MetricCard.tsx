"use client";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export default function MetricCard({ label, value, subtext, icon, trend, className = "" }: MetricCardProps) {
  const trendColor = trend === "up" ? "#22C55E" : trend === "down" ? "#EF4444" : "#94A3B8";

  return (
    <div className={`glass-panel p-5 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="section-header">{label}</span>
        {icon && <span className="text-accent-blue text-lg">{icon}</span>}
      </div>
      <div className="font-mono text-3xl font-bold text-text-primary mb-1">{value}</div>
      {subtext && (
        <span className="text-xs font-mono" style={{ color: trendColor }}>
          {subtext}
        </span>
      )}
    </div>
  );
}
