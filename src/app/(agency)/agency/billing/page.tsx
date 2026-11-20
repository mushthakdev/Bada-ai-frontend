"use client";

import { useQuery } from "@tanstack/react-query";
import { AgencyGate } from "@/components/agency/use-agency";
import { PaymentsTable } from "@/components/payments/payments-table";
import { PageHeader } from "@/components/layout/page-header";
import { paymentService } from "@/services/payments";

function Billing() {
  const query = useQuery({ queryKey: ["payments"], queryFn: () => paymentService.list() });
  return (
    <div>
      <PageHeader title="Billing" description="Payments for campaigns across your client businesses." />
      <PaymentsTable query={query} />
    </div>
  );
}

export default function AgencyBillingPage() {
  return <AgencyGate>{() => <Billing />}</AgencyGate>;
}
