"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { BusinessForm } from "@/features/businesses/business-form";
import { useBusiness } from "@/hooks/use-queries";
import { errorMessage } from "@/lib/api";

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, isError, error, refetch } = useBusiness(id);

  if (isPending) return <Skeleton className="h-96 rounded-xl" />;
  if (isError) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;

  return (
    <div>
      <PageHeader
        backHref="/businesses"
        backLabel="Businesses"
        title={data.name}
        badges={<StatusBadge status={data.status} />}
        actions={
          <Button asChild>
            <Link href="/campaigns/new">
              <Plus /> New campaign
            </Link>
          </Button>
        }
      />
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Business profile</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessForm business={data} />
        </CardContent>
      </Card>
    </div>
  );
}
