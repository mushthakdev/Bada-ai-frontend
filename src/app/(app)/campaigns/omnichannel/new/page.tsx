"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { Stepper } from "@/components/ui/stepper";
import { Badge } from "@/components/ui/badge";
import { SimulatedBadge } from "@/components/ui/data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBusinesses } from "@/hooks/use-queries";
import { errorMessage } from "@/lib/api";
import { formatCurrency, humanize } from "@/lib/utils";
import { formatsForChannels } from "@/lib/creative-formats";
import {
  omnichannelService,
  type MarketplaceChannel,
  type MediaPlan,
  type MediaPlanAllocation,
} from "@/services/omnichannel";

const STEPS = ["Objective", "Creative", "Channels", "Audience", "Budget", "Schedule", "Review"];

const OBJECTIVES = [
  "brand_awareness",
  "reach",
  "video_views",
  "website_traffic",
  "whatsapp_leads",
  "phone_calls",
  "store_visits",
  "sales",
  "lead_generation",
];

export default function NewOmnichannelCampaignPage() {
  const router = useRouter();
  const businesses = useBusinesses();
  const business = businesses.data?.[0];

  const [step, setStep] = useState(0);
  const [objective, setObjective] = useState("store_visits");
  const [name, setName] = useState("Wedding collection — omnichannel");
  const [brief, setBrief] = useState(
    "Jewellery shop in Kochi promoting wedding collection across TV, social, and local screens.",
  );
  const [language, setLanguage] = useState("ml");
  const [selected, setSelected] = useState<string[]>(["youtube", "meta", "ctv", "local_screens"]);
  const [budget, setBudget] = useState(20000);
  const [dailyBudget, setDailyBudget] = useState(2000);
  const [pincode, setPincode] = useState("682016");
  const [city, setCity] = useState("Kochi");
  const [stateName, setStateName] = useState("Kerala");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [plan, setPlan] = useState<MediaPlan | null>(null);
  const [allocations, setAllocations] = useState<MediaPlanAllocation[]>([]);

  const channels = useQuery({
    queryKey: ["marketplace-channels"],
    queryFn: () => omnichannelService.channels(),
  });

  const channelMap = useMemo(() => {
    const m = new Map<string, MarketplaceChannel>();
    for (const c of channels.data || []) m.set(c.code, c);
    return m;
  }, [channels.data]);

  const planMutation = useMutation({
    mutationFn: () =>
      omnichannelService.mediaPlan({
        business_id: business?.id,
        business_type: business?.category || "Jewellery",
        product: "Wedding collection",
        objective,
        budget,
        location: `${city}, ${stateName}`,
        audience: "Adults 25-54 near store",
        duration_days: 14,
        selected_channels: selected,
      }),
    onSuccess: (data) => {
      setPlan(data);
      setAllocations(data.allocations);
      toast.success("AI media plan ready (estimates)");
      setStep(4);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const equalMutation = useMutation({
    mutationFn: () => omnichannelService.equalAlloc(selected, budget),
    onSuccess: (data) => {
      setAllocations(data);
      toast.success("Equal allocation applied");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const createMutation = useMutation({
    mutationFn: () => {
      if (!business?.id) throw new Error("Business required");
      return omnichannelService.createCampaign({
        business_id: business.id,
        name,
        objective,
        brief_text: brief,
        language,
        channel_codes: selected,
        allocations: allocations.map((a) => ({
          channel_code: a.channel_code,
          budget: a.budget,
        })),
        locations: [{ pincode, city, state: stateName }],
        audience: {
          demographics: "Adults 25-54",
          interests: "Jewellery, weddings",
          languages: [language, "en"],
          age_min: 25,
          age_max: 54,
        },
        total_budget: budget,
        daily_budget: dailyBudget,
        start_date: startDate,
        end_date: endDate,
        media_plan: plan || undefined,
      });
    },
    onSuccess: (data) => {
      toast.success("Omnichannel campaign created");
      const id = String(data.id);
      router.push(`/campaigns/omnichannel/${id}`);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const toggleChannel = (code: string) => {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const updateAlloc = (code: string, value: number) => {
    setAllocations((prev) =>
      prev.map((a) => (a.channel_code === code ? { ...a, budget: value } : a)),
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Omnichannel campaign"
        description="One campaign across YouTube, Meta, CTV, OTT, publishers, and local screens."
        badges={<SimulatedBadge label="Partner / simulated launch modes" />}
      />

      <Stepper steps={STEPS} current={step} />

      {step === 0 && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Campaign objective</CardTitle>
            <CardDescription>Choose what success looks like for this launch.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Campaign name</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Objective</span>
              <NativeSelect value={objective} onChange={(e) => setObjective(e.target.value)}>
                {OBJECTIVES.map((o) => (
                  <option key={o} value={o}>
                    {humanize(o)}
                  </option>
                ))}
              </NativeSelect>
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Brief</span>
              <Textarea rows={4} value={brief} onChange={(e) => setBrief(e.target.value)} />
            </label>
            <Button onClick={() => setStep(1)}>Continue to creative</Button>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Creative brief</CardTitle>
              <CardDescription>
                One brief feeds Universal Creative Studio — formats adapt by aspect ratio, safe zones, and channel,
                not naive crops. Full generation opens in AI Studio after create.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Creative brief</span>
                <Textarea rows={4} value={brief} onChange={(e) => setBrief(e.target.value)} />
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Language</span>
                <NativeSelect value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="ml">Malayalam</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ta">Tamil</option>
                </NativeSelect>
              </label>
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                Format cards below preview the adaptation plan for your selected channels. Rendered assets require a
                configured generation provider.
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button onClick={() => setStep(2)}>Continue to channels</Button>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {formatsForChannels(selected).map((f) => (
              <Card key={f.format_key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{f.label}</CardTitle>
                  <CardDescription>
                    {f.aspect_ratio}
                    {f.duration_seconds ? ` · ${f.duration_seconds}s` : " · static"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-navy-600">
                  <p>
                    <span className="font-medium text-navy-800">Safe zone:</span> {f.safe_zone}
                  </p>
                  <p>
                    <span className="font-medium text-navy-800">Adaptation:</span> {f.adaptation}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select channels</CardTitle>
              <CardDescription>Pick multiple platforms for this single campaign.</CardDescription>
            </CardHeader>
          </Card>
          {channels.isLoading && <Skeleton className="h-40 rounded-xl" />}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {channels.data?.map((ch) => {
              const on = selected.includes(ch.code);
              return (
                <button
                  key={ch.code}
                  type="button"
                  onClick={() => toggleChannel(ch.code)}
                  className={`rounded-xl border p-4 text-left transition ${
                    on ? "border-brand-600 bg-brand-50" : "border-line bg-white hover:border-brand-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-navy-900">{ch.name}</p>
                      <p className="mt-1 text-xs text-navy-500">{ch.description}</p>
                    </div>
                    <Badge variant={on ? "brand" : "neutral"}>{on ? "Selected" : "Add"}</Badge>
                  </div>
                  <p className="mt-3 text-xs text-navy-500">
                    {humanize(ch.integration_mode)} · min {formatCurrency(ch.minimum_budget)} ·{" "}
                    {humanize(ch.connection?.status || "not_connected")}
                  </p>
                  {ch.is_estimate_pricing && (
                    <p className="mt-1 text-[11px] text-amber-700">Estimate pricing</p>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button disabled={selected.length === 0} onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Audience & location</CardTitle>
            <CardDescription>
              Central targeting is filtered per channel — unsupported parameters are not sent.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">City</span>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">State</span>
              <Input value={stateName} onChange={(e) => setStateName(e.target.value)} />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Pincode</span>
              <Input value={pincode} onChange={(e) => setPincode(e.target.value)} />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Language</span>
              <NativeSelect value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="ml">Malayalam</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
              </NativeSelect>
            </label>
            <div className="sm:col-span-2 flex gap-2">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button loading={planMutation.isPending} onClick={() => planMutation.mutate()}>
                Generate AI media plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget allocation</CardTitle>
              <CardDescription>
                Total {formatCurrency(budget)}. {plan?.strategy_summary}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Total budget (₹)</span>
                  <Input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Daily budget (₹)</span>
                  <Input
                    type="number"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(Number(e.target.value))}
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  loading={planMutation.isPending}
                  onClick={() => planMutation.mutate()}
                >
                  AI recommend
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  loading={equalMutation.isPending}
                  onClick={() => equalMutation.mutate()}
                >
                  Equal split
                </Button>
              </div>
              <div className="space-y-3">
                {allocations.map((a) => (
                  <div
                    key={a.channel_code}
                    className="flex flex-col gap-2 rounded-lg border border-line p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-navy-900">{a.channel_name}</p>
                      <p className="text-xs text-navy-500">{a.reason || channelMap.get(a.channel_code)?.notes}</p>
                    </div>
                    <Input
                      type="number"
                      className="sm:w-36"
                      value={a.budget}
                      onChange={(e) => updateAlloc(a.channel_code, Number(e.target.value))}
                    />
                  </div>
                ))}
              </div>
              {plan?.data_quality && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  {plan.data_quality.label}
                </p>
              )}
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button onClick={() => setStep(5)}>Continue</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 5 && (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Start</span>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">End</span>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
            <div className="sm:col-span-2 flex gap-2">
              <Button variant="secondary" onClick={() => setStep(4)}>
                Back
              </Button>
              <Button onClick={() => setStep(6)}>Review</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 6 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & create</CardTitle>
            <CardDescription>Launch happens after creation from the campaign page — per channel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-navy-400">Name</dt>
                <dd className="font-medium">{name}</dd>
              </div>
              <div>
                <dt className="text-navy-400">Objective</dt>
                <dd className="font-medium">{humanize(objective)}</dd>
              </div>
              <div>
                <dt className="text-navy-400">Budget</dt>
                <dd className="font-medium">{formatCurrency(budget)}</dd>
              </div>
              <div>
                <dt className="text-navy-400">Schedule</dt>
                <dd className="font-medium">
                  {startDate} → {endDate}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-navy-400">Creative formats planned</dt>
                <dd className="font-medium">
                  {formatsForChannels(selected)
                    .map((f) => f.label)
                    .join(" · ")}
                </dd>
              </div>
            </dl>
            <ul className="space-y-2">
              {allocations.map((a) => (
                <li key={a.channel_code} className="flex justify-between rounded-lg border border-line px-3 py-2">
                  <span>{a.channel_name}</span>
                  <span className="font-medium">{formatCurrency(a.budget)}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(5)}>
                Back
              </Button>
              <Button loading={createMutation.isPending} onClick={() => createMutation.mutate()}>
                Create omnichannel campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
