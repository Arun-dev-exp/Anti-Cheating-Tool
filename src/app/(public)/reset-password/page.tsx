"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/layout/AuthCard";
import InputField from "@/components/ui/InputField";
import GradientButton from "@/components/ui/GradientButton";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Check,
  ShieldCheck,
  CheckCircle2,
  PartyPopper,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checking, setChecking] = useState(true);

  // Supabase sets the session automatically when the user arrives via the reset link.
  // We wait for the auth state change to confirm.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setSessionReady(true);
          setChecking(false);
        }
      }
    );

    // Also check if session already exists (e.g. page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* Password strength */
  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#EF4444", "#F59E0B", "#06B6D4", "#22C55E"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // ─── LOADING STATE ───
  if (checking) {
    return (
      <AuthCard>
        <div className="text-center py-12">
          <Loader2 size={32} className="text-accent-blue animate-spin mx-auto mb-4" />
          <p className="text-sm text-text-secondary font-mono">
            Verifying reset link…
          </p>
        </div>
      </AuthCard>
    );
  }

  // ─── INVALID/EXPIRED LINK ───
  if (!sessionReady && !checking) {
    return (
      <AuthCard>
        <div className="text-center">
          <div
            className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center border border-[#EF4444]/30"
            style={{
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.04))",
            }}
          >
            <span className="material-symbols-outlined text-[#EF4444]" style={{ fontSize: "36px" }}>
              link_off
            </span>
          </div>

          <h2 className="text-xl font-brand font-bold text-text-primary mb-2">
            Invalid or Expired Link
          </h2>
          <p className="text-sm text-text-secondary mb-8">
            This password reset link is invalid or has expired.
            <br />
            Please request a new one.
          </p>

          <Link href="/forgot-password">
            <GradientButton>
              REQUEST NEW LINK
              <ArrowRight size={16} />
            </GradientButton>
          </Link>

          <p className="text-center text-[13px] text-text-secondary mt-6 font-ui">
            <Link href="/login" className="text-accent-blue hover:text-accent-cyan transition-colors duration-200 font-medium">
              ← Back to Login
            </Link>
          </p>
        </div>
      </AuthCard>
    );
  }

  // ─── SUCCESS STATE ───
  if (success) {
    return (
      <AuthCard>
        <div className="text-center">
          {/* Animated success */}
          <div className="relative mx-auto mb-6 w-24 h-24">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "rgba(34, 197, 94, 0.08)",
                animation: "successPulse 2s ease-out infinite",
              }}
            />
            <div
              className="absolute inset-2 rounded-full"
              style={{
                background: "rgba(34, 197, 94, 0.12)",
                animation: "successPulse 2s 0.3s ease-out infinite",
              }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center rounded-full border border-[#22C55E]/40"
              style={{
                background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(6, 182, 212, 0.08))",
                boxShadow: "0 0 40px rgba(34, 197, 94, 0.15)",
              }}
            >
              <ShieldCheck size={42} className="text-[#22C55E]" strokeWidth={1.5} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <PartyPopper size={20} className="text-[#F59E0B]" />
            <h2 className="text-xl font-brand font-bold text-text-primary">
              Password Updated!
            </h2>
            <PartyPopper size={20} className="text-[#F59E0B]" style={{ transform: "scaleX(-1)" }} />
          </div>

          <p className="text-sm text-text-secondary mb-8">
            Your password has been changed successfully. You can now sign in with your new password.
          </p>

          {/* Success panel */}
          <div
            className="p-4 mb-8 rounded-xl border border-[#22C55E]/20 text-left"
            style={{
              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.06), rgba(6, 182, 212, 0.03))",
            }}
          >
            <ul className="text-xs text-text-secondary space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#22C55E] mt-0.5">✓</span>
                Password updated securely
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#22C55E] mt-0.5">✓</span>
                All other sessions signed out
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#22C55E] mt-0.5">✓</span>
                Ready to sign in
              </li>
            </ul>
          </div>

          <GradientButton onClick={() => router.push("/login")}>
            CONTINUE TO LOGIN
            <ArrowRight size={16} />
          </GradientButton>
        </div>

        <style jsx>{`
          @keyframes successPulse {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.6); opacity: 0; }
          }
        `}</style>
      </AuthCard>
    );
  }

  // ─── RESET FORM ───
  return (
    <AuthCard>
      <div className="mb-7 text-center">
        {/* Icon */}
        <div
          className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center border border-accent-blue/20"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.06))",
            boxShadow: "0 0 30px rgba(59, 130, 246, 0.08)",
          }}
        >
          <ShieldCheck size={28} className="text-accent-blue" strokeWidth={1.5} />
        </div>

        <h1 className="text-[22px] font-semibold text-text-primary font-ui mb-2">
          Set New Password
        </h1>
        <p className="text-text-secondary text-[14px] font-ui">
          Choose a strong password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 text-[13px] font-mono text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl">
            {error}
          </div>
        )}

        {/* New Password */}
        <div className="relative">
          <InputField
            label="New Password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            icon="lock"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[36px] text-text-secondary/50 hover:text-text-primary transition-colors duration-200 p-1 rounded-md hover:bg-white/5"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Password strength bar */}
        {password.length > 0 && (
          <div className="flex items-center gap-3 -mt-1">
            <div className="flex gap-1 flex-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-[3px] flex-1 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor:
                      i <= strength ? strengthColor : "rgba(255,255,255,0.06)",
                  }}
                />
              ))}
            </div>
            <span
              className="text-[11px] font-mono font-medium transition-colors duration-200"
              style={{ color: strengthColor }}
            >
              {strengthLabel}
            </span>
          </div>
        )}

        {/* Confirm Password */}
        <div className="relative">
          <InputField
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your new password"
            icon="lock"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={
              confirmPassword.length > 0 && confirmPassword !== password
                ? "Passwords don't match"
                : undefined
            }
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[36px] text-text-secondary/50 hover:text-text-primary transition-colors duration-200 p-1 rounded-md hover:bg-white/5"
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          {/* Match indicator */}
          {confirmPassword.length > 0 && confirmPassword === password && (
            <div className="absolute right-10 top-[38px] text-status-secure">
              <Check size={16} />
            </div>
          )}
        </div>

        {/* Submit */}
        <GradientButton
          type="submit"
          disabled={loading || password.length < 8 || password !== confirmPassword}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              UPDATING PASSWORD…
            </>
          ) : (
            <>
              UPDATE PASSWORD
              <ArrowRight size={16} />
            </>
          )}
        </GradientButton>

        <p className="text-center text-[13px] text-text-secondary mt-2 font-ui">
          <Link
            href="/login"
            className="text-accent-blue hover:text-accent-cyan transition-colors duration-200 font-medium"
          >
            ← Back to Login
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
