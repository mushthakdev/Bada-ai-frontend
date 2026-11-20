"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Film, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { MockBadge } from "@/components/ui/data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { aiService } from "@/services/ai";

export function CreativesGrid() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["creatives", "all"],
    queryFn: () => aiService.creatives(),
  });

  return (
    <div>
      <PageHeader
        title="Creatives"
        description="Every ad creative generated for your campaigns."
        actions={
          <Button asChild>
            <Link href="/studio">
              <Sparkles /> Open AI Studio
            </Link>
          </Button>
        }
      />
      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No creatives yet"
          description="Generate your first ad in AI Studio."
          action={
            <Button asChild>
              <Link href="/studio">Open AI Studio</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <li key={c.id}>
              <Link href={`/editor/${c.id}`} className="group block overflow-hidden rounded-xl border border-line bg-white shadow-soft transition-shadow hover:shadow-lift">
                <div className="relative flex aspect-video items-center justify-center bg-navy-900">
                  {c.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.thumbnail_url} alt="" className="size-full object-cover" />
                  ) : (
                    <Film className="size-8 text-navy-400" aria-hidden />
                  )}
                  {c.is_mock && (
                    <span className="absolute left-3 top-3">
                      <MockBadge />
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="truncate font-semibold text-navy-900 group-hover:text-brand-700">{c.title}</p>
                  <p className="mt-0.5 truncate text-sm text-navy-500">{c.campaign_name ?? "No campaign"}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <StatusBadge status={c.status} />
                    <span className="text-xs text-navy-400">{formatDate(c.created_at)}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
