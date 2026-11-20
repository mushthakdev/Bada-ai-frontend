"use client";

import { ResourceTable, cells } from "@/components/admin/resource-table";
import { SimulatedNotice } from "@/components/ui/data-badge";

export default function AdminInventoryPage() {
  return (
    <ResourceTable
      resource="inventory"
      title="Inventory"
      description="Ad slots available for targeting. Simulated inventory is for planning only."
      headerNote={<SimulatedNotice className="mb-4" />}
      searchKeys={["name", "pincode", "city", "inventory_type"]}
      columns={[
        { key: "name", header: "Slot", className: "font-medium" },
        { key: "inventory_type", header: "Type", cell: cells.human("inventory_type") },
        { key: "city", header: "City" },
        { key: "pincode", header: "Pincode" },
        { key: "cpm", header: "CPM", cell: cells.money("cpm") },
        { key: "available_impressions", header: "Available impressions", cell: cells.text("available_impressions") },
        { key: "is_simulated", header: "Data", cell: cells.simulated("is_simulated") },
      ]}
    />
  );
}
