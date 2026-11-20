import type { Metadata } from "next";
import { PageHero, Section } from "@/components/marketing/section";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the Bada AI team."
        description="Questions about getting started, agency accounts or pricing? Send us a message and we'll get back to you."
      />
      <Section>
        <div className="mx-auto max-w-2xl">
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
