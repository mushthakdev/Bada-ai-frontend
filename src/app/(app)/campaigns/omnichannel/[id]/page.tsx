"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SimulatedBadge } from "@/components/ui/data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/empty-state";
import { errorMessage } from "@/lib/api";
import { formatCurrency, formatNumber, humanize } from "@/lib/utils";
import { omnichannelService } from "@/services/omnichannel";

export default function OmnichannelCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const detail = useQuery({
    queryKey: ["omni-campaign", id],
    queryFn: () => omnichannelService.getCampaign(id),
  });

  const analytics = useQuery({
    queryKey: ["omni-analytics", id],
    queryFn: () => omnichannelService.analytics(id),
  });

  const launch = useMutation({
    mutationFn: () => omnichannelService.launch(id),
    onSuccess: (data) => {
      const partial = Boolean((data.launch as { partial_launch?: boolean } | undefined)?.partial_launch);
      toast.success(partial ? "Partial launch — some channels failed" : "Channels launched (simulated/partner)");
      void qc.invalidateQueries({ queryKey: ["omni-campaign", id] });
      void qc.invalidateQueries({ queryKey: ["omni-analytics", id] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const control = useMutation({
    mutationFn: ({ action, channel_code }: { action: string; channel_code?: string }) =>
      omnichannelService.control(id, action, channel_code),
    onSuccess: () => {
      toast.success("Channel control updated");
      void qc.invalidateQueries({ queryKey: ["omni-campaign", id] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (detail.isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (detail.isError || !detail.data) {
    return <ErrorState message={errorMessage(detail.error)} onRetry={() => void detail.refetch()} />;
  }

  const c = detail.data;
  const channels = (c.channels as Array<Record<string, unknown>>) || [];
  const summary = c.channel_status_summary as Record<string, number> | undefined;
  const launchSummary = c.launch_summary as { partial_launch?: boolean; results?: Array<Record<string, unknown>>; note?: string } | null;
  const totals = (analytics.data?.totals || {}) as Record<string, number>;
  const comparison = (analytics.data?.comparison || []) as Array<Record<string, unknown>>;
  const insight = String(analytics.data?.insight || "");

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/campaigns"
        backLabel="Campaigns"
        title={String(c.name)}
        description="Unified control across every selected advertising channel."
        badges={
          <>
            <StatusBadge status={String(c.status)} />
            <SimulatedBadge label="Simulated / partner delivery" />
          </>
        }
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={`/studio/${id}`}>AI Studio</Link>
            </Button>
            <Button loading={launch.isPending} onClick={() => launch.mutate()}>
              Launch all channels
            </Button>
            <Button
              variant="secondary"
              loading={control.isPending}
              onClick={() => control.mutate({ action: "pause" })}
            >
              Pause all
            </Button>
            <Button
              variant="secondary"
              loading={control.isPending}
              onClick={() => control.mutate({ action: "resume" })}
            >
              Resume all
            </Button>
          </>
        }
      />

      {launchSummary?.partial_launch && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Partial launch: some channels are live (simulated) while others failed. Review channel statuses below.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Channels", summary?.total ?? channels.length],
          ["Active", summary?.active ?? 0],
          ["Failed", summary?.failed ?? 0],
          ["Budget", formatCurrency(Number((c.budget as { total_budget?: number } | undefined)?.total_budget || 0))],
        ].map(([label, value]) => (
          <Card key={String(label)} className="p-4">
            <p className="text-xs uppercase text-navy-400">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-navy-900">{value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Channel status</CardTitle>
          <CardDescription>
            Each channel tracks its own provider result. A single failure does not mark the whole campaign successful.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {channels.map((ch) => (
            <div
              key={String(ch.id)}
              className="flex flex-col gap-3 rounded-lg border border-line p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-navy-900">{String(ch.channel_name)}</p>
                  <StatusBadge status={String(ch.status)} />
                  {Boolean(ch.is_simulated) && <SimulatedBadge />}
                </div>
                <p className="mt-1 text-sm text-navy-500">
                  Budget {formatCurrency(Number(ch.allocated_budget))} · {humanize(String(ch.integration_mode))}
                </p>
                {ch.last_error ? <p className="mt-1 text-xs text-danger">{String(ch.last_error)}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => control.mutate({ action: "pause", channel_code: String(ch.channel_code) })}
                >
                  Pause
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => control.mutate({ action: "resume", channel_code: String(ch.channel_code) })}
                >
                  Resume
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Channel comparison</CardTitle>
            <CardDescription>Compatible metrics only (impressions, spend, leads, video views).</CardDescription>
          </CardHeader>
          <CardContent>
            {comparison.length === 0 ? (
              <p className="text-sm text-navy-500">Launch to generate channel metrics.</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparison}>
                    <CartesianGrid vertical={false} stroke="#e8ecf1" />
                    <XAxis dataKey="channel_code" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="impressions" fill="#0B5FFF" name="Impressions" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="leads" fill="#8BB2FF" name="Leads" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unified totals</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Spend", formatCurrency(Number(totals.spend || 0))],
              ["Impressions", formatNumber(Number(totals.impressions || 0))],
              ["Reach", formatNumber(Number(totals.reach || 0))],
              ["Clicks", formatNumber(Number(totals.clicks || 0))],
              ["Video views", formatNumber(Number(totals.video_views || 0))],
              ["QR scans", formatNumber(Number(totals.qr_scans || 0))],
              ["Leads", formatNumber(Number(totals.leads || 0))],
              ["CPL", totals.cost_per_lead != null ? formatCurrency(Number(totals.cost_per_lead)) : "—"],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg bg-surface p-3">
                <p className="text-xs text-navy-400">{label}</p>
                <p className="mt-1 font-semibold text-navy-900">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {insight && (
        <Card>
          <CardHeader>
            <CardTitle>AI performance summary</CardTitle>
            <CardDescription>Grounded in recorded Bada metrics only.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-navy-700">{insight}</p>
            {analytics.data?.data_quality ? (
              <p className="mt-3 text-xs text-navy-400">
                {String((analytics.data.data_quality as { label?: string }).label || "")}
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}

      {launchSummary?.note && (
        <p className="text-xs text-navy-400">{launchSummary.note}</p>
      )}
    </div>
  );
}
