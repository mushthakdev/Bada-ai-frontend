"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/empty-state";
import { FormError, FormField } from "@/components/ui/form-field";
import { NativeSelect, Textarea } from "@/components/ui/input";
import { MockBadge } from "@/components/ui/data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Stepper } from "@/components/ui/stepper";
import { useCampaign } from "@/hooks/use-queries";
import { errorMessage } from "@/lib/api";
import { LANGUAGES } from "@/lib/constants";
import { aiService, type AiGenerateResult, type AiPlanResult } from "@/services/ai";
import { omnichannelService } from "@/services/omnichannel";

const STEPS = ["Brief", "Plan", "Generate", "Preview", "Formats"];

const briefSchema = z.object({
  brief_text: z.string().min(10, "Describe your ad in at least a sentence"),
  language: z.string(),
});
type BriefValues = z.infer<typeof briefSchema>;

export function StudioWorkspace({ campaignId }: { campaignId: string }) {
  const campaign = useCampaign(campaignId);
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<AiPlanResult | null>(null);
  const [generated, setGenerated] = useState<AiGenerateResult | null>(null);
  const [formats, setFormats] = useState<{
    variants: Array<Record<string, unknown>>;
    is_mock: boolean;
    note: string;
  } | null>(null);

  const form = useForm<BriefValues>({
    resolver: zodResolver(briefSchema),
    values: {
      brief_text: campaign.data?.brief_text ?? "",
      language: campaign.data?.language ?? "en",
    },
  });

  const planMutation = useMutation({
    mutationFn: (v: BriefValues) =>
      aiService.plan({ campaign_id: campaignId, brief: v.brief_text }),
    onSuccess: (data) => {
      setPlan(data);
      setStep(1);
      toast.success(data.is_mock ? "Mock AI plan ready" : "AI plan ready");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      aiService.generate({
        campaign_id: campaignId,
        duration: campaign.data?.video_duration,
      }),
    onSuccess: (data) => {
      setGenerated(data);
      setStep(3);
      toast.success(data.is_mock ? "Mock creative ready for review" : "Creative ready");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const formatsMutation = useMutation({
    mutationFn: (creativeId: string) => omnichannelService.creativeFormats(creativeId),
    onSuccess: (data) => {
      setFormats(data);
      setStep(4);
      toast.success(data.is_mock ? "Format adaptation plans ready (mock)" : "Formats ready");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (campaign.isPending) return <Skeleton className="h-96 rounded-xl" />;
  if (campaign.isError) {
    return <ErrorState message={errorMessage(campaign.error)} onRetry={() => void campaign.refetch()} />;
  }

  const planData = (plan?.plan || {}) as Record<string, unknown>;
  const scenes = (planData.scene_breakdown as Array<Record<string, unknown>>) || [];
  const previewHtml =
    (generated?.preview as { preview_html?: string } | undefined)?.preview_html || "";

  return (
    <div>
      <PageHeader
        backHref={`/campaigns/${campaignId}`}
        backLabel="Campaign"
        title="AI Studio"
        description={campaign.data?.name}
        badges={plan?.is_mock || generated?.is_mock ? <MockBadge /> : undefined}
      />

      <div className="mb-8">
        <Stepper steps={STEPS} current={step} />
      </div>

      {step === 0 && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Describe your advertisement</CardTitle>
            <CardDescription>
              Tell Bada about your business, offer, and goal. Generation runs through the AI service layer
              (mock provider when no Gemini key is configured).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((v) => planMutation.mutate(v))}
            >
              <FormField label="Brief" htmlFor="brief" error={form.formState.errors.brief_text?.message}>
                <Textarea id="brief" rows={5} {...form.register("brief_text")} />
              </FormField>
              <FormField label="Language" htmlFor="language">
                <NativeSelect id="language" {...form.register("language")}>
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>
              <FormError message={planMutation.isError ? errorMessage(planMutation.error) : undefined} />
              <Button type="submit" loading={planMutation.isPending}>
                <Sparkles /> Generate campaign plan
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step >= 1 && plan && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>Campaign plan</CardTitle>
                <CardDescription>{String(planData.campaign_concept || "")}</CardDescription>
              </div>
              {plan.is_mock && <MockBadge />}
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-navy-900">Ad script</h3>
                <p className="mt-1 text-sm text-navy-600">{String(planData.ad_script || "")}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-navy-900">Voice-over</h3>
                <p className="mt-1 text-sm text-navy-600">{String(planData.voiceover_script || "")}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="mb-2 text-sm font-semibold text-navy-900">Scenes</h3>
                <ul className="space-y-2">
                  {scenes.map((scene, idx) => (
                    <li key={idx} className="rounded-lg border border-line px-3 py-2 text-sm">
                      <span className="font-medium">
                        Scene {String(scene.order)}: {String(scene.title)}
                      </span>
                      <span className="text-navy-500">
                        {" "}
                        — {String(scene.duration)}s · {String(scene.visual)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setStep(0)}>
                  Edit brief
                </Button>
                <Button loading={generateMutation.isPending} onClick={() => generateMutation.mutate()}>
                  Generate advertisement
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {generated && (
        <Card className="mt-4">
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Advertisement preview</CardTitle>
              <CardDescription>{generated.note}</CardDescription>
            </div>
            {generated.is_mock && <MockBadge />}
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="overflow-hidden rounded-xl border border-line"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                loading={formatsMutation.isPending}
                onClick={() => formatsMutation.mutate(generated.creative_id)}
              >
                Adapt for all channels
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/editor/${generated.creative_id}`}>Open editor</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/campaigns/${campaignId}`}>Back to campaign</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {formats && (
        <Card className="mt-4">
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Universal Creative Studio — formats</CardTitle>
              <CardDescription>{formats.note}</CardDescription>
            </div>
            {formats.is_mock && <MockBadge />}
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {formats.variants.map((v) => (
                <div key={String(v.format_key)} className="rounded-xl border border-line p-4 text-sm">
                  <p className="font-semibold text-navy-900">{String(v.label)}</p>
                  <p className="mt-1 text-xs text-navy-500">
                    {String(v.aspect_ratio)}
                    {v.duration_seconds ? ` · ${String(v.duration_seconds)}s` : " · static"}
                  </p>
                  <p className="mt-2 text-xs text-navy-600">{String(v.preview_note)}</p>
                  <p className="mt-2 text-[11px] text-navy-400">Safe zone: {String(v.safe_zone)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
