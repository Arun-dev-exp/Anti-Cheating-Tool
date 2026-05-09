"use client";
import { ReactNode, ButtonHTMLAttributes } from "react";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  variant?: "primary" | "ghost";
}

export default function GradientButton({
  children,
  className = "",
  fullWidth = true,
  variant = "primary",
  disabled,
  ...props
}: GradientButtonProps) {
  if (variant === "ghost") {
    return (
      <button
        className={`auth-btn-ghost ${fullWidth ? "w-full" : "w-auto px-8"} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      className={`auth-btn-primary ${fullWidth ? "w-full" : "w-auto px-8"} ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      {/* Shimmer overlay */}
      <div className="auth-btn-shimmer" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
