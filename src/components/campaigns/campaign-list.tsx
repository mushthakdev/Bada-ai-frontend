"use client";

import Link from "next/link";
import { useState } from "react";
import { Megaphone, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Input, NativeSelect } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/skeleton";
import { SimulatedBadge } from "@/components/ui/data-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { useCampaigns } from "@/hooks/use-queries";
import { useDebounce } from "@/hooks/use-debounce";
import { errorMessage } from "@/lib/api";
import { CAMPAIGN_STATUSES } from "@/lib/constants";
import { formatCurrency, formatDate, humanize } from "@/lib/utils";

export function CampaignList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const debounced = useDebounce(search);
  const { data: all, isPending, isError, error, refetch } = useCampaigns({ status: status || undefined });
  // The API filters by status only, so text search happens client-side.
  const data = (all ?? []).filter((c) => !debounced || c.name.toLowerCase().includes(debounced.toLowerCase()));
  const filtered = Boolean(debounced || status);

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="Create, manage and track campaigns across every advertising platform."
        actions={
          <Button asChild>
            <Link href="/campaigns/new">
              <Plus /> New campaign
            </Link>
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns"
              className="pl-9"
              aria-label="Search campaigns"
            />
          </div>
          <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-52" aria-label="Filter by status">
            <option value="">All statuses</option>
            {CAMPAIGN_STATUSES.map((s) => (
              <option key={s} value={s}>
                {humanize(s)}
              </option>
            ))}
          </NativeSelect>
        </div>

        {isPending ? (
          <TableSkeleton cols={5} />
        ) : isError ? (
          <div className="p-4">
            <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />
          </div>
        ) : data.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Megaphone}
              title={filtered ? "No campaigns match your filters" : "No campaigns yet"}
              description={
                filtered
                  ? "Try a different search or status."
                  : "Create your first campaign — or start an omnichannel plan across every platform."
              }
              action={
                !filtered && (
                  <Button asChild>
                    <Link href="/campaigns/new">Create campaign</Link>
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Objective</TableHead>
                <TableHead className="text-right">Pincodes</TableHead>
                <TableHead className="text-right">Daily budget</TableHead>
                <TableHead>Dates</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/campaigns/${c.id}`} className="font-semibold text-navy-900 hover:text-brand-700">
                      {c.name}
                    </Link>
                    {c.is_simulated_delivery && (
                      <span className="ml-2 align-middle">
                        <SimulatedBadge label="Simulated delivery" />
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="text-navy-500">{humanize(c.objective)}</TableCell>
                  <TableCell className="tabular text-right">{c.location_count}</TableCell>
                  <TableCell className="tabular text-right">{formatCurrency(c.budget?.daily_budget)}</TableCell>
                  <TableCell className="whitespace-nowrap text-navy-500">
                    {c.start_date ? `${formatDate(c.start_date)} – ${formatDate(c.end_date)}` : "Not scheduled"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
