"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { api, errorMessage } from "@/lib/api";
import { asList, formatCurrency, humanize } from "@/lib/utils";

interface PendingListing {
  id: string;
  title: string;
  inventory_type: string;
  city: string;
  pincode: string;
  price: number;
  status: string;
}

export default function AdminLocalInventoryPage() {
  const qc = useQueryClient();
  const pending = useQuery({
    queryKey: ["admin-local-pending"],
    queryFn: async () =>
      asList<PendingListing>((await api.get<unknown>("/marketplace/local/pending")).data),
  });

  const review = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      api.post(`/marketplace/local/listings/${id}/review`, { status }),
    onSuccess: () => {
      toast.success("Listing updated");
      void qc.invalidateQueries({ queryKey: ["admin-local-pending"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Local inventory approvals"
        description="Review screen owners and local media listings before they appear in the marketplace."
      />
      {pending.isLoading && <Skeleton className="h-40 rounded-xl" />}
      {!pending.isLoading && pending.data?.length === 0 && (
        <EmptyState title="No pending listings" description="New local inventory submissions will show here." />
      )}
      <div className="space-y-3">
        {pending.data?.map((item) => (
          <Card key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium text-navy-900">{item.title}</h3>
                <StatusBadge status={item.status} />
              </div>
              <p className="mt-1 text-sm text-navy-500">
                {humanize(item.inventory_type)} · {item.city} {item.pincode} · {formatCurrency(item.price)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => review.mutate({ id: item.id, status: "approved" })}>
                Approve
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => review.mutate({ id: item.id, status: "rejected" })}
              >
                Reject
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
