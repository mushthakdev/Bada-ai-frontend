"use client";

import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MockBadge } from "@/components/ui/data-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { paymentService } from "@/services/payments";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { errorMessage } from "@/lib/api";

export default function PaymentsPage() {
  const search = useSearchParams();
  const campaignId = search.get("campaign");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentService.list(),
  });

  const payMutation = useMutation({
    mutationFn: async (id: string) => {
      const order = await paymentService.createOrder(id);
      const verified = await paymentService.verify({
        payment_id: order.payment_id,
        mock_success: true,
      });
      return { order, verified };
    },
    onSuccess: (result) => {
      toast.success(
        result.order.is_mock
          ? "Mock payment completed — no real charge"
          : "Payment completed",
      );
      void qc.invalidateQueries({ queryKey: ["payments"] });
      void qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Campaign checkout and payment history. Mock mode is active until Razorpay keys are configured."
      />

      {campaignId && (
        <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-navy-900">Pay for selected campaign</h3>
              <MockBadge />
            </div>
            <p className="mt-1 text-sm text-navy-500">Campaign ID: {campaignId}</p>
          </div>
          <Button loading={payMutation.isPending} onClick={() => payMutation.mutate(campaignId)}>
            Complete mock payment
          </Button>
        </Card>
      )}

      {isLoading && <Skeleton className="h-40 w-full rounded-xl" />}

      {!isLoading && data && data.length === 0 && (
        <EmptyState title="No payments yet" description="Payments appear after you checkout a campaign." />
      )}

      <div className="space-y-3">
        {data?.map((p) => (
          <Card key={p.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-navy-900">{formatCurrency(p.amount)}</span>
                <StatusBadge status={p.status} />
                {p.is_mock && <MockBadge />}
              </div>
              <p className="mt-1 text-sm text-navy-500">
                {p.provider} · {formatDateTime(p.created_at)}
              </p>
            </div>
            <p className="font-mono text-xs text-navy-400">{p.id}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
