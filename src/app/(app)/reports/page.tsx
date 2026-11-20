"use client";

import * as React from "react";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { RangeTabs } from "@/components/dashboard/range-tabs";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SimulatedBadge, SimulatedNotice } from "@/components/ui/data-badge";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCampaigns, useDashboard } from "@/hooks/use-queries";
import { errorMessage } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { analyticsService } from "@/services/analytics";
import type { DateRange } from "@/types";

export default function ReportsPage() {
  const [range, setRange] = React.useState<DateRange>("30d");
  const dashboard = useDashboard(range);
  const campaigns = useCampaigns({});
  const list = campaigns.data ?? [];

  // Per-campaign analytics are lifetime totals (the endpoint has no date filter).
  const results = useQueries({
    queries: list.map((c) => ({
      queryKey: ["analytics", "campaign", c.id],
      queryFn: () => analyticsService.campaign(c.id),
      retry: false,
    })),
  });
  const rows = results.map((r) => r.data).filter((d): d is NonNullable<typeof d> => Boolean(d));
  const loadingRows = campaigns.isPending || (list.length > 0 && results.some((r) => r.isPending));

  const t = dashboard.data?.totals;
  const simulated = Boolean(dashboard.data?.data_quality?.is_simulated) || rows.some((r) => r.data_quality?.is_simulated);

  function exportCsv() {
    const head = ["Campaign", "Status", "Impressions", "Reach", "QR scans", "Leads", "Spend (INR)", "Cost per lead (INR)", "Simulated"];
    const lines = rows.map((r) =>
      [
        `"${r.campaign_name.replace(/"/g, '""')}"`,
        r.status,
        r.totals.impressions ?? 0,
        r.totals.estimated_reach ?? 0,
        r.totals.qr_scans ?? 0,
        r.totals.leads ?? 0,
        r.totals.spend ?? 0,
        r.cost_per_lead ?? "",
        r.data_quality?.is_simulated ? "yes" : "no",
      ].join(","),
    );
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bada-campaign-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Performance summary across your campaigns."
        actions={
          <>
            <RangeTabs value={range} onChange={setRange} />
            <Button variant="secondary" onClick={exportCsv} disabled={rows.length === 0}>
              <Download /> Export CSV
            </Button>
          </>
        }
      />
      {simulated && <SimulatedNotice className="mb-4" />}

      {dashboard.isError ? (
        <ErrorState message={errorMessage(dashboard.error)} onRetry={() => void dashboard.refetch()} />
      ) : (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboard.isPending ? (
            [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          ) : (
            <>
              <StatCard label="Impressions" value={t?.impressions} format="compact" simulated={simulated} />
              <StatCard label="Leads" value={t?.leads} simulated={simulated} />
              <StatCard label="QR scans" value={t?.qr_scans} simulated={simulated} />
              <StatCard label="Spend" value={t?.spend} format="currency" />
            </>
          )}
        </div>
      )}

      <h2 className="mb-3 text-base font-semibold text-navy-900">By campaign</h2>
      <Card className="overflow-hidden">
        {loadingRows ? (
          <div className="p-4">
            <TableSkeleton rows={4} cols={6} />
          </div>
        ) : campaigns.isError ? (
          <div className="p-4">
            <ErrorState message={errorMessage(campaigns.error)} onRetry={() => void campaigns.refetch()} />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No campaign data yet"
            description="Once a campaign is running, its performance will be listed here."
            action={
              <Button asChild>
                <Link href="/campaigns/new">Create a campaign</Link>
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">QR scans</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead className="text-right">Cost / lead</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.campaign_id}>
                    <TableCell className="font-medium">
                      <Link className="text-brand-700 hover:underline" href={`/campaigns/${r.campaign_id}/analytics`}>
                        {r.campaign_name}
                      </Link>
                      {r.data_quality?.is_simulated && <SimulatedBadge className="ml-2" />}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="tabular text-right">{formatNumber(r.totals.impressions)}</TableCell>
                    <TableCell className="tabular text-right">{formatNumber(r.totals.qr_scans)}</TableCell>
                    <TableCell className="tabular text-right">{formatNumber(r.totals.leads)}</TableCell>
                    <TableCell className="tabular text-right">{formatCurrency(r.totals.spend)}</TableCell>
                    <TableCell className="tabular text-right">
                      {r.cost_per_lead == null ? "—" : formatCurrency(r.cost_per_lead)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="border-t border-line p-3 text-xs text-navy-400">
              Campaign rows show lifetime totals. The summary above follows the selected date range.
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
