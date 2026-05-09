"use client";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import GradientButton from "@/components/ui/GradientButton";
import GhostButton from "@/components/ui/GhostButton";
import { CheckCircle, Copy, Mail, Link2 } from "lucide-react";
import { useState } from "react";

export default function SessionInvitePage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <Sidebar variant="proctor" />
      <div className="ml-[220px]">
        <Topbar variant="proctor" />

        <main className="p-6 flex justify-center">
          <div className="glass-card w-full max-w-[560px] p-10 animate-fade-in">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-status-secure/10 border border-status-secure/30 flex items-center justify-center" style={{ boxShadow: "0 0 20px rgba(34, 197, 94, 0.2)" }}>
                <CheckCircle size={32} className="text-status-secure" />
              </div>
            </div>

            <h2 className="text-lg font-brand font-bold text-center text-text-primary mb-1">
              SESSION CREATED SUCCESSFULLY
            </h2>
            <p className="text-sm text-text-secondary text-center mb-8">
              Share the code below with your candidates
            </p>

            {/* Large Session Code */}
            <div className="glass-panel p-6 text-center mb-6">
              <span className="section-header block mb-2">SESSION CODE</span>
              <div className="font-mono text-4xl font-bold text-accent-blue tracking-[0.3em] mb-3">
                SZ-8821
              </div>
              <button
                onClick={() => handleCopy("SZ-8821")}
                className="inline-flex items-center gap-2 text-xs text-text-secondary hover:text-accent-blue transition-colors font-mono"
              >
                <Copy size={14} />
                {copied ? "COPIED!" : "COPY CODE"}
              </button>
            </div>

            {/* Shareable Link */}
            <div className="glass-panel p-4 mb-6">
              <span className="section-header block mb-2">SHAREABLE LINK</span>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value="https://sentinelzero.app/join?code=SZ-8821"
                  className="input-field !h-[40px] text-xs font-mono text-text-mono"
                />
                <button
                  onClick={() => handleCopy("https://sentinelzero.app/join?code=SZ-8821")}
                  className="shrink-0 w-10 h-10 rounded-input border border-border-subtle flex items-center justify-center text-text-secondary hover:text-accent-blue hover:border-accent-blue transition-all"
                >
                  <Link2 size={16} />
                </button>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="glass-panel p-4 mb-6 flex justify-center">
              <div className="w-[160px] h-[160px] bg-white rounded-lg flex items-center justify-center">
                <div className="w-[140px] h-[140px] grid grid-cols-7 grid-rows-7 gap-[2px]">
                  {Array.from({ length: 49 }).map((_, i) => (
                    <div key={i} className={`rounded-sm ${Math.random() > 0.4 ? "bg-black" : "bg-white"}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Share Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <GhostButton className="!text-xs">
                <Mail size={14} />
                EMAIL INVITE
              </GhostButton>
              <GhostButton onClick={() => handleCopy("Session: SZ-8821 | Link: https://sentinelzero.app/join?code=SZ-8821")} className="!text-xs">
                <Copy size={14} />
                COPY ALL
              </GhostButton>
            </div>

            <Link href="/proctor/session/SZ-8821/waiting">
              <GradientButton>
                OPEN WAITING ROOM →
              </GradientButton>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
