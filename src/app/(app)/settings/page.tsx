"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { api, errorMessage } from "@/lib/api";
import { API_BASE } from "@/lib/constants";
import { humanize } from "@/lib/utils";

interface Health {
  status: string;
  app: string;
  env: string;
  ai_mode: string;
  payment_mode: string;
  storage_mode: string;
}

const MODE_COPY: Record<string, string> = {
  mock: "Mock — no real provider is called",
  live: "Live",
  razorpay: "Razorpay",
  local: "Local storage",
  s3: "Cloud storage",
};

export default function SettingsPage() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["health"],
    queryFn: async () => (await api.get<Health>("/health", undefined, { auth: false })).data,
  });

  const rows: [string, string | undefined][] = [
    ["API status", data?.status],
    ["Environment", data?.env ? humanize(data.env) : undefined],
    ["AI generation", data ? (MODE_COPY[data.ai_mode] ?? data.ai_mode) : undefined],
    ["Payments", data ? (MODE_COPY[data.payment_mode] ?? data.payment_mode) : undefined],
    ["Media storage", data ? (MODE_COPY[data.storage_mode] ?? data.storage_mode) : undefined],
  ];

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="How this workspace is connected." />
      <Card className="p-6">
        <h2 className="text-base font-semibold text-navy-900">Platform mode</h2>
        <p className="mt-1 text-sm text-navy-500">
          Reported live by the API. Mock modes mean generated ads and payments are test data.
        </p>
        {isPending ? (
          <Skeleton className="mt-4 h-32" />
        ) : isError ? (
          <ErrorState className="mt-4" message={errorMessage(error)} onRetry={() => void refetch()} />
        ) : (
          <dl className="mt-4">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-line py-3 last:border-0">
                <dt className="text-sm text-navy-500">{label}</dt>
                <dd className="text-sm font-medium text-navy-900">{value ?? "—"}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className="mt-4 break-all text-xs text-navy-400">API endpoint: {API_BASE}</p>
      </Card>
    </div>
  );
}
