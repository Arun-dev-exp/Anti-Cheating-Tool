"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthCard from "@/components/layout/AuthCard";
import GradientButton from "@/components/ui/GradientButton";
import { Mail, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetConfirmationPage() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(emailParam ? 60 : 0);
  const [error, setError] = useState<string | null>(null);

  // Mask email
  const maskedEmail = emailParam
    ? emailParam.replace(/^(.{2})(.*)(@.*)$/, (_, start, mid, domain) =>
        start + "•".repeat(Math.min(mid.length, 5)) + domain
      )
    : "your email";

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Resend reset email
  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    if (!emailParam) {
      setError("No email address found. Please go back and try again.");
      return;
    }

    setResending(true);
    setResent(false);
    setError(null);

    try {
      const { error: resendError } = await supabase.auth.resetPasswordForEmail(emailParam, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resendError) {
        const match = resendError.message.match(/after (\d+) second/);
        if (match) {
          setCooldown(parseInt(match[1], 10));
        } else {
          setError(resendError.message);
        }
      } else {
        setResent(true);
        setCooldown(60);
        setTimeout(() => setResent(false), 4000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard>
      <div className="text-center">
        {/* Success Icon */}
        <div className="relative mx-auto mb-6 w-24 h-24">
          {/* Pulse ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "rgba(34, 197, 94, 0.06)",
              animation: "confirmPulse 3s ease-in-out infinite",
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full border border-[#22C55E]/30"
            style={{
              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(6, 182, 212, 0.06))",
              boxShadow: "0 0 40px rgba(34, 197, 94, 0.1)",
            }}
          >
            <Mail size={38} className="text-[#22C55E]" strokeWidth={1.5} />
          </div>
          {/* Check badge */}
          <div
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#22C55E] flex items-center justify-center border-2 border-bg-base"
            style={{ boxShadow: "0 0 12px rgba(34, 197, 94, 0.4)" }}
          >
            <CheckCircle2 size={18} className="text-white" />
          </div>
        </div>

        <h2 className="text-xl font-brand font-bold text-text-primary mb-2">
          Reset Link Sent
        </h2>
        <p className="text-sm text-text-secondary mb-1">
          We&apos;ve sent a password reset link to
        </p>
        <p className="text-sm text-accent-blue font-mono mb-6 break-all">
          {maskedEmail}
        </p>

        {/* Status */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-mono mb-8"
          style={{
            background: "rgba(34, 197, 94, 0.08)",
            border: "1px solid rgba(34, 197, 94, 0.25)",
            color: "#22C55E",
          }}
        >
          <CheckCircle2 size={14} />
          Email sent successfully
        </div>

        {/* Instructions */}
        <div
          className="p-4 mb-6 rounded-xl border border-border-subtle/50 text-left"
          style={{ background: "rgba(255, 255, 255, 0.02)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-accent-blue/60" style={{ fontSize: "14px" }}>
              checklist
            </span>
            <span className="text-[11px] uppercase tracking-[0.15em] font-mono text-text-secondary/50 font-medium">
              Next Steps
            </span>
          </div>
          <ol className="text-xs text-text-secondary space-y-2.5 list-decimal list-inside">
            <li>Open the email and click the reset link</li>
            <li>Choose a new strong password</li>
            <li>Sign in with your new password</li>
          </ol>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 text-[13px] font-mono text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl mb-4 text-left">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {/* Resend */}
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[13px] font-mono font-medium transition-all duration-200 border border-border-subtle/50 hover:border-accent-blue/30 hover:bg-accent-blue/5 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "rgba(255, 255, 255, 0.02)" }}
          >
            {resending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                SENDING…
              </>
            ) : resent ? (
              <>
                <CheckCircle2 size={15} className="text-[#22C55E]" />
                EMAIL SENT AGAIN
              </>
            ) : cooldown > 0 ? (
              <>RESEND IN {cooldown}s</>
            ) : (
              <>
                <Mail size={15} />
                RESEND RESET EMAIL
              </>
            )}
          </button>

          {/* Back to login */}
          <Link href="/login">
            <GradientButton>
              BACK TO LOGIN
              <ArrowRight size={16} />
            </GradientButton>
          </Link>
        </div>

        <p className="text-center text-[13px] text-text-secondary mt-6 font-ui">
          Wrong email?{" "}
          <Link href="/forgot-password" className="text-accent-blue hover:text-accent-cyan transition-colors duration-200 font-medium">
            Try again
          </Link>
        </p>
      </div>

      <style jsx>{`
        @keyframes confirmPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.12);
            opacity: 0.1;
          }
        }
      `}</style>
    </AuthCard>
  );
}
