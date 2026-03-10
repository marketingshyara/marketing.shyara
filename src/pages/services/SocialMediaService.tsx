import { Check, MessageCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter Plan",
    price: "Rs. 7,999",
    period: "/ month",
    description: "A consistent starter setup for local brand visibility.",
    features: [
      "4 trend-based reels every month",
      "8 creatives posted every month",
      "Google Business Profile optimization",
      "Engagement management",
    ],
  },
  {
    name: "Growth Plan",
    price: "Rs. 14,999",
    period: "/ month",
    description: "More content volume with strategic paid support included.",
    features: [
      "8 reels every month",
      "12 creatives posted every month",
      "Everything included in the Starter Plan",
      "Strategic ad planning",
      "Local targeted audience support",
      "Overall ad assistance included (free with this plan)",
    ],
    popular: true,
  },
  {
    name: "Scale Plan",
    price: "Rs. 20,000",
    period: "/ month",
    description: "For brands that want deeper intelligence and faster iteration.",
    features: [
      "12 reels every month",
      "16 creatives posted every month",
      "Everything included in the Growth Plan",
      "Personalized business AI insights",
      "Actionable customer preference insights",
    ],
  },
];

const howItWorks = [
  {
    step: "1",
    title: "We Onboard You",
    description: "Share brand assets, tone of voice, and target audience. Takes under 30 minutes.",
  },
  {
    step: "2",
    title: "We Create and Schedule",
    description: "Our team creates all reels, creatives, and captions and publishes them on your calendar.",
  },
  {
    step: "3",
    title: "You See Results",
    description: "Monthly engagement reports with what worked, what did not, and what we are doing next.",
  },
];

const faqItems = [
  {
    question: "What is included in each social media management plan?",
    answer: "Every plan includes reel production, image creatives, Google Business Profile optimization, engagement management (responding to comments and messages), and daily stories. The Starter plan includes 4 reels and 8 creatives per month. Growth adds ad planning and local audience targeting. Scale adds AI-powered business insights and customer preference data.",
  },
  {
    question: "How is content approved before it goes live?",
    answer: "We send you a content calendar before publishing each month. You review and approve every reel, creative, and caption before it is posted. Nothing goes live without your sign-off.",
  },
  {
    question: "Is there a lock-in contract for social media management?",
    answer: "No. All plans are on monthly billing. You can stop at any time with no penalty. We earn your business every month by delivering results.",
  },
  {
    question: "How do you report results?",
    answer: "You receive a monthly engagement report covering reach, follower growth, engagement rate, top-performing content, and what we are doing differently next month. You always know exactly what has been delivered.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer: "Yes. You can change plans at the start of any new billing month. Just message us on WhatsApp and we will update your plan immediately.",
  },
];

const comparisonRows = [
  { label: "Reels / month", starter: "4", growth: "8", scale: "12" },
  { label: "Image creatives / month", starter: "8", growth: "12", scale: "16" },
  { label: "Google Business Profile", starter: true, growth: true, scale: true },
  { label: "Engagement management", starter: true, growth: true, scale: true },
  { label: "Ad planning and assistance", starter: false, growth: true, scale: true },
  { label: "AI business insights", starter: false, growth: false, scale: true },
];

export default function SocialMediaService() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const openWhatsApp = (planName?: string) => {
    const selectedPlan = planName ? plans.find((p) => p.name === planName) : null;
    const message = selectedPlan
      ? `Hi Shyara Marketing, I want to proceed with your ${selectedPlan.name} (${selectedPlan.price}${selectedPlan.period}) for Social Media Management. Please share the next steps.`
      : "Hi Shyara Marketing, I need a custom Social Media Management plan for my business. Can we discuss requirements and pricing?";

    window.open(`https://wa.me/919584661610?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <Layout>
      <SEO
        title="Social Media Management"
        description="Explore our social media management plans with clear monthly deliverables, engagement support, and growth-focused execution."
        canonical="/services/social-media"
        keywords="social media management, reels package, creatives package, social media plans, local business social media"
        breadcrumbs={[
          { name: "Services", url: "https://marketing.shyara.co.in/services" },
          { name: "Social Media Management", url: "https://marketing.shyara.co.in/services/social-media" },
        ]}
        serviceSchema={{
          name: "Social Media Management",
          description: "Monthly social media management plans for Instagram, Facebook, and Google Business Profile. Includes reels, image creatives, engagement management. Plans from Rs. 7,999/month with no lock-in contracts.",
          url: "https://marketing.shyara.co.in/services/social-media",
        }}
        faqSchema={faqItems}
      />

      <PageHero
        label="Social Media Management"
        breadcrumbs={[
          { label: "Services", href: "/services" },
          { label: "Social Media Management" },
        ]}
        title={<>Consistent Content. Real Engagement. <span className="text-accent">Month After Month.</span></>}
        description="We handle your social media with a clear monthly plan, fixed deliverables, and transparent reporting."
        trustPoints={["Plans from Rs. 7,999/month", "No lock-in contracts", "Monthly reporting"]}
      />

      <section className="py-10 bg-[hsl(var(--surface))]">
        <div className="container">
          <div className="max-w-5xl mx-auto rounded-xl border border-accent/30 bg-gradient-to-br from-accent/5 to-accent/10 p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-accent">Core Value Across All Plans</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                "Zero hidden fees on ads. Your ad budget stays your ad budget.",
                "Daily story content to keep your brand active and visible.",
                "Trend-first execution focused on practical growth.",
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <span className="section-label block mb-3">How It Works</span>
            <h2 className="text-3xl font-bold text-foreground">Simple. Consistent. Clear.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-extrabold text-accent">{item.step}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-[hsl(var(--surface))]">
        <div className="container">
          <div className="text-center mb-12">
            <span className="section-label block mb-3">Pricing</span>
            <h2 className="text-3xl font-bold text-foreground">Choose Your Plan</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Need help choosing?{" "}
              <button onClick={() => openWhatsApp()} className="text-accent font-semibold hover:underline">
                Message us directly.
              </button>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 flex flex-col ${
                  plan.popular ? "border-accent bg-accent/5 shadow-md" : "border-border bg-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-5">{plan.description}</p>

                <div className="mb-6 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    What you get
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => openWhatsApp(plan.name)}
                  className={`w-full ${
                    plan.popular
                      ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                      : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  Choose This Plan
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-14 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-center mb-6 text-foreground">Plan Comparison</h3>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="grid grid-cols-4 bg-[hsl(var(--surface))] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <div>Feature</div>
                <div className="text-center">Starter</div>
                <div className="text-center">Growth</div>
                <div className="text-center">Scale</div>
              </div>
              {comparisonRows.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-4 px-6 py-4 text-sm items-center ${
                    i % 2 === 0 ? "bg-card" : "bg-[hsl(var(--surface))]"
                  }`}
                >
                  <div className="text-muted-foreground">{row.label}</div>
                  {[row.starter, row.growth, row.scale].map((val, vi) => (
                    <div key={vi} className="text-center">
                      {typeof val === "boolean" ? (
                        val ? (
                          <Check className="h-4 w-4 text-accent mx-auto" />
                        ) : (
                          <span className="text-muted-foreground/40">-</span>
                        )
                      ) : (
                        <span className="font-semibold text-foreground">{val}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container max-w-3xl mx-auto text-center">
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Businesses that post consistently see an average of{" "}
              <span className="font-semibold text-foreground">40% higher engagement</span>{" "}
              within the first three months. We have helped clients reach that benchmark — without them creating a single piece of content themselves.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-[hsl(var(--surface))]">
        <div className="container max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="section-label block mb-3">FAQ</span>
            <h2 className="text-3xl font-bold text-foreground">Common Questions</h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span className="font-medium text-foreground text-sm">{item.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-accent flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[hsl(215_20%_20%)] border-l-4 border-accent text-white">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to Get Started?</h2>
          <p className="text-white/60 text-sm mb-6">Choose a plan above or talk to us to find the right fit.</p>
          <Button
            onClick={() => openWhatsApp()}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Start on WhatsApp
          </Button>
        </div>
      </section>
    </Layout>
  );
}
