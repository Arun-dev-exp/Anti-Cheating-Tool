"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/layout/AuthCard";
import InputField from "@/components/ui/InputField";
import GradientButton from "@/components/ui/GradientButton";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/proctor");
    }
  };

  const handleGoogleLogin = async () => {
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

  return (
    <AuthCard>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-text-primary font-ui mb-2">
          Welcome back
        </h1>
        <p className="text-text-secondary text-[14px] font-ui">
          Sign in to access your proctoring dashboard
        </p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        {error && (
          <div className="p-3 text-[13px] font-mono text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl">
            {error}
          </div>
        )}
        <InputField
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon="mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative">
          <InputField
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
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

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative w-4 h-4">
              <input
                type="checkbox"
                className="peer sr-only"
              />
              <div className="w-4 h-4 rounded-[4px] border border-border-subtle bg-bg-surface peer-checked:bg-accent-blue peer-checked:border-accent-blue transition-all duration-200" />
              <svg
                className="absolute top-[3px] left-[3px] w-[10px] h-[10px] text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                viewBox="0 0 10 10"
                fill="none"
              >
                <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[12px] text-text-secondary group-hover:text-text-primary transition-colors">
              Remember me
            </span>
          </label>
          <Link
            href="/forgot-password"
            className="text-[12px] text-accent-blue hover:text-accent-cyan transition-colors duration-200"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <GradientButton type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              AUTHENTICATING…
            </>
          ) : (
            <>
              SIGN IN
              <ArrowRight size={16} />
            </>
          )}
        </GradientButton>

        {/* Divider */}
        <div className="flex items-center gap-4 my-1">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
          <span className="text-[11px] text-text-secondary/50 font-mono tracking-widest uppercase">or</span>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
        </div>

        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
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

        {/* Sign Up Link */}
        <p className="text-center text-[13px] text-text-secondary mt-3 font-ui">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-accent-blue hover:text-accent-cyan transition-colors duration-200 font-medium"
          >
            Create account
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
