"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import AuthCard from "@/components/layout/AuthCard";
import GradientButton from "@/components/ui/GradientButton";
import { Mail, CheckCircle2, Loader2, RefreshCw, ArrowRight, PartyPopper } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(emailFromUrl ? 60 : 0);
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mask email for display: ar***@example.com
  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, start, mid, domain) =>
        start + "•".repeat(Math.min(mid.length, 5)) + domain
      )
    : "your email";

  // Check verification status
  const checkVerification = useCallback(async () => {
    setChecking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Also recover email from session if we don't have it from URL
      if (session?.user?.email && !email) {
        setEmail(session.user.email);
      }

      if (session?.user?.email_confirmed_at) {
        setVerified(true);
      } else {
        // Try refreshing the session to get latest state
        const { data: { session: refreshed } } = await supabase.auth.refreshSession();
        if (refreshed?.user?.email && !email) {
          setEmail(refreshed.user.email);
        }
        if (refreshed?.user?.email_confirmed_at) {
          setVerified(true);
        }
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setChecking(false);
    }
  }, [email]);

  // Check on mount and when page gains focus (user comes back from email)
  useEffect(() => {
    checkVerification();

    const handleFocus = () => {
      checkVerification();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [checkVerification]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Resend verification email
  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    if (!email) {
      setError("No email address found. Please sign up again.");
      return;
    }

    setResending(true);
    setResent(false);
    setError(null);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (resendError) {
        // Parse rate-limit seconds from Supabase error like "...after 31 seconds."
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

  // ─── VERIFIED STATE ───
  if (verified) {
    return (
      <AuthCard>
        <div className="text-center">
          {/* Success animation container */}
          <div className="relative mx-auto mb-6 w-24 h-24">
            {/* Pulse rings */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "rgba(34, 197, 94, 0.08)",
                animation: "verifyPulse 2s ease-out infinite",
              }}
            />
            <div
              className="absolute inset-2 rounded-full"
              style={{
                background: "rgba(34, 197, 94, 0.12)",
                animation: "verifyPulse 2s 0.3s ease-out infinite",
              }}
            />
            {/* Icon */}
            <div
              className="absolute inset-0 flex items-center justify-center rounded-full border border-[#22C55E]/40"
              style={{
                background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(6, 182, 212, 0.08))",
                boxShadow: "0 0 40px rgba(34, 197, 94, 0.15)",
              }}
            >
              <CheckCircle2 size={42} className="text-[#22C55E]" strokeWidth={1.5} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <PartyPopper size={20} className="text-[#F59E0B]" />
            <h2 className="text-xl font-brand font-bold text-text-primary">
              Email Verified!
            </h2>
            <PartyPopper size={20} className="text-[#F59E0B]" style={{ transform: "scaleX(-1)" }} />
          </div>

          <p className="text-sm text-text-secondary mb-8">
            Your account is now active. You're all set to start proctoring.
          </p>

          {/* Success info panel */}
          <div
            className="p-4 mb-8 rounded-xl border border-[#22C55E]/20 text-left"
            style={{
              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.06), rgba(6, 182, 212, 0.03))",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#22C55E]" style={{ fontSize: "16px" }}>
                task_alt
              </span>
              <span className="text-[11px] uppercase tracking-[0.15em] font-mono text-[#22C55E]/80 font-medium">
                Account Ready
              </span>
            </div>
            <ul className="text-xs text-text-secondary space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#22C55E] mt-0.5">✓</span>
                Email verified successfully
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#22C55E] mt-0.5">✓</span>
                Proctor dashboard unlocked
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#22C55E] mt-0.5">✓</span>
                Ready to create sessions
              </li>
            </ul>
          </div>

          <GradientButton onClick={() => router.push("/login")}>
            CONTINUE TO LOGIN
            <ArrowRight size={16} />
          </GradientButton>
        </div>

        {/* Keyframe for verified pulse */}
        <style jsx>{`
          @keyframes verifyPulse {
            0% {
              transform: scale(1);
              opacity: 0.6;
            }
            100% {
              transform: scale(1.6);
              opacity: 0;
            }
          }
        `}</style>
      </AuthCard>
    );
  }

  // ─── PENDING STATE ───
  return (
    <AuthCard>
      <div className="text-center">
        {/* Animated Mail Icon */}
        <div className="relative mx-auto mb-6 w-24 h-24">
          {/* Outer pulse ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "rgba(59, 130, 246, 0.06)",
              animation: "emailPulse 3s ease-in-out infinite",
            }}
          />
          {/* Inner glow */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full border border-accent-blue/30"
            style={{
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(6, 182, 212, 0.06))",
              boxShadow: "0 0 40px rgba(59, 130, 246, 0.12)",
            }}
          >
            <Mail size={38} className="text-accent-blue" strokeWidth={1.5} />
          </div>
          {/* Floating notification dot */}
          <div
            className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#F59E0B] flex items-center justify-center"
            style={{
              boxShadow: "0 0 12px rgba(245, 158, 11, 0.4)",
              animation: "notifBounce 2s ease-in-out infinite",
            }}
          >
            <span className="text-[9px] font-bold text-black">1</span>
          </div>
        </div>

        <h2 className="text-xl font-brand font-bold text-text-primary mb-2">
          Check Your Inbox
        </h2>
        <p className="text-sm text-text-secondary mb-1">
          We&apos;ve sent a verification link to
        </p>
        <p className="text-sm text-accent-blue font-mono mb-6 break-all">
          {maskedEmail}
        </p>

        {/* Status indicator */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-mono mb-8"
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            color: "#F59E0B",
          }}
        >
          <div
            className="w-2 h-2 rounded-full bg-[#F59E0B]"
            style={{ animation: "statusBlink 1.5s ease-in-out infinite" }}
          />
          Awaiting verification
        </div>

        {/* Tips panel */}
        <div
          className="p-4 mb-6 rounded-xl border border-border-subtle/50 text-left"
          style={{ background: "rgba(255, 255, 255, 0.02)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-accent-blue/60" style={{ fontSize: "14px" }}>
              tips_and_updates
            </span>
            <span className="text-[11px] uppercase tracking-[0.15em] font-mono text-text-secondary/50 font-medium">
              Tips
            </span>
          </div>
          <ul className="text-xs text-text-secondary space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="text-accent-blue mt-0.5 flex-shrink-0">→</span>
              Check your spam or junk folder
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-blue mt-0.5 flex-shrink-0">→</span>
              The link expires in 24 hours
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-blue mt-0.5 flex-shrink-0">→</span>
              Click the link, then come back and refresh this page
            </li>
          </ul>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 text-[13px] font-mono text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl mb-4 text-left">
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {/* Check verification status button */}
          <button
            onClick={checkVerification}
            disabled={checking}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[13px] font-mono font-medium transition-all duration-200 border border-border-subtle/50 hover:border-accent-blue/30 hover:bg-accent-blue/5 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "rgba(255, 255, 255, 0.02)" }}
          >
            {checking ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                CHECKING STATUS…
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                I&apos;VE VERIFIED — CHECK NOW
              </>
            )}
          </button>

          {/* Resend button */}
          <GradientButton onClick={handleResend} disabled={resending || cooldown > 0}>
            {resending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                SENDING…
              </>
            ) : resent ? (
              <>
                <CheckCircle2 size={16} />
                EMAIL SENT SUCCESSFULLY
              </>
            ) : cooldown > 0 ? (
              <>RESEND IN {cooldown}s</>
            ) : (
              <>
                <Mail size={16} />
                RESEND VERIFICATION EMAIL
              </>
            )}
          </GradientButton>
        </div>

        <p className="text-center text-[13px] text-text-secondary mt-6 font-ui">
          Wrong email?{" "}
          <Link href="/signup" className="text-accent-blue hover:text-accent-cyan transition-colors duration-200 font-medium">
            Sign up again
          </Link>
          <span className="mx-2 text-text-secondary/30">·</span>
          <Link href="/login" className="text-accent-blue hover:text-accent-cyan transition-colors duration-200 font-medium">
            Back to Login
          </Link>
        </p>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes emailPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.1;
          }
        }
        @keyframes notifBounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        @keyframes statusBlink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </AuthCard>
  );
}
