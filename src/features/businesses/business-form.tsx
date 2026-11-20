"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageUp } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormError, FormField } from "@/components/ui/form-field";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { errorMessage } from "@/lib/api";
import { BUSINESS_CATEGORIES } from "@/lib/constants";
import { isPincode } from "@/lib/utils";
import { businessService } from "@/services/businesses";
import { mediaService } from "@/services/media";
import type { Business } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Enter the business name").max(200),
  category: z.string().min(2, "Choose a category"),
  description: z.string(),
  website: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string().refine((v) => v === "" || isPincode(v), "Enter a valid 6-digit pincode"),
  brand_tagline: z.string().max(200),
  brand_primary_color: z.string(),
  brand_secondary_color: z.string(),
});
type Values = z.infer<typeof schema>;

const opt = (v: string) => (v.trim() === "" ? undefined : v.trim());

export function BusinessForm({
  business,
  onSaved,
  submitLabel,
}: {
  business?: Business;
  onSaved?: (b: Business) => void;
  submitLabel?: string;
}) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: business?.name ?? "",
      category: business?.category ?? "",
      description: business?.description ?? "",
      website: business?.website ?? "",
      address: business?.address ?? "",
      city: business?.city ?? "",
      state: business?.state ?? "",
      pincode: business?.pincode ?? "",
      brand_tagline: business?.brand_tagline ?? "",
      brand_primary_color: business?.brand_primary_color ?? "#0B5FFF",
      brand_secondary_color: business?.brand_secondary_color ?? "#0A1628",
    },
  });

  const save = useMutation({
    mutationFn: async (v: Values) => {
      const base = {
        name: v.name,
        category: v.category,
        description: opt(v.description),
        website: opt(v.website),
        address: opt(v.address),
        city: opt(v.city),
        state: opt(v.state),
        pincode: opt(v.pincode),
      };
      if (business) {
        return businessService.update(business.id, {
          ...base,
          brand_tagline: opt(v.brand_tagline),
          brand_primary_color: v.brand_primary_color,
          brand_secondary_color: v.brand_secondary_color,
        });
      }
      return businessService.create({ ...base, country: "India" });
    },
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: ["businesses"] });
      toast.success(business ? "Business updated" : "Business added");
      onSaved?.(saved);
    },
  });

  const logo = useMutation({
    mutationFn: async (file: File) => {
      const asset = await mediaService.upload(file, { business_id: business!.id, category: "logo" });
      return businessService.update(business!.id, { logo_url: asset.public_url });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["businesses"] });
      toast.success("Logo updated");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-5" noValidate>
      <FormError message={save.isError ? errorMessage(save.error) : null} />

      {business && (
        <div className="flex items-center gap-4 rounded-lg border border-line p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {business.logo_url ? <img src={business.logo_url} alt="" className="size-14 rounded-lg border border-line object-contain" /> : (
            <div className="flex size-14 items-center justify-center rounded-lg bg-surface text-navy-300">
              <ImageUp className="size-6" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-navy-900">Logo</p>
            <p className="text-xs text-navy-500">PNG, JPG or SVG.</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) logo.mutate(f);
              e.target.value = "";
            }}
          />
          <Button type="button" variant="secondary" size="sm" loading={logo.isPending} onClick={() => fileRef.current?.click()}>
            Upload
          </Button>
        </div>
      )}

      <FormField label="Business name" htmlFor="biz-name" required error={errors.name?.message}>
        <Input id="biz-name" aria-invalid={!!errors.name} {...register("name")} />
      </FormField>
      <FormField label="Category" htmlFor="biz-category" required error={errors.category?.message}>
        <NativeSelect id="biz-category" aria-invalid={!!errors.category} {...register("category")}>
          <option value="">Select a category</option>
          {BUSINESS_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          {business && !BUSINESS_CATEGORIES.includes(business.category as (typeof BUSINESS_CATEGORIES)[number]) && (
            <option value={business.category}>{business.category}</option>
          )}
        </NativeSelect>
      </FormField>
      <FormField label="Description" htmlFor="biz-desc">
        <Textarea id="biz-desc" rows={3} {...register("description")} />
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Website" htmlFor="biz-web">
          <Input id="biz-web" type="url" placeholder="https://" {...register("website")} />
        </FormField>
        <FormField label="Address" htmlFor="biz-addr">
          <Input id="biz-addr" {...register("address")} />
        </FormField>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="City" htmlFor="biz-city">
          <Input id="biz-city" {...register("city")} />
        </FormField>
        <FormField label="State" htmlFor="biz-state">
          <Input id="biz-state" {...register("state")} />
        </FormField>
        <FormField label="Pincode" htmlFor="biz-pin" error={errors.pincode?.message}>
          <Input id="biz-pin" inputMode="numeric" maxLength={6} aria-invalid={!!errors.pincode} {...register("pincode")} />
        </FormField>
      </div>

      {business && (
        <>
          <FormField label="Brand tagline" htmlFor="biz-tag">
            <Input id="biz-tag" {...register("brand_tagline")} />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Primary colour" htmlFor="biz-c1">
              <Input id="biz-c1" type="color" className="h-11 cursor-pointer p-1" {...register("brand_primary_color")} />
            </FormField>
            <FormField label="Secondary colour" htmlFor="biz-c2">
              <Input id="biz-c2" type="color" className="h-11 cursor-pointer p-1" {...register("brand_secondary_color")} />
            </FormField>
          </div>
        </>
      )}

      <div className="flex justify-end">
        <Button type="submit" loading={save.isPending}>
          {submitLabel ?? (business ? "Save changes" : "Add business")}
        </Button>
      </div>
    </form>
  );
}
