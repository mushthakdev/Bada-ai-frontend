"use client";

import Link from "next/link";
import type { UseQueryResult } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { MockBadge } from "@/components/ui/data-badge";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCampaigns } from "@/hooks/use-queries";
import { errorMessage } from "@/lib/api";
import { formatCurrency, formatDateTime, humanize } from "@/lib/utils";
import type { Payment } from "@/types";

export function PaymentsTable({ query }: { query: UseQueryResult<Payment[]> }) {
  const campaigns = useCampaigns({});
  const names = new Map((campaigns.data ?? []).map((c) => [c.id, c.name]));

  return (
    <Card className="overflow-hidden">
      {query.isPending ? (
        <div className="p-4">
          <TableSkeleton rows={4} cols={5} />
        </div>
      ) : query.isError ? (
        <div className="p-4">
          <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
        </div>
      ) : query.data.length === 0 ? (
        <EmptyState
          title="No payments yet"
          description="Payments appear here after you pay for a campaign. You always see an itemised estimate before paying."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Mode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="whitespace-nowrap">{formatDateTime(p.created_at)}</TableCell>
                <TableCell>
                  {p.campaign_id ? (
                    <Link className="text-brand-700 hover:underline" href={`/campaigns/${p.campaign_id}`}>
                      {names.get(p.campaign_id) ?? "Campaign"}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="tabular font-medium">{formatCurrency(p.amount, p.currency)}</TableCell>
                <TableCell>
                  <StatusBadge status={p.status} />
                </TableCell>
                <TableCell>
                  {p.is_mock ? <MockBadge label="Mock payment" /> : <span className="text-navy-500">{humanize(p.provider)}</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
