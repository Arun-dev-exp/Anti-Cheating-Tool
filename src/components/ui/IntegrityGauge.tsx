"use client";
import { useEffect, useState } from "react";

interface IntegrityGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export default function IntegrityGauge({
  score,
  size = 200,
  strokeWidth = 12,
  showLabel = true,
  className = "",
}: IntegrityGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [mounted, setMounted] = useState(false);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // 270° sweep
  const sweepLength = (270 / 360) * circumference;
  const offset = sweepLength - (animatedScore / 100) * sweepLength;

  const color = score > 65 ? "#22C55E" : score >= 35 ? "#F59E0B" : "#EF4444";
  const glowColor =
    score > 65
      ? "rgba(34, 197, 94, 0.3)"
      : score >= 35
      ? "rgba(245, 158, 11, 0.3)"
      : "rgba(239, 68, 68, 0.3)";

  // 270° arc starts at bottom-left: rotate start to 135°
  const startAngle = 135;

  useEffect(() => {
    setMounted(true);
    // Animate count-up
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOut
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform"
        style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1A1A3E"
          strokeWidth={strokeWidth}
          strokeDasharray={`${sweepLength} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
        />
        {/* Score Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${sweepLength} ${circumference}`}
          strokeDashoffset={mounted ? offset : sweepLength}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 800ms ease-out" }}
        />
        {/* Center Score */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontFamily="'JetBrains Mono', monospace"
          fontSize={size * 0.36}
          fontWeight="700"
        >
          {animatedScore}
        </text>
      </svg>
      {showLabel && (
        <span
          className="text-text-secondary uppercase tracking-widest mt-1"
          style={{ fontSize: "9px" }}
        >
          INTEGRITY INDEX
        </span>
      )}
    </div>
  );
}
