import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/section";
import {
  AiCreationSection,
  AnalyticsSection,
  FinalCta,
  PincodeSection,
  SolutionSection,
} from "@/components/marketing/landing-sections";

export const metadata: Metadata = { title: "Product" };

export default function ProductPage() {
  return (
    <>
      <PageHero
        eyebrow="Product"
        title="Everything you need to run omnichannel advertising, in one place."
        description="Creatives, channel marketplace, targeting, payments and reporting — one workflow for Indian businesses."
      >
        <Button asChild size="lg" className="bg-brand-500 hover:bg-brand-400">
          <Link href="/register">Create Your First Ad</Link>
        </Button>
        <Button asChild size="lg" variant="outlineDark">
          <Link href="/features">See all features</Link>
        </Button>
      </PageHero>
      <SolutionSection />
      <AiCreationSection />
      <PincodeSection />
      <AnalyticsSection />
      <FinalCta />
    </>
  );
}
