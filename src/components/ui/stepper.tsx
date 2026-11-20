import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stepper({ steps, current, className }: { steps: string[]; current: number; className?: string }) {
  return (
    <ol className={cn("flex items-center gap-2 overflow-x-auto pb-1", className)} aria-label="Progress">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex shrink-0 items-center gap-2" aria-current={active ? "step" : undefined}>
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                done && "bg-brand-600 text-white",
                active && "bg-navy-900 text-white",
                !done && !active && "bg-line text-navy-500",
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("text-sm font-medium", active ? "text-navy-900" : "text-navy-400")}>{label}</span>
            {i < steps.length - 1 && <span aria-hidden className="mx-1 h-px w-6 bg-line-strong sm:w-10" />}
          </li>
        );
      })}
    </ol>
  );
}
