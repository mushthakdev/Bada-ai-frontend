"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { MailCheck } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError, FormField } from "@/components/ui/form-field";
import { errorMessage } from "@/lib/api";
import { authService } from "@/services/auth";

const schema = z.object({ email: z.string().min(1, "Enter your email").email("Enter a valid email address") });
type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "" } });
  const mutation = useMutation({ mutationFn: (v: Values) => authService.forgotPassword(v.email) });

  if (mutation.isSuccess) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <MailCheck className="size-6" />
        </div>
        <h1 className="text-2xl font-semibold">Check your inbox</h1>
        <p className="mt-2 text-sm text-navy-500">
          If an account exists for that email, we&apos;ve sent instructions to reset your password.
        </p>
        {mutation.data?.dev_reset_token && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-left text-sm text-amber-900">
            <p className="font-semibold">Development mode</p>
            <p className="mt-1">
              The API returned a reset token because it is running in debug mode.{" "}
              <Link
                className="font-semibold underline"
                href={`/reset-password?token=${encodeURIComponent(mutation.data.dev_reset_token)}`}
              >
                Continue to reset
              </Link>
            </p>
          </div>
        )}
        <Button asChild variant="secondary" className="mt-6">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Reset your password</h1>
      <p className="mt-2 text-sm text-navy-500">Enter your email and we&apos;ll send you a reset link.</p>
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="mt-8 space-y-5" noValidate>
        <FormError message={mutation.isError ? errorMessage(mutation.error) : null} />
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        </FormField>
        <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
          Send reset link
        </Button>
        <p className="text-center text-sm">
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
