"use client";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "panel";
}

export default function GlassCard({ children, className = "", variant = "default" }: GlassCardProps) {
  const base = variant === "panel" ? "glass-panel" : "glass-card";
  return <div className={`${base} ${className}`}>{children}</div>;
}
