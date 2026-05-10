"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/layout/AuthCard";
import InputField from "@/components/ui/InputField";
import GradientButton from "@/components/ui/GradientButton";
import { Loader2, ArrowRight, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        // Handle rate limiting
        if (resetError.message.toLowerCase().includes("rate limit")) {
          router.push(`/reset-confirmation?email=${encodeURIComponent(email)}`);
          return;
        }
        setError(resetError.message);
        setLoading(false);
      } else {
        router.push(`/reset-confirmation?email=${encodeURIComponent(email)}`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className="text-center mb-7">
        {/* Icon */}
        <div
          className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center border border-accent-blue/20"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.06))",
            boxShadow: "0 0 30px rgba(59, 130, 246, 0.08)",
          }}
        >
          <KeyRound size={28} className="text-accent-blue" strokeWidth={1.5} />
        </div>

        <h2 className="text-[22px] font-semibold text-text-primary font-ui mb-2">
          Reset Password
        </h2>
        <p className="text-[14px] text-text-secondary font-ui">
          Enter your email and we&apos;ll send you a secure reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="p-3 text-[13px] font-mono text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl">
            {error}
          </div>
        )}

        <InputField
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon="mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Info panel */}
        <div
          className="p-3.5 rounded-xl border border-border-subtle/50 text-left"
          style={{ background: "rgba(255, 255, 255, 0.02)" }}
        >
          <ul className="text-[12px] text-text-secondary space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-accent-blue mt-0.5 flex-shrink-0">→</span>
              A reset link will be sent if the account exists
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-blue mt-0.5 flex-shrink-0">→</span>
              The link expires in 1 hour
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-blue mt-0.5 flex-shrink-0">→</span>
              Check your spam folder if you don&apos;t see it
            </li>
          </ul>
        </div>

        <GradientButton type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              SENDING RESET LINK…
            </>
          ) : (
            <>
              SEND RESET LINK
              <ArrowRight size={16} />
            </>
          )}
        </GradientButton>

        <p className="text-center text-[13px] text-text-secondary mt-1 font-ui">
          Remember your password?{" "}
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
