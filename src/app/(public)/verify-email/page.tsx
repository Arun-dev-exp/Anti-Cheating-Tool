"use client";
import { useState } from "react";
import Link from "next/link";
import AuthCard from "@/components/layout/AuthCard";
import GradientButton from "@/components/ui/GradientButton";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  const [resent, setResent] = useState(false);

  const handleResend = () => {
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <AuthCard>
      <div className="text-center">
        {/* Envelope Icon */}
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center">
          <Mail size={36} className="text-accent-blue" />
        </div>

        <h2 className="text-xl font-brand font-bold text-text-primary mb-2">
          Verify Your Email
        </h2>
        <p className="text-sm text-text-secondary mb-2">
          We&apos;ve sent a verification link to
        </p>
        <p className="text-sm text-accent-blue font-mono mb-8">
          a••••n@example.com
        </p>

        {/* Tips */}
        <div className="glass-panel p-4 mb-8 text-left">
          <span className="section-header block mb-3">TIPS</span>
          <ul className="text-xs text-text-secondary space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-accent-blue mt-0.5">→</span>
              Check your spam or junk folder
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-blue mt-0.5">→</span>
              The link expires in 24 hours
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent-blue mt-0.5">→</span>
              Make sure you entered the correct email
            </li>
          </ul>
        </div>

        {/* Resend */}
        <GradientButton onClick={handleResend}>
          {resent ? "✓ VERIFICATION EMAIL SENT" : "RESEND VERIFICATION EMAIL"}
        </GradientButton>

        <p className="text-center text-sm text-text-secondary mt-6">
          <Link href="/login" className="text-accent-blue hover:underline">
            ← Back to Login
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
