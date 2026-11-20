"use client";

import { cn } from "@/lib/utils";

interface OptionCardsProps {
  options: ReadonlyArray<{ value: string; label: string; description?: string }>;
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function OptionCards({ options, value, onChange, label }: OptionCardsProps) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-3 sm:grid-cols-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600",
            value === o.value ? "border-brand-600 bg-brand-50" : "border-line-strong bg-white hover:bg-surface",
          )}
        >
          <span className="block text-sm font-semibold text-navy-900">{o.label}</span>
          {o.description && <span className="mt-1 block text-xs text-navy-500">{o.description}</span>}
        </button>
      ))}
    </div>
  );
}
