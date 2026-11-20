import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  Clapperboard,
  GraduationCap,
  Hammer,
  Home,
  MapPin,
  Megaphone,
  MonitorPlay,
  Newspaper,
  QrCode,
  Radio,
  Rocket,
  Share2,
  ShieldCheck,
  Sparkles,
  Store,
  Stethoscope,
  Target,
  Utensils,
  Gem,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { PricingGrid } from "@/components/marketing/pricing-section";
import { cn } from "@/lib/utils";

/* ------------------------------ Problem ------------------------------ */
const PROBLEMS = [
  {
    title: "Too many disconnected platforms",
    body: "TV, YouTube, Meta, publishers and local screens each have their own dashboards, creatives and billing — hard to run as one plan.",
  },
  {
    title: "Ad production is slow and costly",
    body: "Different formats for every channel mean agencies, studios and long lead times for a business that wants to start this week.",
  },
  {
    title: "Spend is split, results are blurry",
    body: "Without a single view of budget and performance, every rupee is harder to justify across neighbourhoods and channels.",
  },
];

export function ProblemSection() {
  return (
    <Section>
      <SectionHeading
        eyebrow="The problem"
        title="Audiences are everywhere. Your ads should be too."
        description="Indian businesses need reach across screens and feeds — but buying and measuring each channel separately keeps great campaigns out of reach."
      />
      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
        {PROBLEMS.map((p, i) => (
          <div key={p.title} className="bg-white p-8">
            <span className="font-display text-sm font-semibold text-brand-600">0{i + 1}</span>
            <h3 className="mt-4 text-xl font-semibold text-navy-900">{p.title}</h3>
            <p className="mt-3 leading-relaxed text-navy-500">{p.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------ Solution ------------------------------ */
const SOLUTION_POINTS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Sparkles, title: "Create", body: "Describe your business. AI drafts the concept, script and ad creative for you to review." },
  { icon: Target, title: "Target", body: "Choose the pincodes and neighbourhoods where your customers actually live and shop." },
  { icon: BarChart3, title: "Measure", body: "See impressions, QR scans and leads in one dashboard — with simulated data clearly labelled." },
];

export function SolutionSection() {
  return (
    <Section tone="surface">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <SectionHeading
          eyebrow="The Bada AI approach"
          title="One platform from brief to result."
          description="Bada AI brings creative, targeting and reporting together, so a first campaign feels more like setting up an online ad than commissioning a production."
        />
        <ul className="space-y-4">
          {SOLUTION_POINTS.map((p) => (
            <li key={p.title} className="flex gap-5 rounded-xl border border-line bg-white p-6 shadow-soft">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <p.icon className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-navy-900">{p.title}</h3>
                <p className="mt-1 text-navy-500">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ------------------------------ How it works ------------------------------ */
export const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Store, title: "Tell us about your business", body: "Share what you sell, who you want to reach and what you want the campaign to achieve." },
  { icon: Clapperboard, title: "AI makes creatives", body: "Generate formats for TV, social, video, banners and local screens — then refine before launch." },
  { icon: MapPin, title: "Pick platforms & target", body: "Select channels, allocate budget, set pincodes and schedule — one campaign plan." },
  { icon: BarChart3, title: "Measure everything", body: "Compare CTV, social, publishers and local screens in one dashboard and reallocate spend." },
];

export function HowItWorksSection({ showCta = true }: { showCta?: boolean }) {
  return (
    <Section id="how-it-works">
      <SectionHeading
        eyebrow="How Bada AI works"
        title="From idea to campaign in four steps."
        align="center"
      />
      <ol className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative">
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className="absolute left-14 right-[-1.5rem] top-5 hidden border-t border-dashed border-line-strong lg:block"
              />
            )}
            <div className="relative flex size-10 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-white">
              {i + 1}
            </div>
            <s.icon className="mt-6 size-6 text-brand-600" aria-hidden />
            <h3 className="mt-3 text-lg font-semibold text-navy-900">{s.title}</h3>
            <p className="mt-2 leading-relaxed text-navy-500">{s.body}</p>
          </li>
        ))}
      </ol>
      {showCta && (
        <div className="mt-14 text-center">
          <Button asChild variant="secondary" size="lg">
            <Link href="/how-it-works">
              See the full walkthrough <ArrowRight />
            </Link>
          </Button>
        </div>
      )}
    </Section>
  );
}

/* ------------------------------ Channels ------------------------------ */
const CHANNEL_CARDS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: MonitorPlay, title: "Connected TV & OTT", body: "Smart TVs, streaming apps and CTV networks — where inventory is available via partners." },
  { icon: Clapperboard, title: "YouTube & video", body: "In-stream and online video inventory through YouTube and video advertising networks." },
  { icon: Share2, title: "Meta social", body: "Facebook and Instagram campaigns, with room to add more social platforms later." },
  { icon: Newspaper, title: "Digital publishers", body: "News sites, regional media, mobile apps and content publisher networks." },
  { icon: Store, title: "Local screens", body: "Mall displays, retail screens, LED boards and neighbourhood digital inventory." },
  { icon: Radio, title: "Outdoor & transit", body: "Billboards, transit and outdoor inventory when listed by approved providers." },
];

export function ChannelsSection() {
  return (
    <Section tone="surface" id="platforms">
      <SectionHeading
        eyebrow="Platforms"
        title="Every channel your customers use."
        description="Run one campaign across CTV, social, video, publishers and local advertising — with budgets and creatives managed in Bada AI."
        align="center"
      />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CHANNEL_CARDS.map((c) => (
          <div key={c.title} className="rounded-2xl border border-line bg-white p-6 shadow-soft">
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <c.icon className="size-5" aria-hidden />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-navy-900">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-500">{c.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Button asChild variant="secondary" size="lg">
          <Link href="/marketplace">
            Open advertising marketplace <ArrowRight />
          </Link>
        </Button>
      </div>
    </Section>
  );
}

/* ------------------------------ AI ad creation ------------------------------ */
export function AiCreationSection() {
  return (
    <Section tone="navy" className="bg-grid-navy">
      <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading
            tone="dark"
            eyebrow="AI ad creation"
            title="Your brief in. Multi-format creatives out."
            description="Bada AI turns a few plain-language answers into creatives for CTV, YouTube, Reels, stories, banners and local screens. You stay in control — review, edit and approve before anything is submitted."
          />
          <ul className="mt-8 space-y-3 text-navy-300">
            {[
              "Write a brief in your own words and language",
              "Review the AI-proposed plan and script",
              "Preview the generated creative and refine details in the editor",
              "Clearly marked when a creative comes from a mock provider",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-400" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Illustrative studio pipeline */}
        <div aria-hidden className="space-y-3">
          {[
            { label: "Brief", width: "w-3/4" },
            { label: "Plan", width: "w-full" },
            { label: "Generate", width: "w-2/3" },
            { label: "Preview", width: "w-5/6" },
          ].map((row, i) => (
            <div key={row.label} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-semibold text-white">
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{row.label}</p>
                <div className={cn("mt-2 h-2 rounded-full bg-white/15", row.width)} />
              </div>
            </div>
          ))}
          <p className="pt-1 text-xs text-navy-400">Illustrative workflow</p>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------ Pincode targeting ------------------------------ */
export function PincodeSection() {
  return (
    <Section>
      <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
        <div aria-hidden className="order-2 lg:order-1">
          <div className="bg-dots-light rounded-2xl border border-line p-6 sm:p-8">
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 30 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "aspect-square rounded-md border",
                    [7, 8, 9, 13, 14, 15, 19, 20].includes(i)
                      ? "border-brand-600 bg-brand-600"
                      : "border-line-strong bg-white",
                  )}
                />
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {["PIN ••••••", "PIN ••••••", "PIN ••••••"].map((c, i) => (
                <span key={i} className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 font-mono text-xs text-brand-700">
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs text-navy-400">Illustrative targeting map</p>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow="Pincode targeting"
            title="Advertise where your customers are."
            description="Enter the six-digit pincodes around your store, clinic or showroom. Bada AI plans your campaign around those neighbourhoods instead of a whole region."
          />
          <ul className="mt-8 space-y-3 text-navy-600">
            {[
              "Add pincodes one by one or paste a list",
              "Layer on language and audience preferences",
              "Start local, then expand to new areas as you learn",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------ Analytics ------------------------------ */
export function AnalyticsSection() {
  const METRICS: { icon: LucideIcon; label: string }[] = [
    { icon: Megaphone, label: "Impressions & reach" },
    { icon: Target, label: "Clicks & leads" },
    { icon: QrCode, label: "QR scans" },
    { icon: CircleDollarSign, label: "Spend & cost per lead" },
  ];
  return (
    <Section tone="surface">
      <SectionHeading
        eyebrow="Analytics"
        title="Every result, in one place."
        description="Track how each campaign performs and which neighbourhoods respond. Where delivery data is simulated, Bada AI says so — every time."
        align="center"
      />
      <div className="mt-14 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div aria-hidden className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <div className="flex items-end gap-2 sm:gap-3" style={{ height: 220 }}>
            {[38, 52, 44, 66, 58, 78, 70, 92, 84, 100].map((h, i) => (
              <div
                key={i}
                className={cn("flex-1 rounded-t-md", i > 6 ? "bg-brand-600" : "bg-brand-200")}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <p className="mt-4 text-xs text-navy-400">Illustrative chart layout — no real data</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {METRICS.map((m) => (
            <li key={m.label} className="flex items-center gap-4 rounded-xl border border-line bg-white p-5 shadow-soft">
              <span className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <m.icon className="size-5" aria-hidden />
              </span>
              <span className="font-semibold text-navy-900">{m.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ------------------------------ Use cases ------------------------------ */
const USE_CASES: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Store, title: "Local retail", body: "Bring neighbourhood shoppers to your store with offers and festival campaigns." },
  { icon: Utensils, title: "Restaurants & food", body: "Promote a new outlet, a menu launch or weekend specials around your delivery radius." },
  { icon: GraduationCap, title: "Coaching & education", body: "Reach families near your institute ahead of admission season." },
  { icon: Stethoscope, title: "Clinics & healthcare", body: "Make a new clinic, specialist or health camp known in the area it serves." },
  { icon: Home, title: "Real estate", body: "Put a project in front of buyers in the pincodes that matter to it." },
  { icon: Gem, title: "Jewellery & fashion", body: "Showcase collections to local audiences before wedding and festive buying." },
  { icon: Hammer, title: "Services & trades", body: "Be the first name people remember when they need a local professional." },
  { icon: Rocket, title: "Launches & events", body: "Spread the word about a launch or event with a time-bound campaign." },
];

export function UseCasesSection() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Use cases"
        title="Built for businesses that have never run a TV ad."
        description="If your customers live within a few pincodes of you, Bada AI is designed for you."
      />
      <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {USE_CASES.map((u) => (
          <div key={u.title} className="border-t border-line-strong pt-5">
            <u.icon className="size-6 text-brand-600" aria-hidden />
            <h3 className="mt-4 text-lg font-semibold text-navy-900">{u.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-500">{u.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------ FAQ ------------------------------ */
export const FAQS = [
  {
    q: "Is my ad airing on live TV today?",
    a: "That depends on the environment you are using. Where delivery is simulated — for example in demo accounts — Bada AI labels the metrics as simulated and never presents them as live broadcast results.",
  },
  {
    q: "Do I need to have a video ready?",
    a: "No. Describe your business and goals and Bada AI's Studio drafts a concept, script and creative for you to review. Where a creative comes from a mock provider, it is marked as mock-generated.",
  },
  {
    q: "How does pincode targeting work?",
    a: "You add the six-digit pincodes where your customers live or shop, and your campaign is planned around those areas.",
  },
  {
    q: "What does it cost?",
    a: "Pricing is shown on the pricing page directly from the platform, and your campaign's budget breakdown — including fees and tax — is shown in your account before you pay.",
  },
  {
    q: "Can an agency manage several clients?",
    a: "Yes. Agencies can register an agency account to manage clients and team members from a dedicated workspace.",
  },
  {
    q: "How do I know the results are real?",
    a: "Every metrics view tells you whether the data is simulated. If you see a Simulated badge, treat the numbers as illustrative.",
  },
];

export function FaqSection() {
  return (
    <Section tone="surface" id="faq">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
        <SectionHeading eyebrow="FAQ" title="Questions, answered plainly." />
        <div className="divide-y divide-line-strong border-y border-line-strong">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-lg font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
                {f.q}
                <span
                  aria-hidden
                  className="flex size-7 shrink-0 items-center justify-center rounded-full border border-line-strong text-navy-500 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-navy-500">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------ Final CTA ------------------------------ */
export function FinalCta() {
  return (
    <section className="bg-grid-navy relative overflow-hidden bg-navy-900 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-60%] size-[40rem] -translate-x-1/2 rounded-full bg-brand-600/25 blur-3xl"
      />
      <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
        <h2 className="text-4xl font-semibold leading-[1.08] text-white sm:text-5xl">
          Your first omnichannel campaign is closer than you think.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-navy-300">
          Create an account, tell us about your business, and let Bada AI draft your first campaign.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="bg-brand-500 hover:bg-brand-400">
            <Link href="/register">
              Create Your First Ad <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outlineDark">
            <Link href="/contact">Talk to us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Pricing ------------------------------ */
export function PricingSection({ eyebrow = "Pricing" }: { eyebrow?: string }) {
  return (
    <Section id="pricing">
      <SectionHeading
        eyebrow={eyebrow}
        title="Clear pricing, shown before you commit."
        description="Plans and rates come straight from the platform. Each campaign also shows an itemised budget breakdown — media spend, platform fee and tax — before you pay."
        align="center"
      />
      <div className="mt-14">
        <PricingGrid />
      </div>
    </Section>
  );
}
