"use client";
import Link from "next/link";
import AuthCard from "@/components/layout/AuthCard";
import GradientButton from "@/components/ui/GradientButton";
import { CheckCircle } from "lucide-react";

export default function ResetConfirmationPage() {
  return (
    <AuthCard>
      <div className="text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-status-secure/10 border border-status-secure/30 flex items-center justify-center">
          <CheckCircle size={36} className="text-status-secure" />
        </div>

        <h2 className="text-xl font-brand font-bold text-text-primary mb-2">
          Reset Link Sent
        </h2>
        <p className="text-sm text-text-secondary mb-8">
          If an account exists for that email, we&apos;ve sent a password reset link.
          Check your inbox.
        </p>

        <Link href="/login">
          <GradientButton>BACK TO LOGIN</GradientButton>
        </Link>
      </div>
    </AuthCard>
  );
}
