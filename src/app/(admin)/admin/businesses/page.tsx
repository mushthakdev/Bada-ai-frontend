"use client";

import { ResourceTable, cells } from "@/components/admin/resource-table";

export default function AdminBusinessesPage() {
  return (
    <ResourceTable
      resource="businesses"
      title="Businesses"
      description="All advertiser businesses across the platform."
      searchKeys={["name", "category", "city", "pincode"]}
      columns={[
        { key: "name", header: "Business", className: "font-medium" },
        { key: "category", header: "Category", cell: cells.human("category") },
        { key: "city", header: "City" },
        { key: "pincode", header: "Pincode" },
        { key: "onboarding_completed", header: "Onboarded", cell: cells.bool("onboarding_completed") },
        { key: "created_at", header: "Created", cell: cells.date("created_at") },
      ]}
    />
  );
}
