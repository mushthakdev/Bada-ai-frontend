"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PaymentsTable } from "@/components/payments/payments-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SimulatedNotice } from "@/components/ui/data-badge";
import { paymentService } from "@/services/payments";

const PAID = new Set(["paid", "succeeded", "captured"]);

export default function BillingPage() {
  const query = useQuery({ queryKey: ["payments"], queryFn: () => paymentService.list() });
  const rows = query.data ?? [];
  const paid = rows.filter((p) => PAID.has(p.status));
  const pending = rows.filter((p) => !PAID.has(p.status) && p.status !== "failed");
  const hasMock = paid.some((p) => p.is_mock);

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Your payment history and spend, summed from your payments."
        actions={
          <Button asChild variant="secondary">
            <Link href="/payments">Go to payments</Link>
          </Button>
        }
      />
      {query.isSuccess && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Total paid" value={paid.reduce((s, p) => s + p.amount, 0)} format="currency" simulated={hasMock} hint={hasMock ? "Includes mock payments" : undefined} />
          <StatCard label="Successful payments" value={paid.length} />
          <StatCard label="Awaiting payment" value={pending.length} />
        </div>
      )}
      {hasMock && <SimulatedNotice className="mb-4" />}
      <PaymentsTable query={query} />
    </div>
  );
}
