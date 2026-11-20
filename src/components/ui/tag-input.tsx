"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagInputProps {
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  validate?: (tag: string) => boolean;
  placeholder?: string;
  invalidMessage?: string;
  className?: string;
  inputMode?: "text" | "numeric";
  maxLength?: number;
}

/** Enter / comma / space adds a tag. Supports pasting a list. */
export function TagInput({
  id,
  value,
  onChange,
  validate,
  placeholder,
  invalidMessage = "Invalid value",
  className,
  inputMode,
  maxLength,
}: TagInputProps) {
  const [draft, setDraft] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  function commit(raw: string) {
    const parts = raw
      .split(/[\s,;]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const next = [...value];
    for (const part of parts) {
      if (validate && !validate(part)) {
        setError(`${invalidMessage}: ${part}`);
        setDraft(part);
        onChange(next);
        return;
      }
      if (!next.includes(part)) next.push(part);
    }
    setError(null);
    setDraft("");
    onChange(next);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Input
        id={id}
        value={draft}
        inputMode={inputMode}
        maxLength={maxLength ? maxLength * 20 : undefined}
        placeholder={placeholder}
        aria-invalid={!!error}
        onChange={(e) => {
          const v = e.target.value;
          if (/[\s,;]$/.test(v) && v.trim()) commit(v);
          else {
            setDraft(v);
            setError(null);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => draft && commit(draft)}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text");
          if (/[\s,;]/.test(text.trim())) {
            e.preventDefault();
            commit(text);
          }
        }}
      />
      {error && (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-brand-100 bg-brand-50 py-1 pl-3 pr-1.5 font-mono text-xs text-brand-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((t) => t !== tag))}
                className="rounded-full p-0.5 hover:bg-brand-100"
                aria-label={`Remove ${tag}`}
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
