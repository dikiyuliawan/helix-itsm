"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "cn";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(String(next))}
      items={options.map((option) => ({ value: option.value, label: option.label }))}
    >
      <SelectTrigger
        size="sm"
        aria-label={ariaLabel}
        className={cn("h-8 min-w-[9rem] border-dashed", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex-1">{option.label}</span>
            {option.count != null ? (
              <span className="text-xs text-muted-foreground tabular-nums">
                {option.count}
              </span>
            ) : null}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
