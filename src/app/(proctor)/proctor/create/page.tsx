"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import InputField from "@/components/ui/InputField";
import GradientButton from "@/components/ui/GradientButton";

const modules = [
  { key: "keystroke", label: "Keystroke Dynamics", icon: "⌨" },
  { key: "gaze", label: "Gaze Tracking", icon: "👁" },
  { key: "process", label: "Process Monitoring", icon: "⚙" },
  { key: "liveness", label: "Liveness Detection", icon: "🔲" },
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/proctor/session/SZ-8821/invite");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <Sidebar variant="proctor" />
      <div className="ml-[220px]">
        <Topbar variant="proctor" />

        <main className="p-6 max-w-2xl">
          <h1 className="text-xl font-brand font-bold text-text-primary mb-1">Create Session</h1>
          <p className="text-sm text-text-secondary mb-8">Configure a new proctored session</p>

          <form onSubmit={handleCreate} className="flex flex-col gap-6">
            <InputField
              label="Session Name"
              placeholder="e.g., Technical Interview — Batch 7"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Max Candidates"
                type="number"
                placeholder="30"
                value={maxCandidates}
                onChange={(e) => setMaxCandidates(e.target.value)}
              />
              <InputField
                label="Duration (minutes)"
                type="number"
                placeholder="120"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            {/* Monitoring Modules */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-ui block mb-3">
                Monitoring Modules
              </label>
              <div className="grid grid-cols-2 gap-3">
                {modules.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => toggleModule(m.key)}
                    className={`glass-panel p-4 flex items-center gap-3 transition-all duration-200 text-left ${
                      enabledModules[m.key]
                        ? "!border-accent-blue shadow-glow-blue"
                        : "opacity-50"
                    }`}
                  >
                    <span className="text-lg">{m.icon}</span>
                    <div>
                      <span className="text-sm text-text-primary block">{m.label}</span>
                      <span className="text-xs text-text-secondary">
                        {enabledModules[m.key] ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sensitivity */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-ui block mb-3">
                Sensitivity Level
              </label>
              <div className="flex gap-3">
                {(["low", "medium", "high"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSensitivity(level)}
                    className={`flex-1 h-[48px] rounded-input text-sm font-semibold uppercase tracking-wider transition-all duration-200 border ${
                      sensitivity === level
                        ? "border-accent-blue bg-accent-blue/10 text-accent-blue shadow-glow-blue"
                        : "border-border-subtle bg-bg-surface text-text-secondary hover:border-border-active"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="divider-gradient" />

            <GradientButton type="submit" disabled={loading || !name}>
              {loading ? "CREATING..." : "CREATE SESSION"}
            </GradientButton>
          </form>
        </main>
      </div>
    </div>
  );
}
