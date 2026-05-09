"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import IntegrityGauge from "@/components/ui/IntegrityGauge";
import RiskBar from "@/components/ui/RiskBar";
import { RiskFactors } from "@/types";
import { useSidebar } from "@/context/SidebarContext";

interface SidebarProps {
  variant?: "candidate" | "proctor";
  score?: number;
  riskFactors?: RiskFactors;
}

const proctorNavItems = [
  { label: "Overview", href: "/proctor", icon: "dashboard", badge: null },
  {
    label: "Sessions",
    href: "/proctor/create",
    icon: "event_note",
    badge: "3",
  },
  { label: "Candidates", href: "/proctor/candidates", icon: "groups", badge: null },
  { label: "Analytics", href: "/proctor/analytics", icon: "analytics", badge: null },
  { label: "Settings", href: "/proctor/settings", icon: "settings", badge: null },
];

export default function Sidebar({
  variant = "candidate",
  score = 92,
  riskFactors = { keystroke: 8, gaze: 12, process: 5, liveness: 3 },
}: SidebarProps) {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  /* ═══════════════════════════════════════
     PROCTOR SIDEBAR
     ═══════════════════════════════════════ */
  if (variant === "proctor") {
    return (
      <aside
        className="sidebar-shell"
        style={{ width: collapsed ? 68 : 240 }}
      >
        {/* Decorative top accent */}
        <div className="sidebar-accent-line" />

        {/* Logo + toggle */}
        <div className="sidebar-logo-section">
          <div className="sidebar-logo-icon" style={{ flexShrink: 0 }}>
            <span
              className="material-symbols-outlined text-accent-cyan"
              style={{ fontSize: "18px" }}
            >
              shield
            </span>
          </div>
          {!collapsed && (
            <div className="sidebar-label-fade">
              <div className="font-brand tracking-[0.2em] text-[13px] leading-tight">
                <span className="text-white">SENTINEL</span>{" "}
                <span className="text-accent-blue">ZERO</span>
              </div>
              <span className="text-[9px] text-text-secondary/40 font-mono tracking-wider uppercase">
                Proctor Console
              </span>
            </div>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={toggle}
          className="sidebar-toggle-btn"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: "16px",
              transform: collapsed ? "rotate(180deg)" : "none",
              transition: "transform 300ms ease",
            }}
          >
            chevron_left
          </span>
        </button>

        <div className="sidebar-divider" />

        {/* Nav Items */}
        <nav
          className="flex flex-col gap-1 flex-1"
          style={{ padding: collapsed ? "0 8px" : "0 12px" }}
        >
          {!collapsed && (
            <span className="text-[9px] font-mono text-text-secondary/30 uppercase tracking-widest px-3 mb-2">
              Navigation
            </span>
          )}
          {proctorNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`sidebar-nav-item ${
                  isActive ? "sidebar-nav-active" : ""
                }`}
                style={{
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "10px 0" : "9px 14px",
                }}
                title={collapsed ? item.label : undefined}
              >
                {isActive && <div className="sidebar-active-indicator" />}

                <span
                  className={`material-symbols-outlined transition-colors duration-200 ${
                    isActive ? "text-accent-blue" : "text-text-secondary/40"
                  }`}
                  style={{ fontSize: "18px" }}
                >
                  {item.icon}
                </span>

                {!collapsed && (
                  <>
                    <span
                      className={`text-[12px] font-ui tracking-wide transition-colors duration-200 sidebar-label-fade ${
                        isActive
                          ? "text-text-primary font-semibold"
                          : "text-text-secondary/60"
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="sidebar-badge">{item.badge}</span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div style={{ padding: collapsed ? "0 8px" : "0 12px" }}>
          <div className="sidebar-divider" />

          {/* Quick stats — only when expanded */}
          {!collapsed && (
            <div className="sidebar-stats-card sidebar-label-fade">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono text-text-secondary/30 uppercase tracking-widest">
                  Today
                </span>
                <span className="sidebar-live-dot" />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <span className="font-mono text-[18px] font-bold text-text-primary leading-none">
                    3
                  </span>
                  <span className="text-[9px] text-text-secondary/40 font-mono block">
                    Active
                  </span>
                </div>
                <div className="w-px h-6 bg-border-subtle/40" />
                <div>
                  <span className="font-mono text-[18px] font-bold text-text-primary leading-none">
                    24
                  </span>
                  <span className="text-[9px] text-text-secondary/40 font-mono block">
                    Online
                  </span>
                </div>
                <div className="w-px h-6 bg-border-subtle/40" />
                <div>
                  <span className="font-mono text-[18px] font-bold text-amber-400 leading-none">
                    1
                  </span>
                  <span className="text-[9px] text-text-secondary/40 font-mono block">
                    Flagged
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* User profile */}
          <div
            className="sidebar-user-card"
            style={{
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "10px 8px" : "10px 12px",
            }}
          >
            <div className="sidebar-user-avatar">
              <span className="text-[11px] text-accent-blue font-bold font-mono">
                PM
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 sidebar-label-fade">
                <div className="text-[11px] text-text-primary font-semibold font-ui truncate">
                  Dr. Priya Mehta
                </div>
                <div className="text-[9px] text-text-secondary/40 font-mono">
                  Proctor
                </div>
              </div>
            )}
            {!collapsed && (
              <span
                className="material-symbols-outlined text-text-secondary/20 hover:text-text-secondary/50 transition-colors cursor-pointer"
                style={{ fontSize: "16px" }}
              >
                more_horiz
              </span>
            )}
          </div>

          {!collapsed && (
            <div className="flex items-center justify-between px-1 pt-2 pb-1 sidebar-label-fade">
              <span className="text-[9px] text-text-secondary/20 font-mono">
                v1.0.0
              </span>
              <span className="text-[9px] text-text-secondary/20 font-mono flex items-center gap-1">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "10px" }}
                >
                  encrypted
                </span>
                TLS
              </span>
            </div>
          )}
        </div>
      </aside>
    );
  }

  /* ═══════════════════════════════════════
     CANDIDATE SIDEBAR
     ═══════════════════════════════════════ */
  const statusColor =
    score > 65 ? "#22C55E" : score >= 35 ? "#F59E0B" : "#EF4444";
  const statusLabel =
    score > 65 ? "SECURE" : score >= 35 ? "SUSPICIOUS" : "BREACH";

  return (
    <aside
      className="sidebar-shell"
      style={{ width: collapsed ? 68 : 240 }}
    >
      {/* Decorative top accent */}
      <div className="sidebar-accent-line" />

      {/* Logo */}
      <div className="sidebar-logo-section">
        <div className="sidebar-logo-icon" style={{ flexShrink: 0 }}>
          <span
            className="material-symbols-outlined text-accent-cyan"
            style={{ fontSize: "18px" }}
          >
            shield
          </span>
        </div>
        {!collapsed && (
          <div className="sidebar-label-fade">
            <div className="font-brand tracking-[0.2em] text-[13px] leading-tight">
              <span className="text-white">SENTINEL</span>{" "}
              <span className="text-accent-blue">ZERO</span>
            </div>
            <span className="text-[9px] text-text-secondary/40 font-mono tracking-wider uppercase">
              Candidate View
            </span>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={toggle}
        className="sidebar-toggle-btn"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: "16px",
            transform: collapsed ? "rotate(180deg)" : "none",
            transition: "transform 300ms ease",
          }}
        >
          chevron_left
        </span>
      </button>

      <div className="sidebar-divider" />

      {/* Integrity Gauge */}
      <div
        className="flex justify-center"
        style={{ marginBottom: collapsed ? 4 : 8, padding: "0 12px" }}
      >
        <IntegrityGauge
          score={score}
          size={collapsed ? 48 : 140}
          strokeWidth={collapsed ? 5 : 9}
          showLabel={!collapsed}
        />
      </div>

      {/* Status pill */}
      <div className="flex justify-center mb-4">
        <div
          className="sidebar-status-pill"
          style={{
            background: `${statusColor}08`,
            border: `1px solid ${statusColor}25`,
            padding: collapsed ? "4px 8px" : "5px 14px",
          }}
        >
          <span
            className="w-[5px] h-[5px] rounded-full"
            style={{
              backgroundColor: statusColor,
              boxShadow: `0 0 6px ${statusColor}`,
              animation: "dotPulse 2s infinite",
            }}
          />
          {!collapsed && (
            <span
              className="text-[10px] font-mono font-bold tracking-wider sidebar-label-fade"
              style={{ color: statusColor }}
            >
              {statusLabel}
            </span>
          )}
        </div>
      </div>

      <div className="sidebar-divider" />

      {/* Risk Factors — only expanded */}
      {!collapsed && (
        <div className="px-4 sidebar-label-fade">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="material-symbols-outlined text-text-secondary/30"
              style={{ fontSize: "14px" }}
            >
              monitoring
            </span>
            <span className="text-[9px] font-mono text-text-secondary/30 uppercase tracking-widest">
              Risk Factors
            </span>
          </div>
          <div className="flex flex-col gap-3 mb-5">
            <RiskBar
              label="KEYSTROKE"
              value={riskFactors.keystroke}
              icon="keyboard"
            />
            <RiskBar
              label="GAZE"
              value={riskFactors.gaze}
              icon="visibility"
            />
            <RiskBar
              label="PROCESS"
              value={riskFactors.process}
              icon="memory"
            />
            <RiskBar
              label="LIVENESS"
              value={riskFactors.liveness}
              icon="face"
            />
          </div>
        </div>
      )}

      {/* Collapsed: icon-only risk indicators */}
      {collapsed && (
        <div className="flex flex-col items-center gap-3 px-2 mb-4">
          {[
            { icon: "keyboard", value: riskFactors.keystroke },
            { icon: "visibility", value: riskFactors.gaze },
            { icon: "memory", value: riskFactors.process },
            { icon: "face", value: riskFactors.liveness },
          ].map((r) => {
            const c =
              r.value > 65
                ? "#EF4444"
                : r.value >= 35
                ? "#F59E0B"
                : "#22C55E";
            return (
              <div
                key={r.icon}
                className="w-9 h-9 rounded-lg flex items-center justify-center border"
                style={{
                  borderColor: `${c}20`,
                  background: `${c}06`,
                }}
                title={`${r.icon}: ${r.value}%`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "14px", color: `${c}90` }}
                >
                  {r.icon}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* System health */}
      <div
        className="mt-auto"
        style={{ padding: collapsed ? "0 8px" : "0 12px" }}
      >
        <div className="sidebar-divider" />

        {!collapsed && (
          <span className="text-[9px] font-mono text-text-secondary/30 uppercase tracking-widest px-1 block mb-2 sidebar-label-fade">
            System Health
          </span>
        )}

        <div className="sidebar-health-card">
          {[
            { label: "Camera", icon: "videocam", ok: true },
            { label: "Audio", icon: "mic", ok: true },
            { label: "Network", icon: "wifi", ok: true },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center"
              style={{
                justifyContent: collapsed ? "center" : "space-between",
              }}
            >
              <div
                className="flex items-center gap-2"
                style={{ gap: collapsed ? 0 : 8 }}
              >
                <span
                  className="material-symbols-outlined text-text-secondary/30"
                  style={{ fontSize: "13px" }}
                >
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="text-[10px] text-text-secondary/50 font-mono sidebar-label-fade">
                    {item.label}
                  </span>
                )}
              </div>
              {!collapsed && (
                <span
                  className="material-symbols-outlined text-status-secure sidebar-label-fade"
                  style={{ fontSize: "13px" }}
                >
                  check_circle
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Session footer */}
        <div
          className="flex items-center px-1 pt-3 pb-1"
          style={{
            justifyContent: collapsed ? "center" : "space-between",
          }}
        >
          {!collapsed && (
            <span className="text-[9px] text-text-secondary/25 font-mono sidebar-label-fade">
              SESSION SZ-8821
            </span>
          )}
          <span className="flex items-center gap-1">
            <span
              className="w-[4px] h-[4px] rounded-full bg-status-secure"
              style={{ animation: "dotPulse 2s infinite" }}
            />
            {!collapsed && (
              <span className="text-[9px] text-status-secure/50 font-mono sidebar-label-fade">
                LIVE
              </span>
            )}
          </span>
        </div>
      </div>
    </aside>
  );
}
