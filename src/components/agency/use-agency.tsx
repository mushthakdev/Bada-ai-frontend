"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/empty-state";
import { errorMessage } from "@/lib/api";
import { agencyService, type Agency } from "@/services/agency";

export function useAgency() {
  const query = useQuery({ queryKey: ["agencies"], queryFn: agencyService.list });
  return { ...query, agency: query.data?.[0] as Agency | undefined };
}

export function CreateAgencyCard() {
  const qc = useQueryClient();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const create = useMutation({
    mutationFn: () => agencyService.create({ name: name.trim(), email: email.trim() || undefined }),
    onSuccess: () => {
      toast.success("Agency profile created");
      void qc.invalidateQueries({ queryKey: ["agencies"] });
    },
  });
  return (
    <Card className="max-w-lg p-6">
      <h2 className="text-lg font-semibold text-navy-900">Set up your agency profile</h2>
      <p className="mt-1 text-sm text-navy-500">Create your agency to start adding client businesses.</p>
      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim().length >= 2) create.mutate();
        }}
      >
        <FormError message={create.isError ? errorMessage(create.error) : null} />
        <FormField label="Agency name" htmlFor="agency-name" required>
          <Input id="agency-name" value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label="Contact email" htmlFor="agency-email">
          <Input id="agency-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <Button type="submit" loading={create.isPending} disabled={name.trim().length < 2}>
          Create agency
        </Button>
      </form>
    </Card>
  );
}

/** Renders children once an agency exists; handles loading, error and first-run setup. */
export function AgencyGate({ children }: { children: (agency: Agency) => React.ReactNode }) {
  const { agency, isPending, isError, error, refetch } = useAgency();
  if (isPending) return <Skeleton className="h-40 rounded-xl" />;
  if (isError) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;
  if (!agency) return <CreateAgencyCard />;
  return <>{children(agency)}</>;
}
