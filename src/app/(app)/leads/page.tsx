"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, NativeSelect } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { leadService } from "@/services/leads";
import { ApiError } from "@/lib/api";

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["leads", search, status],
    queryFn: () => leadService.list({ search: search || undefined, status: status || undefined }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      leadService.update(id, { status }),
    onSuccess: () => {
      toast.success("Lead updated");
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Update failed"),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Track QR scans, WhatsApp inquiries, calls, and website visits."
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search name, phone, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)} className="sm:max-w-[180px]">
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </NativeSelect>
      </div>

      {isLoading && <Skeleton className="h-40 w-full rounded-xl" />}

      {!isLoading && data && data.length === 0 && (
        <EmptyState title="No leads yet" description="Leads appear when viewers scan QR codes or enquire via WhatsApp, phone, or web." />
      )}

      <div className="space-y-3">
        {data?.map((lead) => (
          <Card key={lead.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium text-navy">{lead.name || "Anonymous"}</h3>
                <StatusBadge status={lead.status} />
              </div>
              <p className="mt-1 text-sm text-muted">
                {lead.source} · {lead.phone || lead.email || "No contact"} · {lead.pincode || "—"}
              </p>
              {lead.inquiry && <p className="mt-1 text-sm text-muted">{lead.inquiry}</p>}
            </div>
            <NativeSelect
              value={lead.status}
              onChange={(e) => updateMutation.mutate({ id: lead.id, status: e.target.value })}
              className="sm:w-40"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </NativeSelect>
          </Card>
        ))}
      </div>
    </div>
  );
}
