"use client";

import Link from "next/link";
import { ResourceTable, cells } from "@/components/admin/resource-table";

export default function AdminCampaignsPage() {
  return (
    <ResourceTable
      resource="campaigns"
      title="Campaigns"
      description="Every campaign on the platform, across all businesses."
      searchKeys={["name", "status"]}
      columns={[
        {
          key: "name",
          header: "Campaign",
          className: "font-medium",
          cell: (r) => (
            <Link className="text-brand-700 hover:underline" href={`/campaigns/${String(r.id)}`}>
              {String(r.name ?? "Untitled")}
            </Link>
          ),
        },
        { key: "status", header: "Status", cell: cells.status("status") },
        { key: "is_simulated_delivery", header: "Delivery", cell: cells.simulated("is_simulated_delivery") },
        { key: "created_at", header: "Created", cell: cells.date("created_at") },
      ]}
    />
  );
}
