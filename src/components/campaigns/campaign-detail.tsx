"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, CreditCard, Pause, Pencil, Play, Send, Sparkles, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { MockBadge, SimulatedBadge } from "@/components/ui/data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { useCampaign } from "@/hooks/use-queries";
import { errorMessage } from "@/lib/api";
import { formatCurrency, formatDate, formatNumber, humanize } from "@/lib/utils";
import { aiService } from "@/services/ai";
import { campaignService } from "@/services/campaigns";
import type { Campaign } from "@/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-navy-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-navy-900">{children || "—"}</dd>
    </div>
  );
}

function BudgetCard({ campaign }: { campaign: Campaign }) {
  const b = campaign.budget;
  if (!b) {
    return (
      <EmptyState
        title="No budget set"
        description="Edit this campaign to add a budget and see an itemised estimate."
        action={
          <Button asChild variant="secondary">
            <Link href={`/campaigns/${campaign.id}/edit`}>Edit campaign</Link>
          </Button>
        }
      />
    );
  }
  const rows: Array<[string, string]> = [
    ["Daily budget", formatCurrency(b.daily_budget, b.currency)],
    ["Total budget", formatCurrency(b.total_budget, b.currency)],
    ["Media spend", formatCurrency(b.media_spend, b.currency)],
    ["Platform fee", formatCurrency(b.platform_fee, b.currency)],
    ["Tax", formatCurrency(b.tax_amount, b.currency)],
  ];
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>Budget breakdown</CardTitle>
          <CardDescription>Calculated by Bada from current pricing</CardDescription>
        </div>
        {b.is_estimate && <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">Estimate</span>}
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-line text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between py-2.5">
              <dt className="text-navy-500">{k}</dt>
              <dd className="tabular font-medium text-navy-900">{v}</dd>
            </div>
          ))}
          <div className="flex justify-between py-3">
            <dt className="font-semibold text-navy-900">Total payable</dt>
            <dd className="tabular text-base font-semibold text-navy-900">{formatCurrency(b.total_payable, b.currency)}</dd>
          </div>
        </dl>
        <div className="mt-2 grid gap-3 rounded-lg bg-surface p-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-navy-500">Est. CPM</p>
            <p className="tabular font-semibold">{formatCurrency(b.estimated_cpm, b.currency)}</p>
          </div>
          <div>
            <p className="text-navy-500">Est. impressions</p>
            <p className="tabular font-semibold">{formatNumber(b.estimated_impressions)}</p>
          </div>
          <div>
            <p className="text-navy-500">Est. reach</p>
            <p className="tabular font-semibold">{formatNumber(b.estimated_reach)}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-navy-400">Impression and reach figures are estimates, not guarantees of delivery.</p>
      </CardContent>
    </Card>
  );
}

function CreativesTab({ campaignId }: { campaignId: string }) {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["creatives", campaignId],
    queryFn: () => aiService.creatives({ campaign_id: campaignId }),
  });
  if (isPending) return <Skeleton className="h-40 rounded-xl" />;
  if (isError) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;
  if (data.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No creatives yet"
        description="Generate your ad in AI Studio."
        action={
          <Button asChild>
            <Link href={`/studio/${campaignId}`}>Open AI Studio</Link>
          </Button>
        }
      />
    );
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((c) => (
        <li key={c.id}>
          <Link href={`/editor/${c.id}`} className="block rounded-xl border border-line bg-white p-4 shadow-soft hover:border-brand-300">
            <p className="font-semibold text-navy-900">{c.title}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge status={c.status} />
              {c.is_mock && <MockBadge />}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function CampaignDetail({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const { data: c, isPending, isError, error, refetch } = useCampaign(id);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const statusMutation = useMutation({
    mutationFn: ({ status, reason }: { status: string; reason?: string }) => campaignService.updateStatus(id, status, reason),
    onSuccess: (_d, vars) => {
      void queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      void queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success(`Campaign ${humanize(vars.status).toLowerCase()}`);
      setConfirmCancel(false);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (isPending) return <Skeleton className="h-96 rounded-xl" />;
  if (isError) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;

  const status = c.status;
  const canEdit = ["draft", "ready_for_review", "rejected", "failed"].includes(status);
  const canPay = ["ready_for_review", "approved", "payment_pending"].includes(status);
  const needsCreative = ["draft", "rejected", "failed"].includes(status);
  const canStart = status === "scheduled" && c.is_simulated_delivery;
  const canPause = status === "active";
  const canResume = status === "paused";
  const canCancel = !["completed", "cancelled"].includes(status);

  return (
    <div>
      <PageHeader
        backHref="/campaigns"
        backLabel="Campaigns"
        title={c.name}
        description={c.description ?? undefined}
        badges={
          <>
            <StatusBadge status={status} />
            {c.is_simulated_delivery && <SimulatedBadge label="Simulated delivery" />}
          </>
        }
        actions={
          <>
            {canEdit && (
              <Button asChild variant="secondary">
                <Link href={`/campaigns/${id}/edit`}>
                  <Pencil /> Edit
                </Link>
              </Button>
            )}
            <Button asChild variant={needsCreative ? "default" : "secondary"}>
              <Link href={`/studio/${id}`}>
                <Sparkles /> AI Studio
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={`/campaigns/${id}/analytics`}>
                <BarChart3 /> Analytics
              </Link>
            </Button>
            {canPay && (
              <Button asChild>
                <Link href={`/payments?campaign=${id}`}>
                  <CreditCard /> Pay
                </Link>
              </Button>
            )}
            {canStart && (
              <Button variant="navy" loading={statusMutation.isPending} onClick={() => statusMutation.mutate({ status: "active" })}>
                <Send /> Start simulated delivery
              </Button>
            )}
            {canPause && (
              <Button variant="secondary" loading={statusMutation.isPending} onClick={() => statusMutation.mutate({ status: "paused" })}>
                <Pause /> Pause
              </Button>
            )}
            {canResume && (
              <Button loading={statusMutation.isPending} onClick={() => statusMutation.mutate({ status: "active" })}>
                <Play /> Resume
              </Button>
            )}
            {canCancel && (
              <Button variant="ghost" onClick={() => setConfirmCancel(true)}>
                <XCircle /> Cancel
              </Button>
            )}
          </>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="creatives">Creatives</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Campaign details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-5 sm:grid-cols-2">
                  <Field label="Objective">{humanize(c.objective)}</Field>
                  <Field label="Language">{c.language.toUpperCase()}</Field>
                  <Field label="Video length">{c.video_duration} seconds</Field>
                  <Field label="Created">{formatDate(c.created_at)}</Field>
                  <Field label="Start date">{formatDate(c.start_date)}</Field>
                  <Field label="End date">{formatDate(c.end_date)}</Field>
                  <Field label="Pincodes targeted">
                    {c.locations && c.locations.length > 0 ? (
                      <span className="flex flex-wrap gap-1.5">
                        {c.locations.map((l) => (
                          <span key={l.pincode} className="rounded-full bg-brand-50 px-2.5 py-0.5 font-mono text-xs text-brand-800">
                            {l.pincode}
                          </span>
                        ))}
                      </span>
                    ) : (
                      `${c.location_count} pincode${c.location_count === 1 ? "" : "s"}`
                    )}
                  </Field>
                  {c.audience?.demographics && <Field label="Audience">{c.audience.demographics}</Field>}
                </dl>
                {c.brief_text && (
                  <div className="mt-6 border-t border-line pt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-navy-400">Brief</p>
                    <p className="mt-1.5 whitespace-pre-line text-sm text-navy-700">{c.brief_text}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Next steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-navy-600">
                <p>1. Generate your ad in <Link className="font-medium text-brand-700 hover:underline" href={`/studio/${id}`}>AI Studio</Link>. The campaign moves to &ldquo;Ready for review&rdquo;.</p>
                <p>2. Review the budget estimate, then <Link className="font-medium text-brand-700 hover:underline" href={`/payments?campaign=${id}`}>pay</Link>. Bada reviews the creative before launch.</p>
                <p>3. Once scheduled and running, results appear under Analytics.</p>
                {c.is_simulated_delivery && (
                  <p className="rounded-lg bg-amber-50 p-3 text-amber-900">
                    Delivery for this campaign is simulated. Metrics will be labelled accordingly.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budget">
          <div className="max-w-2xl">
            <BudgetCard campaign={c} />
          </div>
        </TabsContent>

        <TabsContent value="creatives">
          <CreativesTab campaignId={id} />
        </TabsContent>
      </Tabs>

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this campaign?</DialogTitle>
            <DialogDescription>This stops the campaign. You can&apos;t undo this action.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmCancel(false)}>
              Keep campaign
            </Button>
            <Button
              variant="destructive"
              loading={statusMutation.isPending}
              onClick={() => statusMutation.mutate({ status: "cancelled" })}
            >
              Cancel campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
