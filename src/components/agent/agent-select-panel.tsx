"use client";

import { useMemo, useState } from "react";
import { Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AssistantSelect } from "@/services/ai";
import { cn } from "@/lib/utils";

export function AgentSelectPanel({
  select,
  disabled,
  onSubmit,
}: {
  select: AssistantSelect;
  disabled?: boolean;
  onSubmit: (value: string) => void;
}) {
  const isMulti = select.mode === "multi";
  const [picked, setPicked] = useState<string[]>([]);
  const [single, setSingle] = useState<string>("");
  const [custom, setCustom] = useState("");

  const allValues = useMemo(() => select.options.map((o) => o.value), [select.options]);
  const allSelected = isMulti && allValues.length > 0 && allValues.every((v) => picked.includes(v));

  const toggle = (value: string) => {
    if (disabled) return;
    if (isMulti) {
      setPicked((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
      );
    } else {
      setSingle(value);
      setCustom("");
    }
  };

  const selectAll = () => {
    if (disabled) return;
    setPicked(allSelected ? [] : [...allValues]);
  };

  const addCustomPin = () => {
    const raw = custom.trim();
    if (!raw || disabled) return;
    if (isMulti) {
      const pins = raw.match(/\d{6}/g) || [];
      if (pins.length) {
        setPicked((prev) => Array.from(new Set([...prev, ...pins])));
        setCustom("");
        return;
      }
      if (/^\d{6}$/.test(raw) && !picked.includes(raw)) {
        setPicked((prev) => [...prev, raw]);
        setCustom("");
      }
    }
  };

  const canContinue = isMulti
    ? picked.length > 0 || (select.allow_skip ?? false)
    : Boolean(single || custom.trim());

  const submit = () => {
    if (disabled || !canContinue) return;
    if (isMulti) {
      if (picked.length === 0 && select.allow_skip) {
        onSubmit("skip");
        return;
      }
      onSubmit(picked.join(", "));
      return;
    }
    onSubmit((single || custom).trim());
  };

  return (
    <div className="rounded-2xl border border-line-strong bg-white p-4 shadow-lift">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-navy-900">{select.title}</h3>
        {isMulti && select.select_all && (
          <button
            type="button"
            disabled={disabled}
            onClick={selectAll}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-2.5 py-1 text-xs font-semibold text-navy-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
          >
            <CheckCheck className="size-3.5" />
            {allSelected ? "Clear all" : "Select all"}
          </button>
        )}
      </div>

      <div className={cn("grid gap-2", isMulti ? "sm:grid-cols-2" : "grid-cols-1")}>
        {select.options.map((opt) => {
          const active = isMulti ? picked.includes(opt.value) : single === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => toggle(opt.value)}
              className={cn(
                "flex items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors disabled:opacity-50",
                active
                  ? "border-brand-500 bg-brand-50 ring-1 ring-brand-400/40"
                  : "border-line bg-white hover:border-brand-200 hover:bg-surface",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border",
                  isMulti ? "rounded-md" : "rounded-full",
                  active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-line-strong bg-white text-transparent",
                )}
              >
                <Check className="size-3" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-navy-900">{opt.label}</span>
                {opt.description && (
                  <span className="mt-0.5 block text-xs text-navy-500">{opt.description}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {select.allow_custom && (
        <div className="mt-3 flex gap-2">
          <Input
            value={custom}
            disabled={disabled}
            placeholder={select.custom_placeholder || "Type your answer"}
            onChange={(e) => {
              setCustom(e.target.value);
              if (!isMulti) setSingle("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (isMulti) addCustomPin();
                else submit();
              }
            }}
          />
          {isMulti && (
            <Button type="button" variant="secondary" disabled={disabled} onClick={addCustomPin}>
              Add
            </Button>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button disabled={disabled || !canContinue} onClick={submit}>
          {select.submit_label || "Continue"}
          {isMulti && picked.length > 0 ? ` (${picked.length})` : ""}
        </Button>
        {isMulti && select.allow_skip && (
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            onClick={() => onSubmit("skip")}
          >
            Skip for now
          </Button>
        )}
      </div>
    </div>
  );
}
