"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import StatusBadge from "@/components/ui/StatusBadge";
import { useAuth } from "@/context/AuthContext";

interface TopbarProps {
  candidateName?: string;
  timer?: string;
  status?: "secure" | "suspicious" | "breach";
  variant?: "candidate" | "proctor";
}

export default function Topbar({
  candidateName = "",
  timer = "--:--:--",
  status = "secure",
  variant = "candidate",
}: TopbarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "--";

  return (
    <header
      className="h-[56px] border-b border-border-subtle px-6 flex items-center justify-between sticky top-0 z-50"
      style={{ backgroundColor: "rgba(10, 10, 30, 0.92)", backdropFilter: "blur(16px)" }}
    >
      {/* Left: Session context */}
      <div className="flex items-center gap-4">
        {variant === "candidate" && candidateName && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px] text-accent-blue">person</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-text-primary font-medium font-ui leading-tight">
                  {candidateName}
                </span>
              </div>
            </div>
            <div className="w-px h-7 bg-border-subtle" />
          </>
        )}
        {variant === "proctor" && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-secure" style={{ boxShadow: "0 0 6px #22C55E", animation: "dotPulse 2s infinite" }} />
            <span className="text-[11px] text-text-secondary font-mono">LIVE MONITORING</span>
          </div>
        )}
      </div>

      {/* Center: Timer */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-bg-surface/60 border border-border-subtle">
          <span className="material-symbols-outlined text-[16px] text-accent-cyan">timer</span>
          <span className="font-mono text-text-mono text-[18px] font-medium tracking-wider" style={{ fontVariantNumeric: "tabular-nums" }}>
            {timer}
          </span>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-lg bg-bg-surface/40 border border-border-subtle flex items-center justify-center hover:border-border-active transition-colors">
          <span className="material-symbols-outlined text-[16px] text-text-secondary">notifications</span>
        </button>
        <div className="w-8 h-8 rounded-lg bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
          <span className="text-[11px] text-accent-blue font-semibold font-mono">{initials}</span>
        </div>
      </div>
    </header>
  );
}
