import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/section";
import { FaqSection, FinalCta, PricingSection } from "@/components/marketing/landing-sections";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Simple, transparent pricing."
        description="Plans are loaded live from the platform. Your budget estimate for each campaign is itemised before you pay."
      />
      <PricingSection eyebrow="Plans" />
      <FaqSection />
      <FinalCta />
    </>
  );
}
