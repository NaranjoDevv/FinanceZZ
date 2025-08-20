"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReactNode } from "react";

interface BrutalSelectProps {
  label: string;
  icon?: ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  options: Array<{ value: string; label: string }>;
}

export function BrutalSelect({
  label,
  icon,
  placeholder,
  value,
  onChange,
  disabled = false,
  options
}: BrutalSelectProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-2 sm:gap-3">
        {icon && <span className="w-3 h-3 sm:w-4 sm:h-4">{icon}</span>}
        {label}
      </label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className={`h-10 sm:h-12 text-sm sm:text-base ${disabled ? "opacity-50" : ""}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}