"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChipSelect } from "@/components/ui/chip-select";
import { FormError, FormField } from "@/components/ui/form-field";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { OptionCards } from "@/components/ui/option-cards";
import { Stepper } from "@/components/ui/stepper";
import { TagInput } from "@/components/ui/tag-input";
import { errorMessage } from "@/lib/api";
import { ADVERTISING_OBJECTIVES, BUSINESS_CATEGORIES, LANGUAGES, MIN_BUDGET_INR } from "@/lib/constants";
import { isPincode } from "@/lib/utils";
import { businessService } from "@/services/businesses";
import { useAuthStore } from "@/store/auth-store";
import type { OnboardingPayload } from "@/types";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #0B5FFF");

const schema = z.object({
  business: z.object({
    name: z.string().min(2, "Enter your business name").max(200),
    category: z.string().min(2, "Choose a category"),
    description: z.string(),
    website: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string().refine((v) => v === "" || isPincode(v), "Enter a valid 6-digit pincode"),
  }),
  brand: z.object({
    brand_tagline: z.string().max(200),
    brand_primary_color: hex,
    brand_secondary_color: hex,
  }),
  objective: z.string().min(1, "Choose an objective"),
  audience: z.object({
    target_city: z.string(),
    target_state: z.string(),
    pincodes: z.array(z.string()).min(1, "Add at least one pincode"),
    demographics: z.string(),
    interests: z.string(),
    languages: z.array(z.string()).min(1, "Choose at least one language"),
  }),
  budget: z
    .object({
      daily_budget: z
        .number({ error: "Enter a daily budget" })
        .min(MIN_BUDGET_INR, `Minimum is ₹${MIN_BUDGET_INR}`),
      total_budget: z
        .number({ error: "Enter a total budget" })
        .min(MIN_BUDGET_INR, `Minimum is ₹${MIN_BUDGET_INR}`),
      duration_days: z
        .number({ error: "Enter a duration" })
        .int("Whole days only")
        .min(1, "At least 1 day")
        .max(365, "At most 365 days"),
    })
    .refine((b) => b.total_budget >= b.daily_budget, {
      path: ["total_budget"],
      message: "Total budget can't be lower than the daily budget",
    }),
});
type Values = z.infer<typeof schema>;

const STEPS = ["Business", "Brand", "Objective", "Audience", "Budget"];
const STEP_FIELDS: Array<Array<"business" | "brand" | "objective" | "audience" | "budget">> = [
  ["business"],
  ["brand"],
  ["objective"],
  ["audience"],
  ["budget"],
];

const opt = (v: string) => (v.trim() === "" ? undefined : v.trim());

function toPayload(v: Values, step: number): OnboardingPayload {
  return {
    business: {
      name: v.business.name,
      category: v.business.category,
      description: opt(v.business.description),
      website: opt(v.business.website),
      address: opt(v.business.address),
      city: opt(v.business.city),
      state: opt(v.business.state),
      pincode: opt(v.business.pincode),
      country: "India",
    },
    brand:
      step >= 2
        ? {
            brand_tagline: opt(v.brand.brand_tagline),
            brand_primary_color: v.brand.brand_primary_color,
            brand_secondary_color: v.brand.brand_secondary_color,
          }
        : undefined,
    advertising_objective: step >= 3 ? v.objective : undefined,
    audience:
      step >= 4
        ? {
            target_city: opt(v.audience.target_city),
            target_state: opt(v.audience.target_state),
            target_pincodes: v.audience.pincodes,
            demographics: opt(v.audience.demographics),
            interests: opt(v.audience.interests),
            languages: v.audience.languages,
          }
        : undefined,
    budget: step >= 5 ? v.budget : undefined,
    step,
  };
}

export function OnboardingWizard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [step, setStep] = useState(0);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      business: { name: "", category: "", description: "", website: "", address: "", city: "", state: "", pincode: "" },
      brand: { brand_tagline: "", brand_primary_color: "#0B5FFF", brand_secondary_color: "#0A1628" },
      objective: "",
      audience: { target_city: "", target_state: "", pincodes: [], demographics: "", interests: "", languages: ["en"] },
      budget: { daily_budget: MIN_BUDGET_INR, total_budget: MIN_BUDGET_INR * 7, duration_days: 7 },
    },
  });
  const {
    register,
    control,
    trigger,
    getValues,
    formState: { errors },
  } = form;

  const mutation = useMutation({
    mutationFn: (args: { step: number }) => businessService.onboarding(toPayload(getValues(), args.step)),
    onSuccess: (_data, args) => {
      if (args.step >= STEPS.length) {
        if (user) setUser({ ...user, onboarding_completed: true });
        toast.success("You're all set. Let's create your first campaign.");
        router.replace("/dashboard");
      } else {
        setStep(args.step);
      }
    },
  });

  async function next() {
    const ok = await trigger(STEP_FIELDS[step]);
    if (!ok) return;
    mutation.mutate({ step: step + 1 });
  }

  const last = step === STEPS.length - 1;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <Logo href="/dashboard" />
      <h1 className="mt-8 text-3xl font-semibold">Let&apos;s set up your business</h1>
      <p className="mt-2 text-navy-500">A few quick questions so Bada AI can plan your first omnichannel campaign.</p>
      <Stepper steps={STEPS} current={step} className="mt-8" />

      <Card className="mt-6 p-6 sm:p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void next();
          }}
          className="space-y-5"
          noValidate
        >
          <FormError message={mutation.isError ? errorMessage(mutation.error) : null} />

          {step === 0 && (
            <>
              <FormField label="Business name" htmlFor="b-name" required error={errors.business?.name?.message}>
                <Input id="b-name" aria-invalid={!!errors.business?.name} {...register("business.name")} />
              </FormField>
              <FormField label="Category" htmlFor="b-category" required error={errors.business?.category?.message}>
                <NativeSelect id="b-category" aria-invalid={!!errors.business?.category} {...register("business.category")}>
                  <option value="">Select a category</option>
                  {BUSINESS_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>
              <FormField label="What do you offer?" htmlFor="b-desc" hint="A sentence or two helps the AI write a better ad.">
                <Textarea id="b-desc" rows={3} {...register("business.description")} />
              </FormField>
              <FormField label="Website (optional)" htmlFor="b-web">
                <Input id="b-web" type="url" placeholder="https://" {...register("business.website")} />
              </FormField>
              <FormField label="Address (optional)" htmlFor="b-addr">
                <Input id="b-addr" autoComplete="street-address" {...register("business.address")} />
              </FormField>
              <div className="grid gap-5 sm:grid-cols-3">
                <FormField label="City" htmlFor="b-city">
                  <Input id="b-city" {...register("business.city")} />
                </FormField>
                <FormField label="State" htmlFor="b-state">
                  <Input id="b-state" {...register("business.state")} />
                </FormField>
                <FormField label="Pincode" htmlFor="b-pin" error={errors.business?.pincode?.message}>
                  <Input id="b-pin" inputMode="numeric" maxLength={6} aria-invalid={!!errors.business?.pincode} {...register("business.pincode")} />
                </FormField>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <FormField label="Tagline (optional)" htmlFor="tagline" error={errors.brand?.brand_tagline?.message}>
                <Input id="tagline" {...register("brand.brand_tagline")} />
              </FormField>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Primary colour" htmlFor="c1" error={errors.brand?.brand_primary_color?.message}>
                  <Input id="c1" type="color" className="h-11 cursor-pointer p-1" {...register("brand.brand_primary_color")} />
                </FormField>
                <FormField label="Secondary colour" htmlFor="c2" error={errors.brand?.brand_secondary_color?.message}>
                  <Input id="c2" type="color" className="h-11 cursor-pointer p-1" {...register("brand.brand_secondary_color")} />
                </FormField>
              </div>
              <p className="text-xs text-navy-400">You can upload a logo later from your business profile.</p>
            </>
          )}

          {step === 2 && (
            <FormField label="What do you want this advertising to achieve?" htmlFor="objective" error={errors.objective?.message}>
              <Controller
                control={control}
                name="objective"
                render={({ field }) => (
                  <OptionCards
                    label="Advertising objective"
                    options={ADVERTISING_OBJECTIVES}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>
          )}

          {step === 3 && (
            <>
              <FormField
                label="Target pincodes"
                htmlFor="a-pins"
                required
                hint="Press Enter or comma after each 6-digit pincode, or paste a list."
                error={errors.audience?.pincodes?.message}
              >
                <Controller
                  control={control}
                  name="audience.pincodes"
                  render={({ field }) => (
                    <TagInput
                      id="a-pins"
                      value={field.value}
                      onChange={field.onChange}
                      validate={isPincode}
                      invalidMessage="Not a valid pincode"
                      inputMode="numeric"
                      placeholder="e.g. 560001"
                    />
                  )}
                />
              </FormField>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Target city" htmlFor="a-city">
                  <Input id="a-city" {...register("audience.target_city")} />
                </FormField>
                <FormField label="Target state" htmlFor="a-state">
                  <Input id="a-state" {...register("audience.target_state")} />
                </FormField>
              </div>
              <FormField label="Who are your customers?" htmlFor="a-demo" hint="Age, family type, profession — whatever describes them.">
                <Textarea id="a-demo" rows={2} {...register("audience.demographics")} />
              </FormField>
              <FormField label="Interests (optional)" htmlFor="a-int">
                <Input id="a-int" {...register("audience.interests")} />
              </FormField>
              <FormField label="Ad languages" htmlFor="a-lang" required error={errors.audience?.languages?.message}>
                <Controller
                  control={control}
                  name="audience.languages"
                  render={({ field }) => (
                    <ChipSelect label="Languages" options={LANGUAGES} value={field.value} onChange={field.onChange} />
                  )}
                />
              </FormField>
            </>
          )}

          {step === 4 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Daily budget (₹)" htmlFor="daily" error={errors.budget?.daily_budget?.message}>
                  <Input id="daily" type="number" min={MIN_BUDGET_INR} step={100} aria-invalid={!!errors.budget?.daily_budget} {...register("budget.daily_budget", { valueAsNumber: true })} />
                </FormField>
                <FormField label="Total budget (₹)" htmlFor="total" error={errors.budget?.total_budget?.message}>
                  <Input id="total" type="number" min={MIN_BUDGET_INR} step={100} aria-invalid={!!errors.budget?.total_budget} {...register("budget.total_budget", { valueAsNumber: true })} />
                </FormField>
              </div>
              <FormField label="Duration (days)" htmlFor="days" error={errors.budget?.duration_days?.message}>
                <Input id="days" type="number" min={1} max={365} aria-invalid={!!errors.budget?.duration_days} {...register("budget.duration_days", { valueAsNumber: true })} />
              </FormField>
              <p className="rounded-lg bg-surface p-3 text-sm text-navy-500">
                These are planning inputs. Bada shows an itemised estimate — media spend, platform fee and tax — for every
                campaign before you pay.
              </p>
            </>
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
              {last ? "Finish setup" : "Continue"} {!last && <ArrowRight />}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
