"use client";

export default function AnalyticsPage() {

  return (
        <main className="p-6 lg:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.08))", border: "1px solid rgba(139,92,246,0.2)" }}>
              <span className="material-symbols-outlined text-[24px]" style={{ color: "#8B5CF6" }}>analytics</span>
            </div>
            <div>
              <h1 className="text-[22px] font-ui font-semibold text-text-primary leading-tight">Analytics</h1>
              <p className="text-[13px] text-text-secondary">Session performance metrics and integrity trends</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            {[
              { label: "AVG INTEGRITY", value: "87.4", trend: "+2.1 from last week", icon: "shield", color: "#22C55E" },
              { label: "TOTAL SESSIONS", value: "156", trend: "+12% this month", icon: "event_note", color: "#3B82F6" },
              { label: "BREACH RATE", value: "3.2%", trend: "-0.8% improvement", icon: "gpp_maybe", color: "#F59E0B" },
            ].map((kpi, i) => (
              <div key={i} className="alerts-kpi-card" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-mono text-text-secondary/40 uppercase tracking-widest">{kpi.label}</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${kpi.color}10`, border: `1px solid ${kpi.color}20` }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "16px", color: kpi.color }}>{kpi.icon}</span>
                  </div>
                </div>
                <span className="font-mono text-[28px] font-bold leading-none block" style={{ color: kpi.color }}>{kpi.value}</span>
                <span className="text-[10px] text-text-secondary/40 font-mono mt-1 block">{kpi.trend}</span>
              </div>
            ))}
          </div>

          {/* Integrity Trend Chart Placeholder */}
          <div className="rounded-xl border border-border-subtle bg-bg-surface/40 overflow-hidden mb-6" style={{ backdropFilter: "blur(8px)" }}>
            <div className="px-5 py-3 border-b border-border-subtle/50 flex items-center gap-2 bg-bg-surface/30">
              <span className="material-symbols-outlined text-[16px] text-accent-cyan">show_chart</span>
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">Integrity Trend — Last 30 Days</span>
            </div>
            <div className="p-6">
              <div className="h-[200px] flex items-end gap-[3px]">
                {Array.from({ length: 30 }).map((_, i) => {
                  const h = 60 + Math.sin(i * 0.3) * 20 + Math.cos(i * 0.15) * 10;
                  const color = h > 75 ? "#22C55E" : h >= 50 ? "#F59E0B" : "#EF4444";
                  return (
                    <div key={i} className="flex-1 rounded-t transition-all duration-300 hover:brightness-125"
                      style={{ height: `${h}%`, backgroundColor: color, opacity: 0.6 }} />
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-[9px] text-text-secondary/25 font-mono">
                <span>Apr 10</span><span>Apr 17</span><span>Apr 24</span><span>May 1</span><span>May 9</span>
              </div>
            </div>
          </div>

          {/* Module Breakdown */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { module: "Keystroke", accuracy: "94.2%", alerts: 12, icon: "keyboard", color: "#3B82F6" },
              { module: "Gaze", accuracy: "91.7%", alerts: 8, icon: "visibility", color: "#06B6D4" },
              { module: "Process", accuracy: "97.1%", alerts: 5, icon: "memory", color: "#8B5CF6" },
              { module: "Liveness", accuracy: "99.3%", alerts: 3, icon: "face", color: "#F59E0B" },
            ].map((m, i) => (
              <div key={i} className="rounded-xl border border-border-subtle bg-bg-surface/40 p-5"
                style={{ backdropFilter: "blur(8px)", animation: `slideUp 0.4s ease-out ${i * 60 + 200}ms both` }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${m.color}10`, border: `1px solid ${m.color}20` }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "15px", color: m.color }}>{m.icon}</span>
                  </div>
                  <span className="text-[12px] text-text-primary font-ui font-medium">{m.module}</span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-mono text-[22px] font-bold" style={{ color: m.color }}>{m.accuracy}</span>
                  <span className="text-[9px] text-text-secondary/30 font-mono uppercase">accuracy</span>
                </div>
                <span className="text-[10px] text-text-secondary/40 font-mono">{m.alerts} alerts this week</span>
              </div>
            ))}
          </div>
        </main>
  );
}
