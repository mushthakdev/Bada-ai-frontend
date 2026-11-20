"use client";

import Link from "next/link";
import { Megaphone, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { useCampaigns } from "@/hooks/use-queries";
import { errorMessage } from "@/lib/api";
import { humanize } from "@/lib/utils";

export function StudioPicker() {
  const { data, isPending, isError, error, refetch } = useCampaigns();
  return (
    <div>
      <PageHeader title="AI Studio" description="Pick a campaign to create its ad with AI." />
      {isPending ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : isError ? (
        <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Create a campaign first"
          description="AI Studio works on a campaign. Create one to get started."
          action={
            <Button asChild>
              <Link href="/campaigns/new">New campaign</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <li key={c.id}>
              <Link href={`/studio/${c.id}`} className="group block rounded-xl border border-line bg-white p-5 shadow-soft transition-shadow hover:shadow-lift">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-navy-900 group-hover:text-brand-700">{c.name}</p>
                  <Sparkles className="size-4 shrink-0 text-brand-600" aria-hidden />
                </div>
                <p className="mt-1 text-sm text-navy-500">{humanize(c.objective)}</p>
                <div className="mt-4">
                  <StatusBadge status={c.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
