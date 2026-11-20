"use client";

import { useParams } from "next/navigation";
import { StudioWorkspace } from "@/features/studio/studio-workspace";

export default function StudioCampaignPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  return <StudioWorkspace campaignId={campaignId} />;
}
