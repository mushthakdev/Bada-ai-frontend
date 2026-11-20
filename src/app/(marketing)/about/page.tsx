import type { Metadata } from "next";
import { PageHero, Section, SectionHeading } from "@/components/marketing/section";
import { FinalCta } from "@/components/marketing/landing-sections";

export const metadata: Metadata = { title: "About" };

const PRINCIPLES = [
  { title: "Accessible by design", body: "Omnichannel advertising should not require an agency, a studio or a big minimum commitment." },
  { title: "Local first", body: "Most Indian businesses serve a handful of neighbourhoods. Our tools start from the pincode, not the nation." },
  { title: "Honest about data", body: "When metrics are simulated or creatives are mock-generated, we say so plainly in the product." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Bada"
        title="Making omnichannel advertising work for every Indian business."
        description="Bada AI is an omnichannel advertising platform that helps businesses create, target and measure campaigns across TV, social, publishers and local screens."
      />
      <Section>
        <SectionHeading eyebrow="What we believe" title="Principles that shape the product" />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="border-t-2 border-brand-600 pt-5">
              <h3 className="text-xl font-semibold text-navy-900">{p.title}</h3>
              <p className="mt-2 leading-relaxed text-navy-500">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>
      <FinalCta />
    </>
  );
}
