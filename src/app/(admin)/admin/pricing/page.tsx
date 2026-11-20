"use client";

import { SettingEditButton } from "@/components/admin/setting-actions";
import { ResourceTable } from "@/components/admin/resource-table";

export default function AdminPricingPage() {
  return (
    <ResourceTable
      resource="pricing"
      title="Pricing"
      description="Rates, fees and tax used in campaign budget estimates. Stored as system settings."
      emptyTitle="No pricing settings found"
      searchKeys={["key", "description"]}
      columns={[
        { key: "key", header: "Setting", className: "font-mono text-xs" },
        { key: "value", header: "Value", className: "font-medium" },
        { key: "description", header: "Description" },
      ]}
      rowActions={(row) => <SettingEditButton row={row} />}
    />
  );
}
