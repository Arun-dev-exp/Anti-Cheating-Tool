"use client";
import { useState } from "react";

interface ToggleItem {
  label: string;
  desc: string;
  icon: string;
  key: string;
  defaultValue: boolean;
}

interface SelectItem {
  label: string;
  desc: string;
  icon: string;
  key: string;
  options: string[];
  defaultValue: string;
}

const monitoringToggles: ToggleItem[] = [
  { label: "Keystroke Dynamics", desc: "Analyze typing rhythm and cadence patterns", icon: "keyboard", key: "keystroke", defaultValue: true },
  { label: "Gaze Tracking", desc: "Monitor eye movement and focus direction", icon: "visibility", key: "gaze", defaultValue: true },
  { label: "Process Monitoring", desc: "Detect unauthorized apps and tab switches", icon: "memory", key: "process", defaultValue: true },
  { label: "Liveness Detection", desc: "Real-time face presence verification", icon: "face", key: "liveness", defaultValue: true },
];

const monitoringSelects: SelectItem[] = [
  { label: "Default Sensitivity", desc: "Threshold for flagging anomalies", icon: "tune", key: "sensitivity", options: ["Low", "Medium", "High"], defaultValue: "High" },
  { label: "Auto-flag Threshold", desc: "Integrity score below which candidates are flagged", icon: "flag", key: "threshold", options: ["50%", "55%", "60%", "65%", "70%", "75%"], defaultValue: "65%" },
];

const notificationToggles: ToggleItem[] = [
  { label: "Email Alerts", desc: "Receive critical alerts via email", icon: "mail", key: "emailAlerts", defaultValue: true },
  { label: "Breach Notifications", desc: "Instant alerts when integrity is compromised", icon: "crisis_alert", key: "breachNotif", defaultValue: true },
  { label: "Session Summary Reports", desc: "Post-session analytics delivered to inbox", icon: "summarize", key: "sessionReports", defaultValue: true },
  { label: "Weekly Analytics Digest", desc: "Weekly performance and trend overview", icon: "analytics", key: "weeklyDigest", defaultValue: false },
];

const securityToggles: ToggleItem[] = [
  { label: "Two-Factor Authentication", desc: "Require 2FA for proctor login", icon: "verified_user", key: "twoFactor", defaultValue: true },
  { label: "Session Recording", desc: "Record full session video and events", icon: "videocam", key: "recording", defaultValue: true },
];

const securitySelects: SelectItem[] = [
  { label: "Data Retention Period", desc: "How long session data is stored", icon: "delete_sweep", key: "retention", options: ["30 days", "60 days", "90 days", "180 days", "1 year"], defaultValue: "90 days" },
  { label: "Auto-logout Timer", desc: "Idle timeout before automatic sign-out", icon: "timer_off", key: "autoLogout", options: ["15 min", "30 min", "60 min", "Never"], defaultValue: "30 min" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="w-11 h-[24px] rounded-full flex items-center cursor-pointer transition-all duration-300 px-[3px] shrink-0"
      style={{
        background: checked ? "rgba(34,197,94,0.15)" : "rgba(26,26,62,0.6)",
        border: `1px solid ${checked ? "rgba(34,197,94,0.25)" : "rgba(45,45,107,0.5)"}`,
        boxShadow: checked ? "0 0 12px rgba(34,197,94,0.08)" : "none",
      }}
    >
      <div
        className="w-[16px] h-[16px] rounded-full transition-all duration-300"
        style={{
          background: checked ? "#22C55E" : "rgba(148,163,184,0.25)",
          transform: checked ? "translateX(18px)" : "translateX(0)",
          boxShadow: checked ? "0 0 8px rgba(34,197,94,0.35)" : "none",
        }}
      />
    </button>
  );
}

function SelectDropdown({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-[11px] font-mono text-accent-blue px-3 py-1.5 rounded-lg border border-accent-blue/15 bg-accent-blue/[0.04] cursor-pointer transition-all duration-200 hover:border-accent-blue/25 focus:outline-none focus:border-accent-blue/40 appearance-none shrink-0"
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%233B82F6' stroke-width='1.2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: "28px" }}
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-bg-base text-text-primary">{opt}</option>
      ))}
    </select>
  );
}

export default function SettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    [...monitoringToggles, ...notificationToggles, ...securityToggles].forEach((t) => { init[t.key] = t.defaultValue; });
    return init;
  });

  const [selects, setSelects] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    [...monitoringSelects, ...securitySelects].forEach((s) => { init[s.key] = s.defaultValue; });
    return init;
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelect = (key: string, value: string) => {
    setSelects((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const enabledModulesCount = monitoringToggles.filter((t) => toggles[t.key]).length;

  return (
    <main className="p-6 lg:p-8 max-w-4xl">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(148,163,184,0.1), rgba(6,182,212,0.06))", border: "1px solid rgba(148,163,184,0.15)" }}>
            <span className="material-symbols-outlined text-[22px] text-text-secondary/60">settings</span>
          </div>
          <div>
            <h1 className="text-[20px] font-ui font-semibold text-text-primary leading-tight">Settings</h1>
            <p className="text-[13px] text-text-secondary">Configure monitoring, notifications, and security preferences</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-mono font-semibold uppercase tracking-wider transition-all duration-300"
          style={{
            background: saved ? "rgba(34,197,94,0.08)" : "rgba(59,130,246,0.06)",
            border: `1px solid ${saved ? "rgba(34,197,94,0.2)" : "rgba(59,130,246,0.15)"}`,
            color: saved ? "#22C55E" : "#3B82F6",
          }}
        >
          <span className="material-symbols-outlined text-[16px]">
            {saved ? "check_circle" : "save"}
          </span>
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* ── Left: Main Settings (2 cols) ── */}
        <div className="col-span-2 flex flex-col gap-6">

          {/* Monitoring Defaults */}
          <div className="rounded-xl border border-border-subtle bg-bg-surface/40 overflow-hidden"
            style={{ backdropFilter: "blur(8px)", animation: "slideUp 0.4s ease-out both" }}>
            <div className="px-5 py-3 border-b border-border-subtle/50 flex items-center justify-between bg-bg-surface/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-accent-cyan">monitoring</span>
                <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">Monitoring Modules</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
                {enabledModulesCount}/4 ACTIVE
              </span>
            </div>
            <div className="divide-y divide-border-subtle/15">
              {monitoringToggles.map((item) => (
                <div key={item.key} className="px-5 py-3.5 flex items-center justify-between hover:bg-bg-panel/20 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                      style={{
                        background: toggles[item.key] ? "rgba(59,130,246,0.06)" : "rgba(26,26,62,0.3)",
                        border: `1px solid ${toggles[item.key] ? "rgba(59,130,246,0.12)" : "rgba(45,45,107,0.3)"}`,
                      }}>
                      <span className={`material-symbols-outlined text-[16px] transition-colors ${toggles[item.key] ? "text-accent-blue" : "text-text-secondary/25"}`}>
                        {item.icon}
                      </span>
                    </div>
                    <div>
                      <span className="text-[13px] text-text-primary/80 font-ui block leading-tight">{item.label}</span>
                      <span className="text-[11px] text-text-secondary/40">{item.desc}</span>
                    </div>
                  </div>
                  <Toggle checked={toggles[item.key]} onChange={() => handleToggle(item.key)} />
                </div>
              ))}
              {/* Sensitivity selects */}
              {monitoringSelects.map((item) => (
                <div key={item.key} className="px-5 py-3.5 flex items-center justify-between hover:bg-bg-panel/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}>
                      <span className="material-symbols-outlined text-[16px] text-accent-blue">{item.icon}</span>
                    </div>
                    <div>
                      <span className="text-[13px] text-text-primary/80 font-ui block leading-tight">{item.label}</span>
                      <span className="text-[11px] text-text-secondary/40">{item.desc}</span>
                    </div>
                  </div>
                  <SelectDropdown value={selects[item.key]} options={item.options} onChange={(v) => handleSelect(item.key, v)} />
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-xl border border-border-subtle bg-bg-surface/40 overflow-hidden"
            style={{ backdropFilter: "blur(8px)", animation: "slideUp 0.4s ease-out 80ms both" }}>
            <div className="px-5 py-3 border-b border-border-subtle/50 flex items-center gap-2 bg-bg-surface/30">
              <span className="material-symbols-outlined text-[16px] text-accent-cyan">notifications</span>
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">Notifications</span>
            </div>
            <div className="divide-y divide-border-subtle/15">
              {notificationToggles.map((item) => (
                <div key={item.key} className="px-5 py-3.5 flex items-center justify-between hover:bg-bg-panel/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: toggles[item.key] ? "rgba(59,130,246,0.06)" : "rgba(26,26,62,0.3)",
                        border: `1px solid ${toggles[item.key] ? "rgba(59,130,246,0.12)" : "rgba(45,45,107,0.3)"}`,
                      }}>
                      <span className={`material-symbols-outlined text-[16px] transition-colors ${toggles[item.key] ? "text-accent-blue" : "text-text-secondary/25"}`}>
                        {item.icon}
                      </span>
                    </div>
                    <div>
                      <span className="text-[13px] text-text-primary/80 font-ui block leading-tight">{item.label}</span>
                      <span className="text-[11px] text-text-secondary/40">{item.desc}</span>
                    </div>
                  </div>
                  <Toggle checked={toggles[item.key]} onChange={() => handleToggle(item.key)} />
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="rounded-xl border border-border-subtle bg-bg-surface/40 overflow-hidden"
            style={{ backdropFilter: "blur(8px)", animation: "slideUp 0.4s ease-out 160ms both" }}>
            <div className="px-5 py-3 border-b border-border-subtle/50 flex items-center gap-2 bg-bg-surface/30">
              <span className="material-symbols-outlined text-[16px] text-accent-cyan">security</span>
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">Security &amp; Privacy</span>
            </div>
            <div className="divide-y divide-border-subtle/15">
              {securityToggles.map((item) => (
                <div key={item.key} className="px-5 py-3.5 flex items-center justify-between hover:bg-bg-panel/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: toggles[item.key] ? "rgba(59,130,246,0.06)" : "rgba(26,26,62,0.3)",
                        border: `1px solid ${toggles[item.key] ? "rgba(59,130,246,0.12)" : "rgba(45,45,107,0.3)"}`,
                      }}>
                      <span className={`material-symbols-outlined text-[16px] transition-colors ${toggles[item.key] ? "text-accent-blue" : "text-text-secondary/25"}`}>
                        {item.icon}
                      </span>
                    </div>
                    <div>
                      <span className="text-[13px] text-text-primary/80 font-ui block leading-tight">{item.label}</span>
                      <span className="text-[11px] text-text-secondary/40">{item.desc}</span>
                    </div>
                  </div>
                  <Toggle checked={toggles[item.key]} onChange={() => handleToggle(item.key)} />
                </div>
              ))}
              {securitySelects.map((item) => (
                <div key={item.key} className="px-5 py-3.5 flex items-center justify-between hover:bg-bg-panel/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}>
                      <span className="material-symbols-outlined text-[16px] text-accent-blue">{item.icon}</span>
                    </div>
                    <div>
                      <span className="text-[13px] text-text-primary/80 font-ui block leading-tight">{item.label}</span>
                      <span className="text-[11px] text-text-secondary/40">{item.desc}</span>
                    </div>
                  </div>
                  <SelectDropdown value={selects[item.key]} options={item.options} onChange={(v) => handleSelect(item.key, v)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="col-span-1 flex flex-col gap-5">

          {/* Profile Card */}
          <div className="rounded-xl border border-border-subtle bg-bg-surface/40 overflow-hidden"
            style={{ backdropFilter: "blur(8px)", animation: "slideUp 0.4s ease-out 60ms both" }}>
            <div className="px-5 py-3 border-b border-border-subtle/50 flex items-center gap-2 bg-bg-surface/30">
              <span className="material-symbols-outlined text-[16px] text-accent-cyan">person</span>
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">Profile</span>
            </div>
            <div className="p-5 flex flex-col items-center">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}>
                <span className="text-[20px] font-mono font-bold text-accent-blue">PM</span>
              </div>
              <span className="text-[14px] text-text-primary font-semibold font-ui">Dr. Priya Mehta</span>
              <span className="text-[11px] text-text-secondary/50 font-mono mb-3">priya.mehta@sentinel.edu</span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <span className="w-[5px] h-[5px] rounded-full bg-status-secure" style={{ boxShadow: "0 0 4px #22C55E" }} />
                <span className="text-[10px] font-mono font-semibold text-status-secure">VERIFIED</span>
              </div>
            </div>
            <div className="px-5 pb-4 grid grid-cols-2 gap-2">
              <div className="px-3 py-2 rounded-lg bg-bg-base/30 border border-border-subtle/30 text-center">
                <span className="text-[9px] text-text-secondary/35 uppercase font-mono block">Role</span>
                <span className="text-[11px] text-text-primary font-mono font-medium">Proctor</span>
              </div>
              <div className="px-3 py-2 rounded-lg bg-bg-base/30 border border-border-subtle/30 text-center">
                <span className="text-[9px] text-text-secondary/35 uppercase font-mono block">Sessions</span>
                <span className="text-[11px] text-text-primary font-mono font-medium">47</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-border-subtle bg-bg-surface/40 overflow-hidden"
            style={{ backdropFilter: "blur(8px)", animation: "slideUp 0.4s ease-out 140ms both" }}>
            <div className="px-5 py-3 border-b border-border-subtle/50 flex items-center gap-2 bg-bg-surface/30">
              <span className="material-symbols-outlined text-[16px] text-accent-cyan">bolt</span>
              <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider font-mono">Quick Actions</span>
            </div>
            <div className="p-3 space-y-1.5">
              {[
                { label: "Export Data", icon: "download", desc: "Download all session data" },
                { label: "API Keys", icon: "key", desc: "Manage integration tokens" },
                { label: "Audit Log", icon: "history", desc: "View account activity" },
                { label: "Integrations", icon: "extension", desc: "Connect third-party tools" },
              ].map((action) => (
                <button
                  key={action.label}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left hover:bg-bg-panel/30 group"
                >
                  <span className="material-symbols-outlined text-[16px] text-text-secondary/25 group-hover:text-accent-blue transition-colors">
                    {action.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[12px] text-text-primary/70 font-ui block leading-tight group-hover:text-text-primary transition-colors">{action.label}</span>
                    <span className="text-[10px] text-text-secondary/30">{action.desc}</span>
                  </div>
                  <span className="material-symbols-outlined text-[14px] text-text-secondary/15 group-hover:text-text-secondary/40 transition-colors">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border overflow-hidden"
            style={{ borderColor: "rgba(239,68,68,0.12)", background: "rgba(239,68,68,0.02)", backdropFilter: "blur(8px)", animation: "slideUp 0.4s ease-out 220ms both" }}>
            <div className="px-5 py-3 border-b flex items-center gap-2"
              style={{ borderColor: "rgba(239,68,68,0.08)", background: "rgba(239,68,68,0.03)" }}>
              <span className="material-symbols-outlined text-[16px]" style={{ color: "rgba(239,68,68,0.5)" }}>warning</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider font-mono" style={{ color: "rgba(239,68,68,0.5)" }}>Danger Zone</span>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[11px] font-mono text-left transition-all duration-200 hover:bg-red-500/5"
                style={{ color: "rgba(239,68,68,0.5)" }}>
                <span className="material-symbols-outlined text-[14px]">delete_forever</span>
                <span>Delete All Session Data</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[11px] font-mono text-left transition-all duration-200 hover:bg-red-500/5"
                style={{ color: "rgba(239,68,68,0.5)" }}>
                <span className="material-symbols-outlined text-[14px]">logout</span>
                <span>Deactivate Account</span>
              </button>
            </div>
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between px-2 text-[9px] text-text-secondary/20 font-mono">
            <span>Sentinel Zero v1.0.0</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>encrypted</span>
              AES-256
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
