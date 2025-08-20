"use client";

import { Input } from "@/components/ui/input";
import { ReactNode } from "react";

interface BrutalInputProps {
  label: string;
  icon?: ReactNode;
  error?: string | undefined;
  required?: boolean;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  step?: string;
  min?: string;
  className?: string;
  disabled?: boolean;
}

export function BrutalInput({
  label,
  icon,
  error,
  required = false,
  type = "text",
  placeholder,
  value,
  onChange,
  step,
  min,
  className = "",
  disabled = false
}: BrutalInputProps) {
  const inputClass = `
    brutal-input h-12 font-medium border-black w-full px-4 py-3
    ${error ? "border-red-500" : "border-black"}
    ${className}
  `;

  return (
    <div className="space-y-2 sm:space-y-3">
      <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-2 sm:gap-3">
        {icon && <span className="w-3 h-3 sm:w-4 sm:h-4">{icon}</span>}
        {label} {required && "*"}
      </label>
      <Input
        type={type}
        step={step}
        min={min}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass + " h-10 sm:h-12 text-sm sm:text-base"}
        disabled={disabled}
      />
      {error && (
        <p className="text-red-600 text-xs font-black uppercase tracking-wide">
          {error}
        </p>
      )}
    </div>
  );
}