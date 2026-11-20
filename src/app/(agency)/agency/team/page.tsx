"use client";

import { Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/misc";
import { useAuth } from "@/hooks/use-auth";
import { humanize } from "@/lib/utils";

export default function AgencyTeamPage() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader title="Team" description="People with access to your agency workspace." />
      {user && (
        <Card className="mb-4 flex items-center gap-3 p-4">
          <Avatar name={user.full_name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-navy-900">{user.full_name}</p>
            <p className="truncate text-xs text-navy-500">
              {user.email} · {humanize(user.role)}
            </p>
          </div>
        </Card>
      )}
      <Card>
        <EmptyState
          icon={Users}
          title="Team invitations aren't available yet"
          description="The platform API doesn't support inviting teammates to an agency yet. You're the only member for now."
        />
      </Card>
    </div>
  );
}
