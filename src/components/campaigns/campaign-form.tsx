"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChipSelect } from "@/components/ui/chip-select";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { FormError, FormField } from "@/components/ui/form-field";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Stepper } from "@/components/ui/stepper";
import { Switch } from "@/components/ui/misc";
import { TagInput } from "@/components/ui/tag-input";
import { useBusinesses } from "@/hooks/use-queries";
import { errorMessage } from "@/lib/api";
import {
  ADVERTISING_OBJECTIVES,
  LANGUAGES,
  MIN_BUDGET_INR,
  VIDEO_DURATIONS,
} from "@/lib/constants";
import { formatCurrency, humanize, isPincode } from "@/lib/utils";
import { campaignService } from "@/services/campaigns";
import type { Business, Campaign, CampaignInput } from "@/types";

const schema = z.object({
  basics: z.object({
    business_id: z.string().min(1, "Choose a business"),
    name: z.string().min(2, "Give your campaign a name").max(200),
    objective: z.string().min(1, "Choose an objective"),
    language: z.string().min(1),
    video_duration: z.number({ error: "Choose a duration" }).int().min(15).max(60),
    description: z.string(),
    brief_text: z.string(),
  }),
  pincodes: z.array(z.string()),
  audience: z.object({
    demographics: z.string(),
    interests: z.string(),
    languages: z.array(z.string()).min(1, "Choose at least one language"),
    gender: z.string(),
    age_min: z.number().int().min(0).max(100).nullable(),
    age_max: z.number().int().min(0).max(100).nullable(),
  }),
  budget: z
    .object({
      daily_budget: z.number({ error: "Enter a daily budget" }).min(MIN_BUDGET_INR, `Minimum is ₹${MIN_BUDGET_INR}`),
      total_budget: z.number({ error: "Enter a total budget" }).min(MIN_BUDGET_INR, `Minimum is ₹${MIN_BUDGET_INR}`),
    })
    .refine((b) => b.total_budget >= b.daily_budget, {
      path: ["total_budget"],
      message: "Total budget can't be lower than the daily budget",
    }),
  schedule: z
    .object({
      start_date: z.string().min(1, "Choose a start date"),
      end_date: z.string().min(1, "Choose an end date"),
      prime_time: z.boolean(),
      preferred_slots: z.string(),
    })
    .refine((s) => !s.start_date || !s.end_date || s.end_date >= s.start_date, {
      path: ["end_date"],
      message: "End date must be on or after the start date",
    }),
});
type Values = z.infer<typeof schema>;

const STEPS = ["Basics", "Locations", "Audience", "Budget & schedule", "Review"];
const STEP_FIELDS: Array<Array<"basics" | "pincodes" | "audience" | "budget" | "schedule">> = [
  ["basics"],
  ["pincodes"],
  ["audience"],
  ["budget", "schedule"],
  [],
];

const opt = (v: string) => (v.trim() === "" ? undefined : v.trim());
const numOrNull = (v: unknown) => (v === "" || v === null || Number.isNaN(v) ? null : Number(v));

function languagesOf(a: Campaign["audience"], fallback: string): string[] {
  const l = a?.languages;
  if (Array.isArray(l) && l.length) return l;
  if (typeof l === "string" && l) return l.split(",").map((s) => s.trim());
  return [fallback];
}

function defaultsFrom(c?: Campaign | null, businessId?: string): Values {
  return {
    basics: {
      business_id: c?.business_id ?? businessId ?? "",
      name: c?.name ?? "",
      objective: c?.objective ?? "",
      language: c?.language ?? "en",
      video_duration: c?.video_duration ?? 30,
      description: c?.description ?? "",
      brief_text: c?.brief_text ?? "",
    },
    pincodes: c?.locations?.map((l) => l.pincode) ?? [],
    audience: {
      demographics: c?.audience?.demographics ?? "",
      interests: c?.audience?.interests ?? "",
      languages: languagesOf(c?.audience, c?.language ?? "en"),
      gender: c?.audience?.gender ?? "",
      age_min: c?.audience?.age_min ?? null,
      age_max: c?.audience?.age_max ?? null,
    },
    budget: {
      daily_budget: c?.budget?.daily_budget ?? MIN_BUDGET_INR,
      total_budget: c?.budget?.total_budget ?? MIN_BUDGET_INR * 7,
    },
    schedule: {
      start_date: c?.schedule?.start_date ?? c?.start_date ?? "",
      end_date: c?.schedule?.end_date ?? c?.end_date ?? "",
      prime_time: c?.schedule?.prime_time ?? false,
      preferred_slots: c?.schedule?.preferred_slots ?? "",
    },
  };
}

function daysBetween(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Number.isFinite(ms) ? Math.max(1, Math.round(ms / 86_400_000) + 1) : undefined;
}

function toInput(v: Values): CampaignInput {
  return {
    business_id: v.basics.business_id,
    name: v.basics.name,
    objective: v.basics.objective,
    description: opt(v.basics.description),
    language: v.basics.language,
    video_duration: v.basics.video_duration,
    brief_text: opt(v.basics.brief_text),
    locations: v.pincodes.map((pincode) => ({ pincode })),
    audience: {
      demographics: opt(v.audience.demographics),
      interests: opt(v.audience.interests),
      languages: v.audience.languages,
      gender: opt(v.audience.gender),
      age_min: v.audience.age_min ?? undefined,
      age_max: v.audience.age_max ?? undefined,
    },
    budget: {
      daily_budget: v.budget.daily_budget,
      total_budget: v.budget.total_budget,
      duration_days: daysBetween(v.schedule.start_date, v.schedule.end_date),
    },
    schedule: {
      start_date: v.schedule.start_date,
      end_date: v.schedule.end_date,
      prime_time: v.schedule.prime_time,
      preferred_slots: opt(v.schedule.preferred_slots),
    },
  };
}

interface CampaignFormProps {
  mode: "create" | "edit";
  campaign?: Campaign;
}

export function CampaignForm({ mode, campaign }: CampaignFormProps) {
  const businesses = useBusinesses();

  if (businesses.isPending) return <Skeleton className="h-96 rounded-xl" />;
  if (businesses.isError) {
    return <ErrorState message={errorMessage(businesses.error)} onRetry={() => void businesses.refetch()} />;
  }

  if ((businesses.data?.length ?? 0) === 0) {
    return (
      <EmptyState
        title="Add a business first"
        description="Campaigns belong to a business. Add one to continue."
        action={
          <Button asChild>
            <Link href="/businesses">Go to businesses</Link>
          </Button>
        }
      />
    );
  }

  const list = businesses.data ?? [];
  return (
    <CampaignFormInner
      mode={mode}
      campaign={campaign}
      businesses={list}
      initial={defaultsFrom(campaign, list.length === 1 ? list[0].id : undefined)}
    />
  );
}

function CampaignFormInner({
  mode,
  campaign,
  businesses,
  initial,
}: CampaignFormProps & { businesses: Business[]; initial: Values }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: initial });
  const {
    register,
    control,
    trigger,
    getValues,
    watch,
    formState: { errors },
  } = form;

  const mutation = useMutation({
    mutationFn: async () => {
      const input = toInput(getValues());
      if (mode === "edit" && campaign) {
        // The detail endpoint doesn't return locations/audience, so only send them when the user changed them.
        const patch: Partial<CampaignInput> = { ...input };
        if (input.locations.length === 0) delete patch.locations;
        if (!form.formState.dirtyFields.audience) delete patch.audience;
        return campaignService.update(campaign.id, patch);
      }
      return campaignService.create(input);
    },
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      void queryClient.invalidateQueries({ queryKey: ["campaign"] });
      toast.success(mode === "edit" ? "Campaign updated" : "Campaign saved as draft");
      router.push(`/campaigns/${saved.id}`);
    },
  });

  async function next() {
    const fields = STEP_FIELDS[step];
    if (fields.length && !(await trigger(fields))) return;
    if (step === 1 && mode === "create" && getValues("pincodes").length === 0) {
      form.setError("pincodes", { message: "Add at least one pincode" });
      return;
    }
    setStep((s) => s + 1);
  }

  const values = watch();
  const last = step === STEPS.length - 1;
  const businessName = businesses.find((b) => b.id === values.basics.business_id)?.name;

  return (
    <div className="mx-auto max-w-3xl">
      <Stepper steps={STEPS} current={step} />
      <Card className="mt-6 p-6 sm:p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (last) mutation.mutate();
            else void next();
          }}
          className="space-y-5"
          noValidate
        >
          <FormError message={mutation.isError ? errorMessage(mutation.error) : null} />

          {step === 0 && (
            <>
              <FormField label="Business" htmlFor="business_id" required error={errors.basics?.business_id?.message}>
                <NativeSelect id="business_id" aria-invalid={!!errors.basics?.business_id} {...register("basics.business_id")}>
                  <option value="">Select a business</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>
              <FormField label="Campaign name" htmlFor="name" required error={errors.basics?.name?.message}>
                <Input id="name" aria-invalid={!!errors.basics?.name} {...register("basics.name")} />
              </FormField>
              <FormField label="Objective" htmlFor="objective" required error={errors.basics?.objective?.message}>
                <NativeSelect id="objective" aria-invalid={!!errors.basics?.objective} {...register("basics.objective")}>
                  <option value="">Select an objective</option>
                  {ADVERTISING_OBJECTIVES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Ad language" htmlFor="language">
                  <NativeSelect id="language" {...register("basics.language")}>
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </NativeSelect>
                </FormField>
                <FormField label="Video length" htmlFor="video_duration">
                  <NativeSelect id="video_duration" {...register("basics.video_duration", { valueAsNumber: true })}>
                    {VIDEO_DURATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d} seconds
                      </option>
                    ))}
                  </NativeSelect>
                </FormField>
              </div>
              <FormField label="Describe the offer or message" htmlFor="brief_text" hint="This seeds your AI Studio brief.">
                <Textarea id="brief_text" rows={4} {...register("basics.brief_text")} />
              </FormField>
              <FormField label="Internal notes (optional)" htmlFor="description">
                <Input id="description" {...register("basics.description")} />
              </FormField>
            </>
          )}

          {step === 1 && (
            <FormField
              label="Target pincodes"
              htmlFor="pincodes"
              required
              hint={
                mode === "edit"
                  ? "Leave empty to keep the existing pincodes, or enter a new list to replace them."
                  : "Press Enter or comma after each 6-digit pincode, or paste a list."
              }
              error={errors.pincodes?.message}
            >
              <Controller
                control={control}
                name="pincodes"
                render={({ field }) => (
                  <TagInput
                    id="pincodes"
                    value={field.value}
                    onChange={field.onChange}
                    validate={isPincode}
                    invalidMessage="Not a valid pincode"
                    inputMode="numeric"
                    placeholder="e.g. 400001"
                  />
                )}
              />
            </FormField>
          )}

          {step === 2 && (
            <>
              <FormField label="Audience languages" htmlFor="aud-lang" required error={errors.audience?.languages?.message}>
                <Controller
                  control={control}
                  name="audience.languages"
                  render={({ field }) => (
                    <ChipSelect label="Audience languages" options={LANGUAGES} value={field.value} onChange={field.onChange} />
                  )}
                />
              </FormField>
              <FormField label="Who are you trying to reach?" htmlFor="demographics">
                <Textarea id="demographics" rows={2} {...register("audience.demographics")} />
              </FormField>
              <FormField label="Interests (optional)" htmlFor="interests">
                <Input id="interests" {...register("audience.interests")} />
              </FormField>
              <div className="grid gap-5 sm:grid-cols-3">
                <FormField label="Gender" htmlFor="gender">
                  <NativeSelect id="gender" {...register("audience.gender")}>
                    <option value="">All</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </NativeSelect>
                </FormField>
                <FormField label="Min age" htmlFor="age_min" error={errors.audience?.age_min?.message}>
                  <Input
                    id="age_min"
                    type="number"
                    min={0}
                    max={100}
                    {...register("audience.age_min", { setValueAs: numOrNull })}
                  />
                </FormField>
                <FormField label="Max age" htmlFor="age_max" error={errors.audience?.age_max?.message}>
                  <Input
                    id="age_max"
                    type="number"
                    min={0}
                    max={100}
                    {...register("audience.age_max", { setValueAs: numOrNull })}
                  />
                </FormField>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Daily budget (₹)" htmlFor="daily" error={errors.budget?.daily_budget?.message}>
                  <Input id="daily" type="number" min={MIN_BUDGET_INR} step={100} aria-invalid={!!errors.budget?.daily_budget} {...register("budget.daily_budget", { valueAsNumber: true })} />
                </FormField>
                <FormField label="Total budget (₹)" htmlFor="total" error={errors.budget?.total_budget?.message}>
                  <Input id="total" type="number" min={MIN_BUDGET_INR} step={100} aria-invalid={!!errors.budget?.total_budget} {...register("budget.total_budget", { valueAsNumber: true })} />
                </FormField>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Start date" htmlFor="start" error={errors.schedule?.start_date?.message}>
                  <Input id="start" type="date" aria-invalid={!!errors.schedule?.start_date} {...register("schedule.start_date")} />
                </FormField>
                <FormField label="End date" htmlFor="end" error={errors.schedule?.end_date?.message}>
                  <Input id="end" type="date" aria-invalid={!!errors.schedule?.end_date} {...register("schedule.end_date")} />
                </FormField>
              </div>
              <FormField label="Preferred time slots (optional)" htmlFor="slots">
                <Input id="slots" placeholder="e.g. evenings, weekends" {...register("schedule.preferred_slots")} />
              </FormField>
              <div className="flex items-center justify-between rounded-lg border border-line p-4">
                <div>
                  <p className="text-sm font-medium text-navy-900">Prefer prime-time slots</p>
                  <p className="text-xs text-navy-500">Prime-time availability and pricing are confirmed in your estimate.</p>
                </div>
                <Controller
                  control={control}
                  name="schedule.prime_time"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Prefer prime-time slots" />
                  )}
                />
              </div>
              <p className="rounded-lg bg-surface p-3 text-sm text-navy-500">
                After you save, Bada calculates an itemised estimate (media spend, platform fee, tax) from live pricing.
              </p>
            </>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Review your campaign</h2>
              <dl className="divide-y divide-line rounded-lg border border-line text-sm">
                {[
                  ["Business", businessName ?? "—"],
                  ["Campaign", values.basics.name],
                  ["Objective", humanize(values.basics.objective)],
                  ["Language / length", `${LANGUAGES.find((l) => l.value === values.basics.language)?.label ?? values.basics.language} · ${values.basics.video_duration}s`],
                  ["Pincodes", values.pincodes.join(", ") || (mode === "edit" ? "Unchanged" : "—")],
                  ["Audience languages", values.audience.languages.join(", ")],
                  ["Daily / total budget", `${formatCurrency(values.budget.daily_budget)} / ${formatCurrency(values.budget.total_budget)}`],
                  ["Schedule", `${values.schedule.start_date} → ${values.schedule.end_date}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 px-4 py-3">
                    <dt className="text-navy-500">{k}</dt>
                    <dd className="text-right font-medium text-navy-900">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-sm text-navy-500">
                {mode === "edit" ? "Your changes will be saved to this campaign." : "Your campaign will be saved as a draft. Next, generate the ad in AI Studio, then pay."}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              disabled={step === 0 || mutation.isPending}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              <ArrowLeft /> Back
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {last ? (mode === "edit" ? "Save changes" : "Save draft") : "Continue"} {!last && <ArrowRight />}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
