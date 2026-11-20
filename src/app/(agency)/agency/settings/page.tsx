"use client";

import { AgencyGate } from "@/components/agency/use-agency";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/hooks/use-auth";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-0">
      <dt className="text-sm text-navy-500">{label}</dt>
      <dd className="text-sm font-medium text-navy-900">{children}</dd>
    </div>
  );
}

export default function AgencySettingsPage() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader title="Agency settings" description="Your agency profile and account." />
      <AgencyGate>
        {(agency) => (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-2 text-base font-semibold text-navy-900">Agency</h2>
              <dl>
                <Row label="Name">{agency.name}</Row>
                <Row label="Status">
                  <StatusBadge status={agency.status} />
                </Row>
                <Row label="White-label">{agency.white_label_enabled ? "Enabled" : "Not enabled"}</Row>
              </dl>
              <p className="mt-3 text-xs text-navy-400">Editing agency details isn&apos;t supported by the API yet.</p>
            </Card>
            <Card className="p-5">
              <h2 className="mb-2 text-base font-semibold text-navy-900">Account</h2>
              <dl>
                <Row label="Name">{user?.full_name}</Row>
                <Row label="Email">{user?.email}</Row>
              </dl>
            </Card>
          </div>
        )}
      </AgencyGate>
    </div>
  );
}
