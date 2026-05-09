"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/ui/InputField";
import GradientButton from "@/components/ui/GradientButton";

const modules = [
  { key: "keystroke", label: "Keystroke Dynamics", desc: "Typing pattern & rhythm analysis", icon: "keyboard" },
  { key: "gaze", label: "Gaze Tracking", desc: "Eye movement & focus detection", icon: "visibility" },
  { key: "process", label: "Process Monitoring", desc: "Application & tab surveillance", icon: "memory" },
  { key: "liveness", label: "Liveness Detection", desc: "Real-time presence verification", icon: "face" },
];

const sensitivityLevels = [
  { key: "low" as const, label: "Low", desc: "Relaxed thresholds", icon: "shield", color: "#22C55E" },
  { key: "medium" as const, label: "Medium", desc: "Balanced detection", icon: "security", color: "#F59E0B" },
  { key: "high" as const, label: "High", desc: "Zero tolerance", icon: "gpp_maybe", color: "#EF4444" },
];

export default function SessionCreatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [maxCandidates, setMaxCandidates] = useState("30");
  const [duration, setDuration] = useState("120");
  const [sensitivity, setSensitivity] = useState<"low" | "medium" | "high">("high");
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({
    keystroke: true, gaze: true, process: true, liveness: true,
  });
  const [loading, setLoading] = useState(false);

  const toggleModule = (key: string) => {
    setEnabledModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const enabledCount = Object.values(enabledModules).filter(Boolean).length;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/proctor/session/SZ-8821/invite");
    }, 600);
  };

  return (
        <main className="p-6 md:p-8 max-w-3xl">
          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.08))", border: "1px solid rgba(59,130,246,0.2)" }}>
                <span className="material-symbols-outlined text-[20px] text-accent-blue">add_circle</span>
              </div>
              <div>
                <h1 className="text-[20px] font-ui font-semibold text-text-primary leading-tight">Create Session</h1>
                <p className="text-[13px] text-text-secondary">Configure a new AI-proctored exam session</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreate} className="flex flex-col gap-8">
            {/* ── Section 1: Basic Info ── */}
            <div className="rounded-xl border border-border-subtle bg-bg-surface/40 overflow-hidden"
              style={{ backdropFilter: "blur(8px)" }}>
              <div className="px-5 py-3 border-b border-border-subtle/50 flex items-center gap-2 bg-bg-surface/30">
                <span className="material-symbols-outlined text-[16px] text-accent-cyan">info</span>
                <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">Session Information</span>
              </div>
              <div className="p-5 space-y-5">
                <InputField
                  label="Session Name"
                  placeholder="e.g., Technical Interview — Batch 7"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon="event_note"
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Max Candidates"
                    type="number"
                    placeholder="30"
                    value={maxCandidates}
                    onChange={(e) => setMaxCandidates(e.target.value)}
                    icon="groups"
                  />
                  <InputField
                    label="Duration (minutes)"
                    type="number"
                    placeholder="120"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    icon="timer"
                  />
                </div>
              </div>
            </div>

            {/* ── Section 2: Monitoring Modules ── */}
            <div className="rounded-xl border border-border-subtle bg-bg-surface/40 overflow-hidden"
              style={{ backdropFilter: "blur(8px)" }}>
              <div className="px-5 py-3 border-b border-border-subtle/50 flex items-center justify-between bg-bg-surface/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-accent-cyan">monitoring</span>
                  <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">Monitoring Modules</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
                  {enabledCount}/4 ACTIVE
                </span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  {modules.map((m) => {
                    const active = enabledModules[m.key];
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => toggleModule(m.key)}
                        className={`relative rounded-xl p-4 flex items-start gap-3 transition-all duration-300 text-left border group overflow-hidden ${
                          active
                            ? "border-accent-blue/30 bg-accent-blue/[0.04]"
                            : "border-border-subtle bg-bg-base/30 opacity-50 hover:opacity-70"
                        }`}
                      >
                        {/* Top accent */}
                        {active && (
                          <div className="absolute top-0 left-0 right-0 h-[2px]"
                            style={{ background: "linear-gradient(90deg, transparent, #3B82F680, transparent)" }} />
                        )}

                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                          active
                            ? "bg-accent-blue/10 border border-accent-blue/20"
                            : "bg-bg-surface/60 border border-border-subtle"
                        }`}>
                          <span className={`material-symbols-outlined text-[18px] transition-colors ${
                            active ? "text-accent-blue" : "text-text-secondary/50"
                          }`}>{m.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] text-text-primary font-medium block leading-tight">{m.label}</span>
                          <span className="text-[11px] text-text-secondary/70 block mt-0.5">{m.desc}</span>
                        </div>
                        {/* Toggle indicator */}
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${
                          active
                            ? "bg-accent-blue/15 border border-accent-blue/30"
                            : "bg-bg-surface/40 border border-border-subtle"
                        }`}>
                          {active && (
                            <span className="material-symbols-outlined text-[12px] text-accent-blue">check</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Section 3: Sensitivity ── */}
            <div className="rounded-xl border border-border-subtle bg-bg-surface/40 overflow-hidden"
              style={{ backdropFilter: "blur(8px)" }}>
              <div className="px-5 py-3 border-b border-border-subtle/50 flex items-center gap-2 bg-bg-surface/30">
                <span className="material-symbols-outlined text-[16px] text-accent-cyan">tune</span>
                <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">Sensitivity Level</span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-3">
                  {sensitivityLevels.map((level) => {
                    const active = sensitivity === level.key;
                    return (
                      <button
                        key={level.key}
                        type="button"
                        onClick={() => setSensitivity(level.key)}
                        className={`relative rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-300 border text-center overflow-hidden ${
                          active
                            ? "bg-bg-panel/60"
                            : "border-border-subtle bg-bg-base/30 hover:border-border-active"
                        }`}
                        style={{
                          borderColor: active ? `${level.color}40` : undefined,
                          boxShadow: active ? `0 0 20px ${level.color}10` : undefined,
                        }}
                      >
                        {active && (
                          <div className="absolute top-0 left-0 right-0 h-[2px]"
                            style={{ background: `linear-gradient(90deg, transparent, ${level.color}80, transparent)` }} />
                        )}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                          style={{
                            background: active ? `${level.color}15` : "rgba(26,26,62,0.4)",
                            border: `1px solid ${active ? `${level.color}30` : "rgba(45,45,107,0.5)"}`,
                          }}>
                          <span className="material-symbols-outlined text-[20px]"
                            style={{ color: active ? level.color : "rgba(148,163,184,0.4)" }}>{level.icon}</span>
                        </div>
                        <span className={`text-[13px] font-semibold uppercase tracking-wider transition-colors ${
                          active ? "text-text-primary" : "text-text-secondary/60"
                        }`}>{level.label}</span>
                        <span className="text-[10px] text-text-secondary/50">{level.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Summary + Submit ── */}
            <div className="rounded-xl border border-border-subtle bg-bg-surface/40 overflow-hidden"
              style={{ backdropFilter: "blur(8px)" }}>
              <div className="px-5 py-3 border-b border-border-subtle/50 flex items-center gap-2 bg-bg-surface/30">
                <span className="material-symbols-outlined text-[16px] text-accent-cyan">checklist</span>
                <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">Session Summary</span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-4 gap-4 mb-5">
                  {[
                    { label: "Candidates", value: maxCandidates || "—", icon: "groups" },
                    { label: "Duration", value: duration ? `${duration}m` : "—", icon: "timer" },
                    { label: "Modules", value: `${enabledCount}/4`, icon: "monitoring" },
                    { label: "Sensitivity", value: sensitivity.charAt(0).toUpperCase() + sensitivity.slice(1), icon: "tune" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-bg-base/40 border border-border-subtle/50">
                      <span className="material-symbols-outlined text-[14px] text-text-secondary/50">{item.icon}</span>
                      <div>
                        <span className="text-[9px] text-text-secondary/50 uppercase font-mono block">{item.label}</span>
                        <span className="text-[13px] text-text-primary font-medium font-mono">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <GradientButton type="submit" disabled={loading || !name}>
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">
                      {loading ? "progress_activity" : "rocket_launch"}
                    </span>
                    {loading ? "CREATING SESSION..." : "CREATE SESSION"}
                    {!loading && <span className="material-symbols-outlined text-[16px]">arrow_forward</span>}
                  </span>
                </GradientButton>
              </div>
            </div>
          </form>
        </main>
  );
}
