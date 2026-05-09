"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/layout/AuthCard";
import InputField from "@/components/ui/InputField";
import GradientButton from "@/components/ui/GradientButton";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/reset-confirmation");
    }, 800);
  };

  return (
    <AuthCard>
      <div className="text-center mb-8">
        <h2 className="text-xl font-brand font-bold text-text-primary mb-2">
          Reset Password
        </h2>
        <p className="text-sm text-text-secondary">
          Enter your email address and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <InputField
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <GradientButton type="submit" disabled={loading}>
          {loading ? "SENDING..." : "SEND RESET LINK"}
        </GradientButton>

        <p className="text-center text-sm text-text-secondary mt-2">
          <Link href="/login" className="text-accent-blue hover:underline">
            ← Back to Login
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
