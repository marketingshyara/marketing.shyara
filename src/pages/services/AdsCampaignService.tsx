import { Check, Target, Users, Image, BarChart2, FileText, PhoneCall, MessageCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";

const capabilities = [
  {
    icon: Target,
    title: "Campaign Strategy",
    description: "We define the right objective, budget split, and platform mix for your goals.",
  },
  {
    icon: Users,
    title: "Audience Targeting",
    description: "Precision targeting by location, demographics, interests, and custom audiences.",
  },
  {
    icon: Image,
    title: "Ad Creative Support",
    description: "Image creatives are included. Video ad editing is available as an add-on for Rs. 2,000/video.",
  },
  {
    icon: BarChart2,
    title: "Daily Optimization",
    description: "We monitor performance daily and adjust bids, audiences, and creatives to lower cost-per-result.",
  },
  {
    icon: FileText,
    title: "Performance Reports",
    description: "Clear reports showing reach, clicks, conversions, and spend in plain language.",
  },
  {
    icon: PhoneCall,
    title: "Dedicated Support",
    description: "Direct WhatsApp access to your campaign manager for quick updates and decisions.",
  },
];

const faqItems = [
  {
    question: "How does the 20% management fee work?",
    answer: "You decide your monthly ad budget (we recommend a minimum of Rs. 5,000/month). We charge 20% of that budget as our management fee, paid in advance. For example, if your ad budget is Rs. 10,000/month, our fee is Rs. 2,000. Your full Rs. 10,000 goes to the ad platforms — we do not take a cut from it.",
  },
  {
    question: "What platforms do you manage ads on?",
    answer: "We manage campaigns on Meta (Facebook and Instagram), Google Search and Display, and YouTube. We recommend the right platform mix based on your business type and target audience.",
  },
  {
    question: "Do I retain ownership of my ad accounts?",
    answer: "Yes. You always retain full ownership of your Facebook Ads Manager, Google Ads account, and any other platforms used. We request access to manage campaigns on your behalf — we never create accounts under our ownership.",
  },
  {
    question: "What is the minimum ad budget required?",
    answer: "We recommend a minimum ad budget of Rs. 5,000/month for meaningful results. Below this threshold, the data is too limited to optimize effectively. We will be upfront if we believe a higher budget is needed for your specific goals.",
  },
  {
    question: "Are ad creatives included in the management fee?",
    answer: "Yes. Static image ad creatives are included in the management fee at no extra cost. Video ad editing is available as an add-on at Rs. 2,000 per video.",
  },
];

export default function AdsCampaignService() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const openWhatsApp = (type: "enquire" | "discuss") => {
    const message =
      type === "enquire"
        ? "Hi Shyara Marketing, I am interested in your Ad Campaign Management service (20% management fee model). I would like to know more about how you can run ads for my business."
        : "Hi Shyara Marketing, I already have a business and want to run ads. Can we set up a call to discuss budget, goals, and campaign strategy?";

    window.open(`https://wa.me/919584661610?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <Layout>
      <SEO
        title="Ads Campaign Management"
        description="End-to-end ad campaign management with transparent pricing, optimization, and reporting."
        canonical="/services/ads-campaign-management"
        keywords="ads campaign management, paid advertising service, local ad targeting, ad optimization"
        breadcrumbs={[
          { name: "Services", url: "https://marketing.shyara.co.in/services" },
          { name: "Ads Campaign Management", url: "https://marketing.shyara.co.in/services/ads-campaign-management" },
        ]}
        serviceSchema={{
          name: "Ads Campaign Management",
          description: "End-to-end advertising campaign management on Meta (Facebook and Instagram), Google Ads, and YouTube. Transparent 20% management fee model with no hidden markups. Includes free image creatives, daily optimization, and weekly performance reports.",
          url: "https://marketing.shyara.co.in/services/ads-campaign-management",
        }}
        faqSchema={faqItems}
      />

      <PageHero
        label="Ads Campaign Management"
        breadcrumbs={[
          { label: "Services", href: "/services" },
          { label: "Ads Campaign Management" },
        ]}
        title={<>More Reach. Better ROI. <span className="text-accent">Ads That Actually Perform.</span></>}
        description="We manage campaigns end-to-end, from strategy to creative to daily optimization, with transparent pricing and clear reporting."
        trustPoints={["20% transparent fee model", "Daily optimization", "Plain-language reporting"]}
      />

      <section className="py-20 lg:py-28 bg-[hsl(var(--surface))]">
        <div className="container">
          <div className="text-center mb-12">
            <span className="section-label block mb-3">What We Handle</span>
            <h2 className="text-section font-bold text-foreground">End-to-End Campaign Management</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              From the first ad to the final report, we cover every stage of your campaign.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {capabilities.map((cap) => (
              <div key={cap.title} className="rounded-xl border border-border bg-card p-5">
                <div className="icon-well mb-4">
                  <cap.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <span className="section-label block mb-3">Pricing Model</span>
            <h2 className="text-section font-bold text-foreground">Simple. Transparent. Fair.</h2>
          </div>
          <div className="rounded-card border-2 border-accent/40 bg-accent/5 p-8 max-w-2xl mx-auto text-center">
            <div className="text-6xl font-extrabold text-accent mb-1">20%</div>
            <div className="text-xl font-semibold text-foreground mb-3">of your ad budget</div>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
              No fixed monthly retainer. You control the budget. We take 20% as a management fee, paid in advance each month.
            </p>
            <div className="mt-6 flex flex-col gap-3 text-left max-w-xs mx-auto">
              {[
                "Free image ad creatives included",
                "Video editing add-on available (Rs. 2,000/video)",
                "No hidden markup on ad budget",
                "Recommended minimum budget: Rs. 5,000/month",
              ].map((point) => (
                <div key={point} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-accent flex-shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[hsl(var(--surface))]">
        <div className="container max-w-3xl mx-auto text-center">
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              We have managed{" "}
              <span className="font-semibold text-foreground">Rs. 2L+ in combined ad spend</span>{" "}
              across clients on Meta and Google. Every rupee is tracked, reported, and optimized — with no markup on what goes to the platform.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-background">
        <div className="container max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="section-label block mb-3">FAQ</span>
            <h2 className="text-section font-bold text-foreground">Common Questions</h2>
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

      <section className="py-16 bg-background">
        <div className="container max-w-3xl mx-auto">
          <div className="rounded-card border border-border bg-card p-8 text-center">
            <h2 className="text-section font-bold text-foreground mb-2">Let&apos;s Discuss Your Campaign Goals</h2>
            <p className="text-muted-foreground text-sm mb-6">
              No commitment for the first conversation. We will tell you honestly if ads are the right move for your business now.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => openWhatsApp("enquire")}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Enquire on WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => openWhatsApp("discuss")}
                className="flex-1"
              >
                Discuss Campaign
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
