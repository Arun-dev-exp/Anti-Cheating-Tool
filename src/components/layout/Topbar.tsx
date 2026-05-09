"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import StatusBadge from "@/components/ui/StatusBadge";

interface TopbarProps {
  candidateName?: string;
  timer?: string;
  status?: "secure" | "suspicious" | "breach";
  variant?: "candidate" | "proctor";
}

export default function Topbar({
  candidateName = "ARJUN SHARMA",
  timer = "01:24:36",
  status = "secure",
  variant = "candidate",
}: TopbarProps) {
  const pathname = usePathname();

  return (
    <header
      className="h-[56px] border-b border-border-subtle px-6 flex items-center justify-between sticky top-0 z-50"
      style={{ backgroundColor: "rgba(10, 10, 30, 0.95)", backdropFilter: "blur(12px)" }}
    >
      {/* Left: Logo */}
      <Link href="/" className="flex items-center gap-3">
        <div className="font-brand tracking-[0.2em] text-sm">
          <span className="text-white">SENTINEL</span>{" "}
          <span className="text-accent-blue">ZERO</span>
        </div>
      </Link>

      {/* Center: Candidate Info (candidate variant) */}
      {variant === "candidate" && (
        <div className="flex items-center gap-6">
          <span className="text-text-secondary text-xs uppercase tracking-wider font-ui">
            {candidateName}
          </span>
          <span className="font-mono text-text-mono" style={{ fontSize: "20px", fontWeight: 500 }}>
            {timer}
          </span>
          <StatusBadge status={status} />
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {variant === "proctor" && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-secure" style={{ boxShadow: "0 0 6px #22C55E", animation: "dotPulse 2s infinite" }} />
            <span className="text-xs text-text-secondary font-mono">LIVE</span>
          </div>
        )}
        <div className="w-8 h-8 rounded-full bg-bg-panel border border-border-subtle flex items-center justify-center text-xs text-text-secondary">
          AS
        </div>
      </div>
    </header>
  );
}
