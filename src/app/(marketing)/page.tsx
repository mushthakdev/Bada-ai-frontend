import { Hero } from "@/components/marketing/hero";
import {
  AiCreationSection,
  AnalyticsSection,
  ChannelsSection,
  FaqSection,
  FinalCta,
  HowItWorksSection,
  PincodeSection,
  PricingSection,
  ProblemSection,
  SolutionSection,
  UseCasesSection,
} from "@/components/marketing/landing-sections";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <ChannelsSection />
      <HowItWorksSection />
      <AiCreationSection />
      <PincodeSection />
      <AnalyticsSection />
      <UseCasesSection />
      <PricingSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
