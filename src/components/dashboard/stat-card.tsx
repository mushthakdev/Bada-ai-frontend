import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SimulatedBadge } from "@/components/ui/data-badge";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type StatFormat = "number" | "compact" | "currency" | "percent";

export function formatStat(value: number | string | null | undefined, format: StatFormat = "number") {
  if (typeof value === "string") return value;
  switch (format) {
    case "currency":
      return formatCurrency(value);
    case "percent":
      return formatPercent(value);
    case "compact":
      return formatNumber(value, true);
    default:
      return formatNumber(value);
  }
}

interface StatCardProps {
  label: string;
  value: number | string | null | undefined;
  format?: StatFormat;
  icon?: LucideIcon;
  simulated?: boolean;
  hint?: string;
  className?: string;
  compact?: boolean;
}

export function StatCard({
  label,
  value,
  format = "number",
  icon: Icon,
  simulated,
  hint,
  className,
  compact,
}: StatCardProps) {
  return (
    <Card className={cn(compact ? "p-4" : "p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-navy-500">{label}</p>
        {Icon && (
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Icon className="size-4" aria-hidden />
          </span>
        )}
      </div>
      <p className={cn("tabular mt-3 font-display font-semibold text-navy-900", compact ? "text-2xl" : "text-3xl")}>
        {formatStat(value, format)}
      </p>
      <div className="mt-2 flex min-h-5 items-center gap-2">
        {simulated && <SimulatedBadge />}
        {hint && <span className="text-xs text-navy-400">{hint}</span>}
      </div>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-8 w-32" />
      <Skeleton className="mt-3 h-4 w-16" />
    </Card>
  );
}
