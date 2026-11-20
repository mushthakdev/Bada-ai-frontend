"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { notificationService } from "@/services/notifications";
import { formatDateTime } from "@/lib/utils";

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.list(),
  });

  const markAll = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Campaign, payment, creative, and lead alerts."
        actions={
          <Button variant="secondary" loading={markAll.isPending} onClick={() => markAll.mutate()}>
            Mark all read
          </Button>
        }
      />
      {isLoading && <Skeleton className="h-40 rounded-xl" />}
      {!isLoading && data && data.length === 0 && (
        <EmptyState title="No notifications" description="You're all caught up." />
      )}
      <div className="space-y-3">
        {data?.map((n) => (
          <Card key={n.id} className={`p-4 ${n.is_read ? "opacity-70" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium text-navy-900">{n.title}</h3>
                <p className="mt-1 text-sm text-navy-600">{n.message}</p>
              </div>
              <span className="shrink-0 text-xs text-navy-400">{formatDateTime(n.created_at)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
