"use client";

import { ResourceTable, cells } from "@/components/admin/resource-table";
import { SimulatedNotice } from "@/components/ui/data-badge";

export default function AdminPublishersPage() {
  return (
    <ResourceTable
      resource="publishers"
      title="Publishers"
      description="Inventory partners. Entries marked simulated are placeholders, not live TV partners."
      headerNote={<SimulatedNotice className="mb-4" />}
      searchKeys={["name", "inventory_type", "status"]}
      columns={[
        { key: "name", header: "Publisher", className: "font-medium" },
        { key: "inventory_type", header: "Inventory", cell: cells.human("inventory_type") },
        { key: "default_cpm", header: "Default CPM", cell: cells.money("default_cpm") },
        { key: "status", header: "Status", cell: cells.status("status") },
        { key: "is_simulated", header: "Data", cell: cells.simulated("is_simulated") },
      ]}
    />
  );
}
