"use client";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import StatusBadge from "@/components/ui/StatusBadge";
import { AlertTriangle, Eye, XCircle, CheckCircle } from "lucide-react";

const alerts = [
  { id: 1, candidate: "Amit Joshi", severity: "breach" as const, message: "Unauthorized process: chrome.exe — external browser detected", time: "10:45:23", confidence: 94, module: "process" },
  { id: 2, candidate: "Amit Joshi", severity: "breach" as const, message: "Extended off-screen gaze — 12.4 seconds continuous", time: "10:44:18", confidence: 91, module: "gaze" },
  { id: 3, candidate: "Ravi Kumar", severity: "warning" as const, message: "Unusual key interval detected — 340ms avg (baseline: 42ms)", time: "10:42:05", confidence: 78, module: "keystroke" },
  { id: 4, candidate: "Ravi Kumar", severity: "warning" as const, message: "Multiple face candidates detected in frame", time: "10:40:12", confidence: 72, module: "liveness" },
  { id: 5, candidate: "Amit Joshi", severity: "breach" as const, message: "Copy-paste sequence detected — clipboard activity flagged", time: "10:38:44", confidence: 88, module: "keystroke" },
];

const severityIcon = { warning: <AlertTriangle size={16} className="text-status-suspicious" />, breach: <XCircle size={16} className="text-status-breach" /> };

export default function BreachDashboardPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <Sidebar variant="proctor" />
      <div className="ml-[220px]">
        <Topbar variant="proctor" />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-brand font-bold text-text-primary mb-1">Breach Dashboard</h1>
              <p className="text-sm text-text-secondary">{alerts.length} active alerts</p>
            </div>
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="grid grid-cols-7 gap-4 px-4 py-3 border-b border-border-subtle text-xs text-text-secondary uppercase tracking-wider font-ui">
              <span>Severity</span><span className="col-span-2">Alert</span><span>Candidate</span><span>Time</span><span>Confidence</span><span>Actions</span>
            </div>
            {alerts.map((a) => (
              <div key={a.id} className={`grid grid-cols-7 gap-4 px-4 py-3 border-b border-border-subtle/50 animate-slide-in ${a.severity === "breach" ? "bg-glow-breach/30" : ""}`}>
                <span className="flex items-center gap-2">
                  {severityIcon[a.severity]}
                  <StatusBadge status={a.severity === "breach" ? "breach" : "suspicious"} label={a.severity.toUpperCase()} />
                </span>
                <span className="text-sm text-text-primary col-span-2">{a.message}</span>
                <span className="text-sm text-text-primary">{a.candidate}</span>
                <span className="text-sm font-mono text-text-secondary">{a.time}</span>
                <span className="text-sm font-mono text-accent-blue">{a.confidence}%</span>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded border border-border-subtle hover:border-accent-blue hover:text-accent-blue transition-all text-text-secondary" title="Investigate"><Eye size={14} /></button>
                  <button className="p-1.5 rounded border border-border-subtle hover:border-status-secure hover:text-status-secure transition-all text-text-secondary" title="Dismiss"><CheckCircle size={14} /></button>
                  <button className="p-1.5 rounded border border-border-subtle hover:border-status-breach hover:text-status-breach transition-all text-text-secondary" title="Escalate"><AlertTriangle size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
