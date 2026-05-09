"use client";
import { InputHTMLAttributes, forwardRef, useState } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, icon, className = "", onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            className={`text-[11px] font-semibold uppercase tracking-[0.12em] font-ui transition-colors duration-200 ${
              focused ? "text-accent-blue" : "text-text-secondary"
            }`}
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <span
              className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                focused
                  ? "text-accent-blue"
                  : "text-text-secondary/40"
              }`}
              style={{ fontSize: "18px" }}
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`auth-input ${icon ? "!pl-11" : ""} ${error ? "!border-status-breach !shadow-glow-red" : ""} ${className}`}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
          {/* Focus glow underline */}
          <div
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-300 ${
              focused ? "w-full opacity-100" : "w-0 opacity-0"
            }`}
            style={{
              background: "linear-gradient(90deg, #3B82F6, #06B6D4)",
            }}
          />
        </div>
        {error && (
          <span className="text-[11px] text-status-breach flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
              error
            </span>
            {error}
          </span>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
