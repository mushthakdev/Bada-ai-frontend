import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CampaignForm } from "@/components/campaigns/campaign-form";

export const metadata: Metadata = { title: "New campaign" };

export default function NewCampaignPage() {
  return (
    <>
      <PageHeader backHref="/campaigns" backLabel="Campaigns" title="New campaign" description="Plan your campaign in a few steps. You'll save it as a draft." />
      <CampaignForm mode="create" />
    </>
  );
}
