"use client";

import { SettingEditButton } from "@/components/admin/setting-actions";
import { ResourceTable } from "@/components/admin/resource-table";

export default function AdminSettingsPage() {
  return (
    <ResourceTable
      resource="settings"
      title="System settings"
      description="Platform configuration values. Changes apply immediately."
      searchKeys={["key", "category", "description"]}
      columns={[
        { key: "key", header: "Setting", className: "font-mono text-xs" },
        { key: "value", header: "Value", className: "font-medium" },
        { key: "category", header: "Category" },
        { key: "description", header: "Description" },
      ]}
      rowActions={(row) => <SettingEditButton row={row} />}
    />
  );
}
