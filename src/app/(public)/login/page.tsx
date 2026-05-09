"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/layout/AuthCard";
import InputField from "@/components/ui/InputField";
import GradientButton from "@/components/ui/GradientButton";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (email.includes("proctor")) {
        router.push("/proctor");
      } else {
        router.push("/consent");
      }
    }, 800);
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
          <div className="divider-gradient flex-1" />
          <span className="text-[11px] text-text-secondary/50 font-mono uppercase tracking-widest">
            or
          </span>
          <div className="divider-gradient flex-1" />
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          className="auth-btn-oauth group"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Continue with Google</span>
          <ArrowRight size={14} className="ml-auto text-text-secondary/30 group-hover:text-text-secondary/60 transition-colors" />
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
