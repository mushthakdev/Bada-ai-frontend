"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/misc";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, humanize } from "@/lib/utils";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-0">
      <dt className="text-sm text-navy-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-navy-900">{children}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <div className="max-w-2xl">
      <PageHeader title="Profile" description="Your account details." />
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-4">
          <Avatar name={user.full_name} className="size-14 text-lg" />
          <div>
            <p className="text-lg font-semibold text-navy-900">{user.full_name}</p>
            <p className="text-sm text-navy-500">{user.email}</p>
          </div>
        </div>
        <dl>
          <Row label="Role">{humanize(user.role)}</Row>
          <Row label="Email verification">
            <StatusBadge status={user.is_verified ? "verified" : "pending"} />
          </Row>
          <Row label="Phone">{user.phone ?? "—"}</Row>
          <Row label="Preferred language">{user.preferred_language.toUpperCase()}</Row>
          <Row label="Member since">{formatDate(user.created_at)}</Row>
        </dl>
        <p className="mt-4 text-xs text-navy-400">
          Editing profile details and changing your password aren&apos;t supported by the API yet. Use &ldquo;Forgot
          password&rdquo; on the sign-in page to reset it.
        </p>
        <Button variant="secondary" className="mt-5" onClick={() => void logout()}>
          Sign out
        </Button>
      </Card>
    </div>
  );
}
