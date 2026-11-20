"use client";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError, FormField } from "@/components/ui/form-field";
import { useAuth } from "@/hooks/use-auth";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth";

const schema = z
  .object({
    role: z.enum(["advertiser", "agency"]),
    full_name: z.string().min(2, "Enter your full name").max(150),
    email: z.string().min(1, "Enter your email").email("Enter a valid email address"),
    phone: z
      .string()
      .refine((v) => v === "" || /^[+]?[0-9\s-]{10,15}$/.test(v), "Enter a valid phone number"),
    password: z.string().min(8, "Use at least 8 characters").max(128),
    confirm: z.string().min(1, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });
type Values = z.infer<typeof schema>;

const ROLES = [
  { value: "advertiser", title: "Business owner", body: "I advertise my own business" },
  { value: "agency", title: "Agency", body: "I manage ads for clients" },
] as const;

export function RegisterForm() {
  const { completeAuth } = useAuth();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { role: "advertiser", full_name: "", email: "", phone: "", password: "", confirm: "" },
  });

  const mutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (result) => {
      toast.success("Account created");
      completeAuth(result);
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold">Create your Bada AI account</h1>
      <p className="mt-2 text-sm text-navy-500">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>

      <form
        onSubmit={handleSubmit((v) =>
          mutation.mutate({
            role: v.role,
            full_name: v.full_name,
            email: v.email,
            password: v.password,
            phone: v.phone || undefined,
          }),
        )}
        className="mt-8 space-y-5"
        noValidate
      >
        <FormError message={mutation.isError ? errorMessage(mutation.error) : null} />

        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <div role="radiogroup" aria-label="Account type" className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  role="radio"
                  aria-checked={field.value === r.value}
                  onClick={() => field.onChange(r.value)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600",
                    field.value === r.value
                      ? "border-brand-600 bg-brand-50"
                      : "border-line-strong bg-white hover:bg-surface",
                  )}
                >
                  <span className="block text-sm font-semibold text-navy-900">{r.title}</span>
                  <span className="mt-0.5 block text-xs text-navy-500">{r.body}</span>
                </button>
              ))}
            </div>
          )}
        />

        <FormField label="Full name" htmlFor="full_name" error={errors.full_name?.message}>
          <Input id="full_name" autoComplete="name" aria-invalid={!!errors.full_name} {...register("full_name")} />
        </FormField>
        <FormField label="Work email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        </FormField>
        <FormField label="Phone (optional)" htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" type="tel" autoComplete="tel" aria-invalid={!!errors.phone} {...register("phone")} />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Password" htmlFor="password" error={errors.password?.message}>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
          </FormField>
          <FormField label="Confirm password" htmlFor="confirm" error={errors.confirm?.message}>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirm}
              {...register("confirm")}
            />
          </FormField>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
          Create account
        </Button>
        <p className="text-center text-xs text-navy-400">
          By creating an account you agree to Bada AI&apos;s terms and privacy policy.
        </p>
      </form>
    </div>
  );
}
