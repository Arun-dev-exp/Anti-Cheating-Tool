"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import IntegrityGauge from "@/components/ui/IntegrityGauge";
import RiskBar from "@/components/ui/RiskBar";
import { RiskFactors } from "@/types";

interface SidebarProps {
  variant?: "candidate" | "proctor";
  score?: number;
  riskFactors?: RiskFactors;
}

const proctorNavItems = [
  { label: "OVERVIEW", href: "/proctor", icon: "◉" },
  { label: "SESSIONS", href: "/proctor/create", icon: "▣" },
  { label: "CANDIDATES", href: "#", icon: "◑" },
  { label: "ANALYTICS", href: "#", icon: "◈" },
  { label: "SETTINGS", href: "#", icon: "⚙" },
];

export default function Sidebar({
  variant = "candidate",
  score = 92,
  riskFactors = { keystroke: 8, gaze: 12, process: 5, liveness: 3 },
}: SidebarProps) {
  const pathname = usePathname();

  if (variant === "proctor") {
    return (
      <aside className="w-[220px] bg-bg-surface border-r border-border-subtle py-6 px-4 flex flex-col fixed h-full z-40">
        {/* Logo */}
        <div className="mb-8 px-2">
          <div className="font-brand tracking-[0.2em] text-sm">
            <span className="text-white">SENTINEL</span>{" "}
            <span className="text-accent-blue">ZERO</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1 flex-1">
          {proctorNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? "bg-bg-panel border border-border-active text-accent-blue"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-panel/50"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 pt-4 border-t border-border-subtle">
          <span className="text-xs text-text-secondary font-mono">v1.0.0</span>
        </div>
      </aside>
    );
  }

  // Candidate sidebar — integrity gauge + risk bars
  return (
    <aside className="w-[220px] bg-bg-surface border-r border-border-subtle py-6 px-4 flex flex-col fixed h-full z-40">
      {/* Integrity Gauge */}
      <div className="flex justify-center mb-6">
        <IntegrityGauge score={score} size={160} strokeWidth={10} />
      </div>

      <div className="divider-gradient mb-6" />

      {/* Risk Factors */}
      <div className="mb-4">
        <span className="section-header mb-4 block">RISK FACTORS</span>
      </div>
      <div className="flex flex-col gap-4">
        <RiskBar label="KEYSTROKE" value={riskFactors.keystroke} />
        <RiskBar label="GAZE" value={riskFactors.gaze} />
        <RiskBar label="PROCESS" value={riskFactors.process} />
        <RiskBar label="LIVENESS" value={riskFactors.liveness} />
      </div>

      {/* Bottom spacer */}
      <div className="flex-1" />
      <div className="divider-gradient mb-3" />
      <div className="px-1">
        <span className="text-xs text-text-secondary font-mono">SESSION SZ-8821</span>
      </div>
    </aside>
  );
}
