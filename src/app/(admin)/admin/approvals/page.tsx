"use client";

import { ApprovalActions } from "@/components/admin/approval-actions";
import { ResourceTable, cells } from "@/components/admin/resource-table";

export default function AdminApprovalsPage() {
  return (
    <ResourceTable
      resource="approvals"
      title="Creative approvals"
      description="Creatives waiting for review before a campaign can be scheduled."
      emptyTitle="Nothing waiting for approval"
      searchKeys={["title", "status", "approval_status"]}
      columns={[
        { key: "title", header: "Creative", className: "font-medium" },
        { key: "status", header: "Status", cell: cells.status("status") },
        { key: "approval_status", header: "Approval", cell: cells.status("approval_status") },
        { key: "is_mock", header: "Source", cell: cells.mock("is_mock") },
      ]}
      rowActions={(row) => <ApprovalActions row={row} />}
    />
  );
}
