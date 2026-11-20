"use client";

import { ResourceTable, cells } from "@/components/admin/resource-table";

export default function AdminAiLogsPage() {
  return (
    <ResourceTable
      resource="ai-logs"
      title="AI logs"
      description="Every AI generation request, with provider and status."
      searchKeys={["type", "provider", "status"]}
      columns={[
        { key: "type", header: "Type", cell: cells.human("type"), className: "font-medium" },
        { key: "provider", header: "Provider", cell: cells.human("provider") },
        { key: "tokens_used", header: "Tokens", cell: cells.text("tokens_used") },
        { key: "estimated_cost", header: "Est. cost", cell: cells.money("estimated_cost") },
        { key: "status", header: "Status", cell: cells.status("status") },
        { key: "is_mock", header: "Mode", cell: cells.mock("is_mock") },
        { key: "created_at", header: "Created", cell: cells.date("created_at") },
      ]}
    />
  );
}
