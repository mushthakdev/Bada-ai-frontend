"use client";

import { useParams } from "next/navigation";
import { CampaignAnalyticsView } from "@/components/campaigns/campaign-analytics";

export default function CampaignAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  return <CampaignAnalyticsView id={id} />;
}
