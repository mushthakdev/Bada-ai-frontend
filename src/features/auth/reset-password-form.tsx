"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError, FormField } from "@/components/ui/form-field";
import { errorMessage } from "@/lib/api";
import { authService } from "@/services/auth";

const schema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters").max(128),
    confirm: z.string().min(1, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });
type Values = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { password: "", confirm: "" } });

  const mutation = useMutation({
    mutationFn: (v: Values) => authService.resetPassword(token, v.password),
    onSuccess: () => {
      toast.success("Password updated. Please sign in.");
      router.replace("/login");
    },
  });

  if (!token) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Reset link is missing</h1>
        <p className="mt-2 text-sm text-navy-500">
          This page needs a valid reset token. Request a new link to continue.
        </p>
        <Button asChild className="mt-6">
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Choose a new password</h1>
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="mt-8 space-y-5" noValidate>
        <FormError message={mutation.isError ? errorMessage(mutation.error) : null} />
        <FormField label="New password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
        </FormField>
        <FormField label="Confirm new password" htmlFor="confirm" error={errors.confirm?.message}>
          <Input id="confirm" type="password" autoComplete="new-password" aria-invalid={!!errors.confirm} {...register("confirm")} />
        </FormField>
        <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
          Update password
        </Button>
      </form>
    </div>
  );
}
