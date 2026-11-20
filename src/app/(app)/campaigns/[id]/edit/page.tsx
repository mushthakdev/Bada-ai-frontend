"use client";

import { useParams } from "next/navigation";
import { CampaignForm } from "@/components/campaigns/campaign-form";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaign } from "@/hooks/use-queries";
import { errorMessage } from "@/lib/api";

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, isError, error, refetch } = useCampaign(id);

  return (
    <>
      <PageHeader backHref={`/campaigns/${id}`} backLabel="Campaign" title="Edit campaign" />
      {isPending ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : isError ? (
        <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />
      ) : (
        <CampaignForm mode="edit" campaign={data} />
      )}
    </>
  );
}
