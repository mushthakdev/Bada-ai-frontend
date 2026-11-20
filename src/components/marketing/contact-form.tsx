"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { FormError, FormField } from "@/components/ui/form-field";
import { ApiError, errorMessage } from "@/lib/api";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { marketingService } from "@/services/marketing";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().min(1, "Enter your email").email("Enter a valid email address"),
  phone: z.string(),
  message: z.string().min(10, "Tell us a little more (at least 10 characters)"),
});
type Values = z.infer<typeof schema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", phone: "", message: "" } });

  const mutation = useMutation({
    mutationFn: (v: Values) => marketingService.contact({ ...v, phone: v.phone || undefined }),
    onSuccess: () => reset(),
  });

  if (mutation.isSuccess) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-10 text-center">
        <CheckCircle2 className="mx-auto size-10 text-success" />
        <h2 className="mt-4 text-2xl font-semibold">Message sent</h2>
        <p className="mt-2 text-navy-500">Thanks for reaching out — we&apos;ll reply by email soon.</p>
        <Button variant="secondary" className="mt-6" onClick={() => mutation.reset()}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5 rounded-2xl border border-line bg-white p-6 shadow-soft sm:p-8" noValidate>
      <FormError
        message={
          mutation.isError
            ? mutation.error instanceof ApiError && mutation.error.status === 404
              ? `Our contact form isn't connected yet. Please email us at ${SUPPORT_EMAIL}.`
              : errorMessage(mutation.error)
            : null
        }
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        </FormField>
      </div>
      <FormField label="Phone (optional)" htmlFor="phone">
        <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
      </FormField>
      <FormField label="How can we help?" htmlFor="message" error={errors.message?.message}>
        <Textarea id="message" rows={5} aria-invalid={!!errors.message} {...register("message")} />
      </FormField>
      <Button type="submit" size="lg" loading={mutation.isPending}>
        Send message
      </Button>
    </form>
  );
}
