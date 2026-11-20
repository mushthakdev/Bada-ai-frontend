"use client";

import { ResourceTable, cells } from "@/components/admin/resource-table";

export default function AdminPaymentsPage() {
  return (
    <ResourceTable
      resource="payments"
      title="Payments"
      description="All payment orders. Mock payments are test transactions and move no real money."
      searchKeys={["id", "status", "provider"]}
      columns={[
        { key: "id", header: "Payment", className: "font-mono text-xs" },
        { key: "amount", header: "Amount", cell: cells.money("amount"), className: "font-medium" },
        { key: "status", header: "Status", cell: cells.status("status") },
        { key: "provider", header: "Provider", cell: cells.human("provider") },
        { key: "is_mock", header: "Mode", cell: cells.mock("is_mock") },
        { key: "created_at", header: "Created", cell: cells.date("created_at") },
      ]}
    />
  );
}
