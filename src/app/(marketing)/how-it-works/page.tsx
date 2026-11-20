import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHero, Section, SectionHeading } from "@/components/marketing/section";
import { FaqSection, FinalCta, STEPS } from "@/components/marketing/landing-sections";

export const metadata: Metadata = { title: "How it works" };

const DETAILS = [
  ["Business details, brand colours, your objective, the audience you want to reach and a budget range.", "Onboarding takes a few minutes and is saved as you go."],
  ["Write a brief, then generate multi-format creatives for CTV, social, video, banners and local screens.", "Creatives from a mock provider are labelled Mock-generated."],
  ["Select platforms, allocate budget, choose pincodes and schedule. Review the estimate, pay, and launch per channel.", "Checkout in demo environments is labelled as a mock checkout."],
  ["Compare impressions, reach, clicks, QR scans and leads across every channel in one dashboard.", "Simulated delivery data is always labelled Simulated."],
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="Four steps from first idea to first campaign."
        description="No studio, no agency negotiation, no guesswork about where your spend goes."
      >
        <Button asChild size="lg" className="bg-brand-500 hover:bg-brand-400">
          <Link href="/register">Start a campaign</Link>
        </Button>
      </PageHero>
      <Section>
        <SectionHeading eyebrow="The workflow" title="What happens at each step" />
        <ol className="mt-14 space-y-0 divide-y divide-line">
          {STEPS.map((s, i) => (
            <li key={s.title} className="grid gap-6 py-10 md:grid-cols-[auto_1fr_1.2fr] md:gap-12">
              <span className="font-display text-5xl font-semibold text-brand-600">0{i + 1}</span>
              <div>
                <h3 className="text-2xl font-semibold text-navy-900">{s.title}</h3>
                <p className="mt-2 text-navy-500">{s.body}</p>
              </div>
              <div className="text-navy-600">
                <p>{DETAILS[i][0]}</p>
                <p className="mt-2 text-sm text-navy-400">{DETAILS[i][1]}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>
      <FaqSection />
      <FinalCta />
    </>
  );
}
