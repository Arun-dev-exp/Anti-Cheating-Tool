"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GradientButton from "@/components/ui/GradientButton";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/system-check");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      <div className="auth-glow" />

      <div className="glass-card w-full max-w-[480px] p-12 relative z-10 animate-fade-in">
        {/* Logotype */}
        <div className="text-center mb-10">
          <div className="font-brand tracking-[0.3em] mb-3" style={{ fontSize: "28px", fontWeight: 700 }}>
            <span className="text-white">SENTINEL</span>{" "}
            <span className="text-accent-blue">ZERO</span>
          </div>
          <p className="text-text-secondary text-sm">Enter your session code to join</p>
        </div>

        <form onSubmit={handleJoin} className="flex flex-col gap-6">
          {/* Session Code Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-ui">
              SESSION CODE
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SZ-XXXX"
              className="input-field text-center font-mono tracking-[0.3em] !text-xl !h-[60px]"
              maxLength={7}
            />
          </div>

          <GradientButton type="submit" disabled={loading || code.length < 4}>
            {loading ? "CONNECTING..." : "JOIN SESSION"}
          </GradientButton>
        </form>
      </div>
    </div>
  );
}
