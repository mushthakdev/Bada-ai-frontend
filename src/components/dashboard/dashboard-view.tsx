"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Eye,
  IndianRupee,
  Lightbulb,
  Megaphone,
  MessageCircle,
  Phone,
  Plus,
  QrCode,
  Sparkles,
  Target,
  Users,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { SimulatedBadge, SimulatedNotice } from "@/components/ui/data-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { RangeTabs } from "@/components/dashboard/range-tabs";
import { FunnelBars, LeadsChart, PincodeChart, TrafficChart } from "@/components/dashboard/charts";
import { StatCard, StatCardSkeleton, type StatFormat } from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/use-queries";
import { errorMessage } from "@/lib/api";
import { AGENT_NAME } from "@/lib/constants";
import { cn, formatCurrency, formatDate, formatNumber, humanize } from "@/lib/utils";
import type { DashboardTotals, DateRange } from "@/types";

export const STAT_CONFIG: Array<{
  key: keyof DashboardTotals;
  label: string;
  format: StatFormat;
  icon: LucideIcon;
  /** Delivery-derived metrics get the Simulated badge when the API says data is simulated. */
  delivery: boolean;
}> = [
  { key: "impressions", label: "Impressions", format: "number", icon: Eye, delivery: true },
  { key: "estimated_reach", label: "Estimated reach", format: "number", icon: Users, delivery: true },
  { key: "qr_scans", label: "QR scans", format: "number", icon: QrCode, delivery: true },
  { key: "leads", label: "Leads", format: "number", icon: Target, delivery: true },
  { key: "whatsapp_inquiries", label: "WhatsApp inquiries", format: "number", icon: MessageCircle, delivery: true },
  { key: "phone_calls", label: "Phone calls", format: "number", icon: Phone, delivery: true },
  { key: "website_visits", label: "Website visits", format: "number", icon: Globe, delivery: true },
  { key: "spend", label: "Spend", format: "currency", icon: IndianRupee, delivery: false },
  { key: "active_campaigns", label: "Active campaigns", format: "number", icon: Megaphone, delivery: false },
];

type StatusBucket = "delivering" | "paused" | "blocked" | "draft";

const STATUS_BUCKETS: Record<StatusBucket, { label: string; tone: string; match: (s: string) => boolean }> = {
  delivering: {
    label: "Delivering",
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    match: (s) => ["active", "scheduled", "approved"].includes(s),
  },
  paused: {
    label: "Paused",
    tone: "bg-amber-50 text-amber-700 ring-amber-100",
    match: (s) => s === "paused",
  },
  blocked: {
    label: "Blocked",
    tone: "bg-rose-50 text-rose-700 ring-rose-100",
    match: (s) => ["rejected", "failed", "cancelled", "payment_pending"].includes(s),
  },
  draft: {
    label: "Draft",
    tone: "bg-surface text-navy-600 ring-line",
    match: (s) => ["draft", "creative_generating", "ready_for_review"].includes(s),
  },
};

function bucketStatus(status: string): StatusBucket {
  const s = status.toLowerCase();
  for (const [key, cfg] of Object.entries(STATUS_BUCKETS) as Array<[StatusBucket, (typeof STATUS_BUCKETS)[StatusBucket]]>) {
    if (cfg.match(s)) return key;
  }
  return "draft";
}

export function DashboardView() {
  const [range, setRange] = useState<DateRange>("30d");
  const { data, isPending, isError, error, refetch, isFetching } = useDashboard(range);

  const simulated = Boolean(data?.data_quality?.is_simulated);
  const totals = data?.totals ?? {};
  const noCampaigns = (totals.campaigns ?? 0) === 0 && (data?.recent_campaigns?.length ?? 0) === 0;
  const hasSeries = (data?.timeseries?.length ?? 0) > 0;

  const statusCounts = useMemo(() => {
    const counts: Record<StatusBucket, number> = { delivering: 0, paused: 0, blocked: 0, draft: 0 };
    for (const c of data?.recent_campaigns ?? []) {
      counts[bucketStatus(c.status)] += 1;
    }
    if (typeof totals.active_campaigns === "number" && counts.delivering === 0 && totals.active_campaigns > 0) {
      counts.delivering = totals.active_campaigns;
    }
    return counts;
  }, [data?.recent_campaigns, totals.active_campaigns]);

  const recommendations = useMemo(() => {
    const fromApi = data?.insights ?? [];
    if (fromApi.length > 0) {
      return fromApi.slice(0, 4).map((text, i) => ({
        id: `insight-${i}`,
        title: i === 0 ? "Optimize your budget" : i === 1 ? "Expand reach" : "Improve performance",
        body: text,
        outcome: i === 0 ? "Scale what's working" : "Actionable next step",
      }));
    }
    return [
      {
        id: "rec-budget",
        title: "Optimize your budget",
        body: "Shift spend toward campaigns with stronger lead efficiency this period.",
        outcome: "+ more leads / day",
      },
      {
        id: "rec-reach",
        title: "Expand reach",
        body: "Broaden geo or audience targeting on under-delivering campaigns.",
        outcome: "Improve delivery",
      },
      {
        id: "rec-tracking",
        title: "Fix your tracking",
        body: "Confirm QR and lead capture links are live so outcomes stay measurable.",
        outcome: "Cleaner attribution",
      },
    ];
  }, [data?.insights]);

  const trendStats = STAT_CONFIG.filter((s) =>
    ["spend", "impressions", "leads", "active_campaigns"].includes(s.key),
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={data ? `${formatDate(data.range.start)} – ${formatDate(data.range.end)}` : "Track performance and act on recommendations."}
        badges={simulated && data ? <SimulatedBadge label={data.data_quality.label} /> : undefined}
        actions={
          <>
            <RangeTabs value={range} onChange={setRange} />
            <Button asChild>
              <Link href="/campaigns/new">
                <Plus /> New campaign
              </Link>
            </Button>
          </>
        }
      />

      {simulated && !noCampaigns && <SimulatedNotice className="mb-6" />}

      {isError ? (
        <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      ) : noCampaigns ? (
        <EmptyState
          icon={Megaphone}
          title="No campaign data yet"
          description="Once you create and launch a campaign, impressions, scans and leads will show up here."
          action={
            <Button asChild>
              <Link href="/campaigns/new">Create your first campaign</Link>
            </Button>
          }
        />
      ) : (
        <div className={isFetching ? "space-y-6 opacity-70 transition-opacity" : "space-y-6"}>
          {/* Module 1 — Last N days trends */}
          <Card className="overflow-hidden">
            <CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Performance trends</CardTitle>
                <CardDescription>Spend, impressions, and response over the selected period</CardDescription>
              </div>
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-navy-400">Spend</p>
                  <p className="tabular font-display text-xl font-semibold text-navy-900">
                    {formatCurrency(totals.spend)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-navy-400">Impressions</p>
                  <p className="tabular font-display text-xl font-semibold text-navy-900">
                    {formatNumber(totals.impressions)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-navy-400">Leads</p>
                  <p className="tabular font-display text-xl font-semibold text-navy-900">
                    {formatNumber(totals.leads)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {hasSeries ? (
                <TrafficChart data={data.timeseries} />
              ) : (
                <p className="py-16 text-center text-sm text-navy-400">No trend data in this period.</p>
              )}
            </CardContent>
          </Card>

          {/* Modules 2–4 — Forecaster-style recs + recommendations + campaigns status */}
          <div className="grid gap-6 xl:grid-cols-12">
            <Card className="xl:col-span-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Sparkles className="size-4" aria-hidden />
                  </span>
                  <div>
                    <CardTitle>Performance forecaster</CardTitle>
                    <CardDescription>Budget impact modeled from recent delivery</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-2xl bg-surface p-4">
                  <p className="text-sm font-medium text-navy-900">
                    Raise daily budget to scale leads
                  </p>
                  <p className="mt-1 text-sm text-navy-500">
                    Based on current efficiency, a modest budget lift can improve weekly lead volume.
                  </p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-navy-400">Current</p>
                      <p className="tabular font-display text-lg font-semibold text-navy-900">
                        {formatCurrency(Math.round((totals.spend ?? 0) / 30) || 0)}
                        <span className="text-sm font-medium text-navy-400">/day</span>
                      </p>
                    </div>
                    <ArrowRight className="mb-2 size-4 text-brand-500" aria-hidden />
                    <div className="text-right">
                      <p className="text-xs text-brand-600">Recommended</p>
                      <p className="tabular font-display text-lg font-semibold text-brand-700">
                        {formatCurrency(Math.round(((totals.spend ?? 0) / 30) * 1.4) || 2500)}
                        <span className="text-sm font-medium text-brand-400">/day</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-brand-300 to-brand-600" />
                  </div>
                </div>
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/campaigns">View campaigns</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="xl:col-span-5">
              <CardHeader className="flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="size-4 text-brand-600" aria-hidden />
                  <CardTitle>Recommendations</CardTitle>
                </div>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                  {recommendations.length}
                </span>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-line">
                  {recommendations.map((rec) => (
                    <li key={rec.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-navy-900">{rec.title}</p>
                        <p className="mt-1 text-sm text-navy-500">{rec.body}</p>
                        <p className="mt-2 text-xs font-medium text-brand-600">{rec.outcome}</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button size="sm" variant="secondary" asChild>
                          <Link href="/campaigns">Review</Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link href="/assistant">Apply</Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="xl:col-span-3">
              <CardHeader>
                <CardTitle>Campaigns</CardTitle>
                <CardDescription>Pipeline by status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(Object.keys(STATUS_BUCKETS) as StatusBucket[]).map((key) => {
                  const cfg = STATUS_BUCKETS[key];
                  return (
                    <div
                      key={key}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-3.5 py-3 ring-1 ring-inset",
                        cfg.tone,
                      )}
                    >
                      <span className="text-sm font-medium">{cfg.label}</span>
                      <span className="tabular text-lg font-semibold">{statusCounts[key]}</span>
                    </div>
                  );
                })}
                <Button asChild variant="ghost" className="w-full justify-between rounded-xl px-2">
                  <Link href="/campaigns">
                    View all campaigns <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* KPI strip */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {trendStats
              .filter((s) => totals[s.key] !== undefined)
              .map((s) => (
                <StatCard
                  key={s.key}
                  label={s.label}
                  value={totals[s.key]}
                  format={s.format}
                  icon={s.icon}
                  simulated={simulated && s.delivery}
                  compact
                />
              ))}
          </div>

          {hasSeries ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Leads &amp; QR scans</CardTitle>
                  <CardDescription>Responses driven by your ads</CardDescription>
                </CardHeader>
                <CardContent>
                  <LeadsChart data={data.timeseries} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Response funnel</CardTitle>
                  <CardDescription>From impressions to leads</CardDescription>
                </CardHeader>
                <CardContent>
                  <FunnelBars funnel={data.funnel} />
                </CardContent>
              </Card>
            </div>
          ) : (
            <EmptyState
              title="No metrics in this period"
              description="There's no delivery data for the selected date range. Try a longer range."
            />
          )}

          <div className="grid gap-6 lg:grid-cols-12">
            <Card className="lg:col-span-5">
              <CardHeader>
                <CardTitle>Top pincodes by leads</CardTitle>
              </CardHeader>
              <CardContent>
                {data.top_pincodes.length > 0 ? (
                  <PincodeChart data={data.top_pincodes} />
                ) : (
                  <p className="py-10 text-center text-sm text-navy-400">No pincode-level leads yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-4">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Recent campaigns</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/campaigns">View all</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {data.recent_campaigns.length === 0 ? (
                  <p className="py-6 text-center text-sm text-navy-400">No campaigns yet.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {data.recent_campaigns.map((c) => (
                      <li key={c.id} className="flex items-center justify-between gap-4 py-3">
                        <div className="min-w-0">
                          <Link
                            href={`/campaigns/${c.id}`}
                            className="block truncate font-medium text-navy-900 hover:text-brand-700"
                          >
                            {c.name}
                          </Link>
                          <span className="text-xs text-navy-400">{humanize(c.objective)}</span>
                        </div>
                        <StatusBadge status={c.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Feed / Help — Vibe-style side modules */}
            <div className="flex flex-col gap-6 lg:col-span-3">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>BADA feed</CardTitle>
                  <CardDescription>Tips and product updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {[
                      {
                        title: "AI recommendations",
                        body: "Apply budget and reach suggestions directly from your dashboard.",
                      },
                      {
                        title: "Omnichannel campaigns",
                        body: "Launch coordinated TV + digital flights from one brief.",
                      },
                      {
                        title: `Ask ${AGENT_NAME}`,
                        body: "Ask natural-language questions about spend, leads, and delivery.",
                      },
                    ].map((item) => (
                      <li key={item.title} className="rounded-2xl bg-surface p-3.5">
                        <p className="text-sm font-semibold text-navy-900">{item.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-navy-500">{item.body}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-brand-100 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
                <CardContent className="p-5">
                  <p className="text-sm font-semibold text-white/80">Need a hand?</p>
                  <p className="mt-1 font-display text-xl font-semibold tracking-tight">Talk to a BADA expert</p>
                  <p className="mt-2 text-sm text-white/75">
                    Strategy, measurement, and campaign setup — we&apos;re here to help.
                  </p>
                  <Button asChild variant="onDark" size="sm" className="mt-4">
                    <Link href="/assistant">Ask {AGENT_NAME}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Recent leads</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/leads">View all</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {data.recent_leads.length === 0 ? (
                  <p className="py-6 text-center text-sm text-navy-400">No leads yet.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {data.recent_leads.map((l) => (
                      <li key={l.id} className="flex items-center justify-between gap-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-navy-900">{l.name ?? "Unnamed lead"}</p>
                          <span className="text-xs text-navy-400">
                            {humanize(l.source)} · {formatDate(l.created_at)}
                          </span>
                        </div>
                        <StatusBadge status={l.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All metrics</CardTitle>
                <CardDescription>Full KPI set for the selected range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {STAT_CONFIG.filter((s) => totals[s.key] !== undefined).map((s) => (
                    <div key={s.key} className="rounded-2xl bg-surface px-3.5 py-3">
                      <p className="text-xs font-medium text-navy-400">{s.label}</p>
                      <p className="tabular mt-1 font-display text-lg font-semibold text-navy-900">
                        {s.format === "currency"
                          ? formatCurrency(totals[s.key] as number)
                          : formatNumber(totals[s.key] as number)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
