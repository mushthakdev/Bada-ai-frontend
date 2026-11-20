"use client";

import { BarChart3, Clock, IndianRupee, PlayCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { SimulatedBadge, SimulatedNotice } from "@/components/ui/data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { FunnelBars, LeadsChart, TrafficChart } from "@/components/dashboard/charts";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/stat-card";
import { STAT_CONFIG } from "@/components/dashboard/dashboard-view";
import { useCampaignAnalytics } from "@/hooks/use-queries";
import { errorMessage } from "@/lib/api";

export function CampaignAnalyticsView({ id }: { id: string }) {
  // The campaign analytics endpoint returns the full history (no range filter).
  const { data, isPending, isError, error, refetch } = useCampaignAnalytics(id);
  const simulated = Boolean(data?.data_quality?.is_simulated);
  const hasData = Boolean(data && (data.timeseries.length > 0 || (data.totals.impressions ?? 0) > 0));

  return (
    <div>
      <PageHeader
        backHref={`/campaigns/${id}`}
        backLabel="Campaign"
        title={data ? `${data.campaign_name} — analytics` : "Campaign analytics"}
        badges={
          data && (
            <>
              <StatusBadge status={data.status} />
              {simulated && <SimulatedBadge label={data.data_quality.label} />}
            </>
          )
        }
      />
      {simulated && hasData && <SimulatedNotice className="mb-6" />}

      {isError ? (
        <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      ) : !hasData ? (
        <EmptyState
          icon={BarChart3}
          title="No results yet"
          description="Analytics appear once this campaign is running and collecting data."
        />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STAT_CONFIG.filter((s) => data.totals[s.key] !== undefined && s.key !== "active_campaigns").map((s) => (
              <StatCard key={s.key} label={s.label} value={data.totals[s.key]} format={s.format} icon={s.icon} simulated={simulated && s.delivery} />
            ))}
            <StatCard
              label="Video completion rate"
              value={data.video_completion_rate}
              format="percent"
              icon={PlayCircle}
              simulated={simulated}
            />
            <StatCard
              label="Cost per lead"
              value={data.cost_per_lead}
              format="currency"
              icon={IndianRupee}
              hint={data.cost_per_lead === null ? "No leads yet" : undefined}
            />
            <StatCard label="Completed views" value={data.totals.completed_views} icon={Clock} simulated={simulated} />
          </div>

          {data.timeseries.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Impressions</CardTitle>
                </CardHeader>
                <CardContent>
                  <TrafficChart data={data.timeseries} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Leads &amp; QR scans</CardTitle>
                </CardHeader>
                <CardContent>
                  <LeadsChart data={data.timeseries} />
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Response funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <FunnelBars funnel={data.funnel} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
