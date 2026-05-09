"use client";
import { ReactNode, ButtonHTMLAttributes } from "react";

interface GhostButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export default function GhostButton({ children, className = "", ...props }: GhostButtonProps) {
  return (
    <button className={`btn-ghost ${className}`} {...props}>
      {children}
    </button>
  );
}
