"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MockBadge, SimulatedBadge } from "@/components/ui/data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { useBusinesses } from "@/hooks/use-queries";
import { errorMessage } from "@/lib/api";
import { formatDateTime, humanize } from "@/lib/utils";
import { omnichannelService } from "@/services/omnichannel";

export default function IntegrationsPage() {
  const qc = useQueryClient();
  const businesses = useBusinesses();
  const businessId = businesses.data?.[0]?.id;

  const integrations = useQuery({
    queryKey: ["integrations", businessId],
    queryFn: () => omnichannelService.integrations(businessId as string),
    enabled: Boolean(businessId),
  });

  const connect = useMutation({
    mutationFn: (channel_code: string) =>
      omnichannelService.connect({ business_id: businessId as string, channel_code }),
    onSuccess: () => {
      toast.success("Connected in demo/partner mode — no live OAuth token stored for production ads");
      void qc.invalidateQueries({ queryKey: ["integrations", businessId] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const disconnect = useMutation({
    mutationFn: (channel_code: string) =>
      omnichannelService.disconnect({ business_id: businessId as string, channel_code }),
    onSuccess: () => {
      toast.success("Disconnected");
      void qc.invalidateQueries({ queryKey: ["integrations", businessId] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Channel integrations"
        description="Connect advertising accounts securely. Access tokens stay on the backend and are never exposed to the browser."
        badges={<SimulatedBadge label="Demo connections" />}
      />

      {!businessId && !businesses.isLoading && (
        <EmptyState title="Add a business first" description="Integrations are scoped to a business account." />
      )}

      {integrations.isError && (
        <ErrorState message={errorMessage(integrations.error)} onRetry={() => void integrations.refetch()} />
      )}

      {integrations.isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.data?.map((ch) => {
          const status = ch.connection?.status || "not_connected";
          const connected = status === "connected";
          return (
            <Card key={ch.code}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{ch.name}</CardTitle>
                    <CardDescription>{ch.description}</CardDescription>
                  </div>
                  <Badge variant={connected ? "success" : "neutral"}>{humanize(status)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="neutral">{humanize(ch.integration_mode)}</Badge>
                  {ch.integration_mode !== "api" && <MockBadge label="Not fully API-live" />}
                </div>
                <p className="text-navy-600">
                  Account: {ch.connection?.account_name || "—"}
                </p>
                <p className="text-xs text-navy-400">
                  Last sync: {formatDateTime(ch.connection?.last_synced_at) || "Never"}
                </p>
                {ch.connection?.last_error && (
                  <p className="text-xs text-danger">{ch.connection.last_error}</p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  {!connected ? (
                    <Button
                      size="sm"
                      loading={connect.isPending}
                      onClick={() => connect.mutate(ch.code)}
                    >
                      Connect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={disconnect.isPending}
                      onClick={() => disconnect.mutate(ch.code)}
                    >
                      Disconnect
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" disabled>
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
