import type { Metadata } from "next";
import {
  BarChart3,
  Briefcase,
  CreditCard,
  Film,
  Languages,
  MapPin,
  MessageSquare,
  QrCode,
  Radio,
  ShieldCheck,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { PageHero, Section } from "@/components/marketing/section";
import { FinalCta } from "@/components/marketing/landing-sections";

export const metadata: Metadata = { title: "Features" };

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Radio, title: "Omnichannel campaigns", body: "Create one campaign and distribute across CTV, YouTube, Meta, publishers and local screens." },
  { icon: Sparkles, title: "AI Studio", body: "Go from a plain-language brief to multi-format creatives for every selected channel." },
  { icon: Film, title: "Creative editor", body: "Adjust headlines, calls to action and voiceover before you approve a creative." },
  { icon: MapPin, title: "Pincode targeting", body: "Plan campaigns around the six-digit pincodes that matter to your business." },
  { icon: Languages, title: "Regional languages", body: "Choose the language your ad should speak, from English to major Indian languages." },
  { icon: QrCode, title: "QR calls to action", body: "Give viewers a scannable next step and see the scans in your reports." },
  { icon: Target, title: "Lead tracking", body: "Collect and follow up on leads from your campaigns in one table." },
  { icon: BarChart3, title: "Unified analytics", body: "Compare channel performance in one dashboard, with simulated data clearly labelled." },
  { icon: CreditCard, title: "Transparent billing", body: "Itemised budget estimates and a payment history you can reconcile." },
  { icon: MessageSquare, title: "AI assistant", body: "Ask questions about your campaigns and get guidance in plain language." },
  { icon: Briefcase, title: "Agency workspace", body: "Manage multiple clients and team members from a dedicated workspace." },
  { icon: ShieldCheck, title: "Review & approvals", body: "Campaigns are reviewed before they go live so quality stays high." },
];

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title="The tools behind every platform campaign."
        description="A focused set of features designed to take the complexity out of multi-platform advertising."
      />
      <Section>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white p-8">
              <f.icon className="size-6 text-brand-600" aria-hidden />
              <h3 className="mt-5 text-lg font-semibold text-navy-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">{f.body}</p>
            </div>
          ))}
        </div>
      </Section>
      <FinalCta />
    </>
  );
}
