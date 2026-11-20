import type { Metadata } from "next";
import { StudioPicker } from "@/features/studio/studio-picker";

export const metadata: Metadata = { title: "AI Studio" };

export default function StudioPage() {
  return <StudioPicker />;
}
