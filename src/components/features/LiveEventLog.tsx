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
    <div className={`glass-panel overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
        <span className="section-header">LIVE EVENT LOG</span>
        <span className="text-xs text-text-secondary font-mono">{events.length} events</span>
      </div>

      {/* Scrollable Log */}
      <div className="overflow-y-auto" style={{ maxHeight }}>
        {events.map((event) => (
          <EventLogRow key={event.id} event={event} />
        ))}
        {events.length === 0 && (
          <div className="px-4 py-8 text-center text-text-secondary text-sm">
            No events recorded
          </div>
        )}
      </div>
    </div>
  );
}
