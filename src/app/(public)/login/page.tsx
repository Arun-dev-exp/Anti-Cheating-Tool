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
