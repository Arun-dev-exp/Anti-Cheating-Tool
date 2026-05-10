"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/layout/AuthCard";
import InputField from "@/components/ui/InputField";
import GradientButton from "@/components/ui/GradientButton";
import { Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;
    
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: "proctor",
        }
      }
    });

    if (error) {
      // Account already exists and email was already sent — just redirect
      if (error.message.toLowerCase().includes("rate limit")) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(error.message);
      setLoading(false);
    } else {
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

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
  const strengthColor = ["", "#EF4444", "#F59E0B", "#06B6D4", "#22C55E"][
    strength
  ];

  return (
    <AuthCard>
      {/* Page Header */}
      <div className="mb-7">
        <h1 className="text-[22px] font-semibold text-text-primary font-ui mb-2">
          Create your account
        </h1>
        <p className="text-text-secondary text-[14px] font-ui">
          Get started with Sentinel Zero in seconds
        </p>
      </div>

      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 text-[13px] font-mono text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl">
            {error}
          </div>
        )}

        {/* Continue with Google — shown first for signup convenience */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={googleLoading}
          className="group relative w-full flex items-center justify-center gap-3 h-[46px] rounded-xl border border-border-subtle/80 bg-white/[0.03] hover:bg-white/[0.07] hover:border-border-active/60 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <Loader2 size={16} className="animate-spin text-text-secondary" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          )}
          <span className="text-[13px] font-medium text-text-secondary group-hover:text-text-primary transition-colors duration-200 font-ui">
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-1">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
          <span className="text-[11px] text-text-secondary/50 font-mono tracking-widest uppercase">or</span>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
        </div>

        {/* Name + Email row on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Full Name"
            type="text"
            placeholder="Arjun Sharma"
            icon="person"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <InputField
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon="mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password field */}
        <div className="relative">
          <InputField
            label="Password"
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

        {/* Confirm password field */}
        <div className="relative">
          <InputField
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your password"
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

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer group mt-1">
          <div className="relative w-4 h-4 mt-0.5 flex-shrink-0">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-4 h-4 rounded-[4px] border border-border-subtle bg-bg-surface peer-checked:bg-accent-blue peer-checked:border-accent-blue transition-all duration-200" />
            <svg
              className="absolute top-[3px] left-[3px] w-[10px] h-[10px] text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
              viewBox="0 0 10 10"
              fill="none"
            >
              <path
                d="M2 5L4 7L8 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-[12px] text-text-secondary leading-relaxed group-hover:text-text-secondary/80 transition-colors">
            I agree to the{" "}
            <span className="text-accent-blue hover:text-accent-cyan cursor-pointer transition-colors">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-accent-blue hover:text-accent-cyan cursor-pointer transition-colors">
              Privacy Policy
            </span>
          </span>
        </label>

        {/* Submit */}
        <GradientButton type="submit" disabled={loading || !agreed}>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              CREATING ACCOUNT…
            </>
          ) : (
            <>
              CREATE ACCOUNT
              <ArrowRight size={16} />
            </>
          )}
        </GradientButton>

        <p className="text-center text-[13px] text-text-secondary mt-2 font-ui">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-accent-blue hover:text-accent-cyan transition-colors duration-200 font-medium"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
