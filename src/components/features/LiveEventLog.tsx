"use client";
import EventLogRow from "@/components/ui/EventLogRow";
import { IntegrityEvent } from "@/types";

interface LiveEventLogProps {
  events: IntegrityEvent[];
  maxHeight?: string;
  className?: string;
}

export default function LiveEventLog({ events, maxHeight = "320px", className = "" }: LiveEventLogProps) {
  return (
    <div className={`rounded-xl border border-border-subtle bg-bg-surface/50 overflow-hidden ${className}`}
      style={{ backdropFilter: "blur(8px)" }}>
      {/* Header */}
      <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between bg-bg-surface/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-accent-cyan">receipt_long</span>
          <span className="section-header">LIVE EVENT LOG</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-status-secure" style={{ animation: "dotPulse 2s infinite" }} />
            <span className="text-[10px] text-status-secure font-mono">STREAMING</span>
          </div>
          <span className="text-[11px] text-text-secondary font-mono px-2 py-0.5 rounded-md bg-bg-base/50">{events.length} events</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="px-5 py-2 border-b border-border-subtle/50 flex items-center gap-3 text-[9px] font-mono text-text-secondary/50 uppercase tracking-wider">
        <span style={{ width: "70px" }}>Time</span>
        <span style={{ width: "16px" }} />
        <span style={{ width: "20px" }} />
        <span className="flex-1">Event</span>
        <span style={{ width: "40px" }} className="text-right">Conf</span>
      </div>

      {/* Scrollable Log */}
      <div className="overflow-y-auto" style={{ maxHeight }}>
        {events.map((event) => (
          <EventLogRow key={event.id} event={event} />
        ))}
        {events.length === 0 && (
          <div className="px-5 py-10 text-center text-text-secondary/50 text-sm flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-text-secondary/30">inbox</span>
            No events recorded
          </div>
        )}
      </div>
    </div>
  );
}
