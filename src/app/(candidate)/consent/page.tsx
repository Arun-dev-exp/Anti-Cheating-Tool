"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/ui/InputField";
import GradientButton from "@/components/ui/GradientButton";
import { Shield, Eye, Keyboard, Monitor } from "lucide-react";

const monitoringItems = [
  { icon: <Keyboard size={20} />, title: "KEYSTROKE DYNAMICS", desc: "Typing patterns and cadence analysis", badge: "LOCAL" },
  { icon: <Eye size={20} />, title: "GAZE TRACKING", desc: "Eye movement and focus zone monitoring", badge: "LOCAL" },
  { icon: <Monitor size={20} />, title: "PROCESS MONITORING", desc: "Active application detection", badge: "LOCAL" },
  { icon: <Shield size={20} />, title: "LIVENESS DETECTION", desc: "Continuous face presence verification", badge: "LOCAL" },
];

export default function ConsentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [consented, setConsented] = useState(false);

  const handleConsent = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/join");
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      {/* Radial glow */}
      <div className="auth-glow" />

      <div className="glass-card w-full max-w-[600px] p-10 relative z-10 animate-fade-in">
        {/* Logotype */}
        <div className="text-center mb-8">
          <div className="font-brand tracking-[0.3em] mb-3" style={{ fontSize: "28px", fontWeight: 700 }}>
            <span className="text-white">SENTINEL</span>{" "}
            <span className="text-accent-blue">ZERO</span>
          </div>
          <p className="text-text-secondary text-sm">Monitoring Consent & Disclosure</p>
        </div>

        <div className="divider-gradient mb-8" />

        {/* Privacy Assurance */}
        <div className="glass-panel p-4 mb-6 flex items-center gap-3">
          <Shield size={24} className="text-status-secure shrink-0" />
          <div>
            <span className="text-sm font-semibold text-text-primary">No data leaves your device</span>
            <p className="text-xs text-text-secondary mt-0.5">
              All behavioral analysis runs locally in your browser. Only integrity scores are transmitted.
            </p>
          </div>
        </div>

        {/* Monitoring Modules */}
        <div className="mb-6">
          <span className="section-header block mb-4">MONITORING MODULES</span>
          <div className="grid grid-cols-1 gap-3">
            {monitoringItems.map((item) => (
              <div key={item.title} className="glass-panel p-4 flex items-center gap-4">
                <span className="text-accent-blue">{item.icon}</span>
                <div className="flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">{item.title}</span>
                  <p className="text-xs text-text-secondary mt-0.5">{item.desc}</p>
                </div>
                <span className="status-badge-secure !py-0.5 !px-2" style={{ fontSize: "9px" }}>
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="divider-gradient mb-6" />

        {/* Consent Form */}
        <form onSubmit={handleConsent} className="flex flex-col gap-5">
          <InputField
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consented}
              onChange={(e) => setConsented(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded bg-bg-surface border-border-subtle accent-accent-blue"
            />
            <span className="text-xs text-text-secondary leading-relaxed">
              I understand and consent to behavioral monitoring during this session.
              I acknowledge that all processing occurs locally on my device.
            </span>
          </label>

          <GradientButton type="submit" disabled={!consented || !name}>
            I CONSENT — BEGIN SESSION
          </GradientButton>
        </form>
      </div>
    </div>
  );
}
