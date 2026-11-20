"use client";

import { useParams } from "next/navigation";
import { CampaignDetail } from "@/components/campaigns/campaign-detail";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <CampaignDetail id={id} />;
}
