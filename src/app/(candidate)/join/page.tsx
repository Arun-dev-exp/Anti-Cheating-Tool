"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import GradientButton from "@/components/ui/GradientButton";
import { useSession } from "@/context/SessionContext";
import { getSessionByCode } from "@/lib/sessions";

export default function JoinPage() {
  const router = useRouter();
  const { setSessionData } = useSession();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const char = value.toUpperCase().slice(-1);
    if (!/^[A-Z0-9]$/.test(char) && char !== "") return;
    const next = [...code];
    next[index] = char;
    setCode(next);
    setError(null);
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocused(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocused(index - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    const next = [...code];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setCode(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
    setFocused(focusIdx);
  };

  const fullCode = code.join("");
  const isReady = fullCode.length === 6;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady) return;
    setLoading(true);
    setError(null);

    try {
      const session = await getSessionByCode(fullCode);
      
      if (!session) {
        setError("Invalid session code. Please check and try again.");
        setLoading(false);
        return;
      }

      if (session.status === "ended") {
        setError("This session has already ended.");
        setLoading(false);
        return;
      }

      // Store session data in context for downstream pages
      setSessionData({
        sessionId: session.id,
        sessionCode: session.code,
        sessionTitle: session.title,
        interviewerName: session.interviewer_name,
        durationMinutes: session.duration_minutes,
      });

      router.push("/consent");
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle, #3B82F6 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      {/* Orbital rings */}
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.06]"
        style={{ border: "1px solid #3B82F6", borderRadius: "50%", animation: "orbitSpin 25s linear infinite" }} />
      <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03]"
        style={{ border: "1px solid #06B6D4", borderRadius: "50%", animation: "orbitSpin 40s linear infinite reverse" }} />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)", animation: "pulseGlow 6s infinite alternate" }} />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-[520px]" style={{ animation: "scaleIn 0.5s ease forwards" }}>
        {/* Glow behind card */}
        <div className="absolute -inset-1 rounded-[20px] opacity-40 blur-xl pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.1))" }} />

        <div className="relative bg-bg-panel/90 border border-border-subtle rounded-[20px] p-10 md:p-12 overflow-hidden"
          style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 25px 80px rgba(0,0,0,0.4), 0 0 40px rgba(59,130,246,0.06)" }}>

          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
            style={{ background: "radial-gradient(circle at top right, rgba(59,130,246,0.08), transparent 70%)" }} />

          {/* Shield icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
              style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.1))", border: "1px solid rgba(59,130,246,0.2)" }}>
              <span className="material-symbols-outlined text-[28px] text-accent-blue">shield</span>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-status-secure flex items-center justify-center">
                <span className="material-symbols-outlined text-[10px] text-bg-base font-bold">check</span>
              </div>
            </div>
          </div>

          {/* Brand */}
          <div className="text-center mb-2">
            <div className="font-brand tracking-[0.25em] text-[22px] font-bold">
              <span className="text-text-primary">SENTINEL</span>{" "}
              <span className="text-accent-blue">ZERO</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-ui text-[24px] font-semibold text-text-primary mb-2">Join Session</h1>
            <p className="text-text-secondary text-[14px] leading-relaxed">
              Enter the 6-character code provided by your interviewer
            </p>
          </div>

          <form onSubmit={handleJoin} className="flex flex-col gap-8">
            {/* Code input grid */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-text-secondary font-mono mb-3 text-center">
                SESSION CODE
              </label>
              <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
                {code.map((char, i) => (
                  <div key={i} className="relative">
                    {i === 3 && (
                      <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-text-secondary/40" />
                    )}
                    <input
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      value={char}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onFocus={() => setFocused(i)}
                      className="w-[56px] h-[64px] text-center font-mono text-[24px] font-bold rounded-xl border-2 outline-none transition-all duration-300 bg-bg-surface text-text-primary"
                      style={{
                        borderColor: error ? "#EF4444" : focused === i ? "#3B82F6" : char ? "rgba(59,130,246,0.3)" : "rgba(26,26,62,0.8)",
                        boxShadow: focused === i ? "0 0 20px rgba(59,130,246,0.15), inset 0 0 20px rgba(59,130,246,0.05)" : char ? "0 0 10px rgba(59,130,246,0.05)" : "none",
                      }}
                      maxLength={1}
                    />
                    {/* Fill indicator */}
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300"
                      style={{
                        width: char ? "20px" : "0px",
                        background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
                      }} />
                  </div>
                ))}
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center justify-center gap-2 mt-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <span className="material-symbols-outlined text-[16px] text-red-400">error</span>
                  <span className="text-[12px] text-red-400 font-medium">{error}</span>
                </div>
              )}

              {/* Progress dots */}
              {!error && (
                <div className="flex justify-center gap-1.5 mt-4">
                  {code.map((char, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                      style={{ backgroundColor: char ? "#3B82F6" : "rgba(26,26,62,0.8)" }} />
                  ))}
                </div>
              )}
            </div>

            {/* Join button */}
            <GradientButton type="submit" disabled={loading || !isReady}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  VERIFYING CODE...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  JOIN SESSION
                  {isReady && <span className="material-symbols-outlined text-[16px]">arrow_forward</span>}
                </span>
              )}
            </GradientButton>
          </form>

          {/* Divider */}
          <div className="my-6 h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(45,45,107,0.6), transparent)" }} />

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-text-secondary/70 font-ui">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-status-secure">verified_user</span>
              Encrypted
            </span>
            <span className="w-0.5 h-0.5 rounded-full bg-text-secondary/30" />
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-accent-cyan">lock</span>
              Private
            </span>
            <span className="w-0.5 h-0.5 rounded-full bg-text-secondary/30" />
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-accent-blue">wifi_off</span>
              On-Device
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
