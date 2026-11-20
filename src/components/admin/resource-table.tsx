"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { MockBadge, SimulatedBadge } from "@/components/ui/data-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { errorMessage } from "@/lib/api";
import { adminService, type AdminResource } from "@/services/admin";
import { formatCurrency, formatDateTime, humanize } from "@/lib/utils";
import type { Row } from "@/types";

export interface Column {
  key: string;
  header: string;
  cell?: (row: Row) => React.ReactNode;
  className?: string;
}

const PAGE_SIZE = 12;

/** Small cell renderers shared by the admin pages. */
export const cells = {
  text: (key: string) => (row: Row) => {
    const v = row[key];
    return v === null || v === undefined || v === "" ? <span className="text-navy-300">—</span> : String(v);
  },
  status: (key: string) => (row: Row) => <StatusBadge status={row[key] as string} />,
  date: (key: string) => (row: Row) => formatDateTime(row[key] as string),
  money: (key: string) => (row: Row) => formatCurrency(Number(row[key] ?? 0)),
  bool: (key: string, yes = "Yes", no = "No") => (row: Row) =>
    row[key] ? <span className="font-medium text-success">{yes}</span> : <span className="text-navy-400">{no}</span>,
  human: (key: string) => (row: Row) => humanize(row[key] as string),
  mock: (key = "is_mock") => (row: Row) => (row[key] ? <MockBadge /> : <span className="text-navy-400">Live</span>),
  simulated: (key = "is_simulated") => (row: Row) =>
    row[key] ? <SimulatedBadge /> : <span className="text-navy-400">—</span>,
};

export function ResourceTable({
  resource,
  title,
  description,
  columns,
  searchKeys,
  rowActions,
  emptyTitle,
  headerNote,
}: {
  resource: AdminResource;
  title: string;
  description: string;
  columns: Column[];
  searchKeys: string[];
  rowActions?: (row: Row) => React.ReactNode;
  emptyTitle?: string;
  headerNote?: React.ReactNode;
}) {
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(0);
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["admin", resource],
    queryFn: () => adminService.list(resource),
  });

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !data) return data ?? [];
    return data.filter((r) => searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)));
  }, [data, query, searchKeys]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  return (
    <div>
      <PageHeader title={title} description={description} />
      {headerNote}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line p-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
            <Input
              className="pl-9"
              placeholder="Search…"
              aria-label={`Search ${title}`}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
            />
          </div>
          {data && <span className="ml-auto text-xs text-navy-400">{filtered.length} records</span>}
        </div>

        {isPending ? (
          <div className="p-4">
            <TableSkeleton rows={6} cols={Math.min(columns.length, 5)} />
          </div>
        ) : isError ? (
          <div className="p-4">
            <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            title={query ? "No matching records" : (emptyTitle ?? `No ${title.toLowerCase()} yet`)}
            description={query ? "Try a different search." : "Records will show up here as they are created."}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c.key}>{c.header}</TableHead>
                ))}
                {rowActions && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((row, i) => (
                <TableRow key={String(row.id ?? row.key ?? i)}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {c.cell ? c.cell(row) : cells.text(c.key)(row)}
                    </TableCell>
                  ))}
                  {rowActions && <TableCell className="text-right">{rowActions(row)}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-line p-3 text-sm text-navy-500">
            <span>
              Page {current + 1} of {pages}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={current === 0} onClick={() => setPage(current - 1)}>
                <ChevronLeft /> Prev
              </Button>
              <Button size="sm" variant="secondary" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
                Next <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
