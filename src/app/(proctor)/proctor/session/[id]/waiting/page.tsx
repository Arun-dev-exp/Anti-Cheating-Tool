"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import GradientButton from "@/components/ui/GradientButton";
import { CheckCircle, Clock } from "lucide-react";

const candidates = [
  { name: "Arjun Sharma", email: "arjun@example.com", systemCheck: true, joinedAt: "10:32 AM" },
  { name: "Meera Patel", email: "meera@example.com", systemCheck: true, joinedAt: "10:33 AM" },
  { name: "Ravi Kumar", email: "ravi@example.com", systemCheck: true, joinedAt: "10:35 AM" },
  { name: "Sneha Reddy", email: "sneha@example.com", systemCheck: false, joinedAt: "10:36 AM" },
  { name: "Amit Joshi", email: "amit@example.com", systemCheck: true, joinedAt: "10:37 AM" },
  { name: "Priya Nair", email: "priya@example.com", systemCheck: true, joinedAt: "10:38 AM" },
];

export default function ProctorWaitingPage() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const readyCount = candidates.filter((c) => c.systemCheck).length;

  const handleStart = () => {
    setStarting(true);
    setTimeout(() => router.push("/proctor/session/SZ-8821"), 800);
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <Sidebar variant="proctor" />
      <div className="ml-[220px]">
        <Topbar variant="proctor" />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-brand font-bold text-text-primary mb-1">Waiting Room</h1>
              <p className="text-sm text-text-secondary">Session <span className="font-mono text-accent-blue">SZ-8821</span></p>
            </div>
            <div className="flex items-center gap-4">
              <div className="glass-panel px-4 py-2">
                <span className="text-xs text-text-secondary">Joined: </span>
                <span className="font-mono text-accent-blue text-lg">{candidates.length}</span>
                <span className="text-xs text-text-secondary"> / 30</span>
              </div>
              <GradientButton onClick={handleStart} fullWidth={false} className="!w-auto !px-8" disabled={starting}>
                {starting ? "STARTING..." : "START SESSION"}
              </GradientButton>
            </div>
          </div>
          <div className="glass-panel overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-border-subtle text-xs text-text-secondary uppercase tracking-wider font-ui">
              <span>Candidate</span><span>Joined At</span><span>System Check</span><span>Status</span>
            </div>
            {candidates.map((c, i) => (
              <div key={c.email} className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-border-subtle/50 hover:bg-bg-panel/50 transition-colors animate-slide-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div><span className="text-sm text-text-primary block">{c.name}</span><span className="text-xs text-text-secondary font-mono">{c.email}</span></div>
                <span className="text-sm text-text-secondary font-mono flex items-center gap-2"><Clock size={14} />{c.joinedAt}</span>
                <span className="flex items-center gap-2">
                  {c.systemCheck ? <><CheckCircle size={14} className="text-status-secure" /><span className="text-xs text-status-secure font-mono">PASSED</span></> : <><Clock size={14} className="text-status-suspicious" /><span className="text-xs text-status-suspicious font-mono">PENDING</span></>}
                </span>
                <span><span className="status-badge-secure !text-[9px]">READY</span></span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
