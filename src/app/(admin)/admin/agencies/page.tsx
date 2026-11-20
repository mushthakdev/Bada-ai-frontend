"use client";

import { ResourceTable, cells } from "@/components/admin/resource-table";

export default function AdminAgenciesPage() {
  return (
    <ResourceTable
      resource="agencies"
      title="Agencies"
      description="Agency partners managing multiple client businesses."
      searchKeys={["name", "email", "status"]}
      columns={[
        { key: "name", header: "Agency", className: "font-medium" },
        { key: "email", header: "Email" },
        { key: "status", header: "Status", cell: cells.status("status") },
        { key: "white_label_enabled", header: "White-label", cell: cells.bool("white_label_enabled", "Enabled", "Off") },
        { key: "created_at", header: "Created", cell: cells.date("created_at") },
      ]}
    />
  );
}
