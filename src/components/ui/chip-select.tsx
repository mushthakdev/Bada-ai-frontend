"use client";

import { cn } from "@/lib/utils";

interface ChipSelectProps {
  options: ReadonlyArray<{ value: string; label: string }>;
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
}

export function ChipSelect({ options, value, onChange, label }: ChipSelectProps) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const selected = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? value.filter((v) => v !== o.value) : [...value, o.value])}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600",
              selected
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-line-strong bg-white text-navy-600 hover:bg-surface",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
