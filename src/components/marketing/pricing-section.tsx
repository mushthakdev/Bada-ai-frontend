"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MockBadge } from "@/components/ui/data-badge";
import { ApiError, errorMessage } from "@/lib/api";
import { cn, formatCurrency } from "@/lib/utils";
import { marketingService } from "@/services/marketing";

/** Pricing is never hardcoded — plans are fetched from GET /api/v1/pricing. */
export function PricingGrid() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["pricing"],
    queryFn: marketingService.pricing,
  });

  if (isPending) {
    return (
      <div className="grid gap-6 md:grid-cols-3" role="status" aria-label="Loading pricing">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-80 rounded-2xl" />
        ))}
      </div>
    );
  }

  const notPublished = isError && error instanceof ApiError && error.status === 404;
  if (isError || !data || data.plans.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong bg-white p-10 text-center">
        <h3 className="text-lg font-semibold text-navy-900">
          {isError && !notPublished ? "Pricing isn't available right now" : "Plan pricing will be published soon"}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-navy-500">
          {isError && !notPublished ? `${errorMessage(error)} ` : "There are no public plans yet. "}
          You can still create an account and see an itemised budget estimate — media spend, platform fee and tax — for
          any campaign before you pay.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {isError && !notPublished && (
            <Button variant="secondary" onClick={() => void refetch()}>
              Retry
            </Button>
          )}
          <Button asChild>
            <Link href="/contact">Talk to us</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {data.is_mock && (
        <div className="mb-6 flex justify-center">
          <MockBadge label="Sample pricing" />
        </div>
      )}
      <div className={cn("grid gap-6", data.plans.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2 md:max-w-3xl md:mx-auto")}>
        {data.plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "flex flex-col rounded-2xl border bg-white p-8 shadow-soft",
              plan.highlighted ? "border-brand-600 ring-1 ring-brand-600" : "border-line",
            )}
          >
            <h3 className="text-xl font-semibold text-navy-900">{plan.name}</h3>
            {plan.description && <p className="mt-2 text-sm text-navy-500">{plan.description}</p>}
            <p className="mt-6 font-display text-4xl font-semibold text-navy-900">
              {plan.price_label ?? (plan.price != null ? formatCurrency(plan.price, plan.currency) : "Custom")}
              {plan.billing_period && (
                <span className="ml-1 text-base font-medium text-navy-400">/ {plan.billing_period}</span>
              )}
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-navy-700">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8" variant={plan.highlighted ? "default" : "secondary"} size="lg">
              <Link href="/register">{plan.cta_label ?? "Get started"}</Link>
            </Button>
          </div>
        ))}
      </div>
      {data.notes && data.notes.length > 0 && (
        <ul className="mx-auto mt-8 max-w-2xl space-y-1 text-center text-sm text-navy-500">
          {data.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
