"use client";

import { ReactNode } from "react";

interface BrutalTextareaProps {
  label: string;
  icon?: ReactNode;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

export function BrutalTextarea({
  label,
  icon,
  placeholder,
  value,
  onChange,
  rows = 3
}: BrutalTextareaProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-2 sm:gap-3">
        {icon && <span className="w-3 h-3 sm:w-4 sm:h-4">{icon}</span>}
        {label}
      </label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="brutal-textarea font-medium border-black w-full h-16 sm:h-20 resize-none px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
        rows={rows}
      />
    </div>
  );
}