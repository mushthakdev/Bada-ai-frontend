"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError, FormField } from "@/components/ui/form-field";
import { useAuth } from "@/hooks/use-auth";
import { errorMessage } from "@/lib/api";
import { DEMO_CREDENTIALS } from "@/lib/constants";
import { authService } from "@/services/auth";

const schema = z.object({
  email: z.string().min(1, "Enter your email").email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const params = useSearchParams();
  const { completeAuth } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (result) => {
      toast.success(`Welcome back, ${result.user.full_name.split(" ")[0]}`);
      completeAuth(result, params.get("next"));
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-navy-500">
        Log in to Bada AI to continue. New here?{" "}
        <Link href="/register" className="font-semibold text-brand-700 hover:underline">
          Sign up
        </Link>
      </p>

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="mt-8 space-y-5" noValidate>
        <FormError message={mutation.isError ? errorMessage(mutation.error) : null} />
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </FormField>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-brand-700 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
          Continue
        </Button>
      </form>

      <div className="mt-8 rounded-2xl border border-line bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Demo credentials</p>
        <ul className="mt-3 space-y-2">
          {DEMO_CREDENTIALS.map((c) => (
            <li key={c.email} className="flex items-center justify-between gap-3 text-sm">
              <span>
                <span className="font-medium text-navy-900">{c.label}</span>
                <span className="block font-mono text-xs text-navy-500">
                  {c.email} / {c.password}
                </span>
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setValue("email", c.email, { shouldValidate: true });
                  setValue("password", c.password, { shouldValidate: true });
                }}
              >
                Use
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
