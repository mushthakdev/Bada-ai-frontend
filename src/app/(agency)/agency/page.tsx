"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { agencyService } from "@/services/agency";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AgencyDashboardPage() {
  const { data: agencies, isLoading } = useQuery({
    queryKey: ["agencies"],
    queryFn: () => agencyService.list(),
  });

  const agency = agencies?.[0];
  const clients = useQuery({
    queryKey: ["agency-clients", agency?.id],
    queryFn: () => agencyService.clients(agency!.id),
    enabled: Boolean(agency?.id),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agency dashboard"
        description="Manage clients, campaigns, and white-label advertising."
        actions={
          <Button asChild variant="secondary">
            <Link href="/agency/clients">View clients</Link>
          </Button>
        }
      />

      {isLoading && <Skeleton className="h-32 rounded-xl" />}

      {!isLoading && !agency && (
        <EmptyState
          title="No agency profile yet"
          description="Register an agency account or create an agency profile to manage clients."
        />
      )}

      {agency && (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-navy-900">{agency.name}</h2>
          <p className="mt-1 text-sm text-navy-500">Status: {agency.status}</p>
          <p className="mt-4 text-sm text-navy-600">
            Clients: {clients.isLoading ? "…" : clients.data?.length ?? 0}
          </p>
        </Card>
      )}
    </div>
  );
}
