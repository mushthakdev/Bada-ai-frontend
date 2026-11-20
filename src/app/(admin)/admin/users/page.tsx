"use client";

import { ResourceTable, cells } from "@/components/admin/resource-table";

export default function AdminUsersPage() {
  return (
    <ResourceTable
      resource="users"
      title="Users"
      description="Everyone with an account on the platform."
      searchKeys={["email", "full_name", "role"]}
      columns={[
        { key: "full_name", header: "Name", cell: cells.text("full_name"), className: "font-medium" },
        { key: "email", header: "Email" },
        { key: "role", header: "Role", cell: cells.human("role") },
        { key: "is_active", header: "Active", cell: cells.bool("is_active") },
        { key: "is_verified", header: "Verified", cell: cells.bool("is_verified") },
        { key: "created_at", header: "Joined", cell: cells.date("created_at") },
      ]}
    />
  );
}
