import type { Metadata } from "next";
import { CreativesGrid } from "@/features/studio/creatives-grid";

export const metadata: Metadata = { title: "Creatives" };

export default function CreativesPage() {
  return <CreativesGrid />;
}
