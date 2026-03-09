import { Check, Clock, Smartphone, Search, MessageCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const whyMatters = [
  {
    icon: Clock,
    stat: "3 seconds",
    description: "Time visitors take to judge your business. First impression matters.",
  },
  {
    icon: Smartphone,
    stat: "67%",
    description: "Of consumers are more likely to buy when a site is mobile-friendly.",
  },
  {
    icon: Search,
    stat: "SEO traffic",
    description: "Search-optimized websites attract long-term traffic without paying for every click.",
  },
];

const offerings = [
  {
    name: "Basic Website",
    badge: "Starter",
    description: "Ideal for small businesses and personal brands looking for a clean, professional online presence.",
    examples: [
      "Personal portfolio",
      "Local business website",
      "Consultant or coach website",
      "Wedding or event website",
    ],
    timeline: "Typical timeline: 3-5 business days",
    cta: "Enquire on WhatsApp",
    ctaMessage:
      "Hi Shyara Marketing, I need a Basic Website for my business (portfolio / local business / consultant type). Can you share pricing and timeline?",
    featured: false,
  },
  {
    name: "E-commerce / Booking Website",
    badge: "E-commerce",
    description: "For businesses that need online payments, product listings, or appointment bookings.",
    examples: [
      "Online clothing store",
      "Salon or clinic booking system",
      "Restaurant ordering and table booking",
      "Yoga or fitness class booking",
    ],
    timeline: "Typical timeline: 2-3 weeks",
    cta: "Enquire on WhatsApp",
    ctaMessage:
      "Hi Shyara Marketing, I need an E-commerce / Booking Website with online payments or appointment scheduling. Can we discuss features, pricing, and timeline?",
    featured: false,
  },
  {
    name: "Custom Website",
    badge: "Advanced",
    description: "Fully customized solutions for complex requirements and large-scale digital products.",
    examples: [
      "Social media platform",
      "Online marketplace",
      "Learning management system (LMS)",
      "Healthcare or construction project portal",
    ],
    timeline: "Timeline: Scoped per project",
    cta: "Get Quote on WhatsApp",
    ctaMessage:
      "Hi Shyara Marketing, I am looking for a Custom Website with advanced features. I would like to discuss my requirements and get a quote. When can we talk?",
    featured: true,
  },
];

const websiteProcess = [
  {
    step: "1",
    title: "Discovery Brief",
    description: "You share business details, goals, and references. It takes around 15 minutes over WhatsApp.",
  },
  {
    step: "2",
    title: "Design and Build",
    description: "We design and develop your site from the brief. You receive a preview link before final delivery.",
  },
  {
    step: "3",
    title: "Your Review",
    description: "Two revision rounds are included. Most updates are delivered within 1-2 business days.",
  },
  {
    step: "4",
    title: "Launch and Handover",
    description: "We deploy your site, configure your domain, and hand over complete access and ownership.",
  },
];

export default function WebsiteDevelopmentService() {
  const openWhatsApp = (message: string) => {
    window.open(`https://wa.me/919584661610?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <Layout>
      <SEO
        title="Website Development"
        description="Business-focused website development for basic sites, booking flows, e-commerce, and custom builds."
        canonical="/services/website-development"
        keywords="website development, ecommerce website, booking website, custom web app development"
        breadcrumbs={[
          { name: "Services", url: "https://shyaramarketing.com/services" },
          { name: "Website Development", url: "https://shyaramarketing.com/services/website-development" },
        ]}
        serviceSchema={{
          name: "Website Development",
          description: "Business website development from basic portfolios to full custom platforms. Mobile-first, SEO-optimized websites with clear timelines and transparent pricing. Basic sites in 3-5 days, e-commerce in 2-3 weeks. Full ownership on delivery.",
          url: "https://shyaramarketing.com/services/website-development",
        }}
      />

      <PageHero
        label="Website Development"
        breadcrumbs={[
          { label: "Services", href: "/services" },
          { label: "Website Development" },
        ]}
        title={<>Websites That Work for Your Business, <span className="text-accent">Not Just Look Good.</span></>}
        description="We build fast, SEO-ready websites tailored to your business type with clear timelines, transparent pricing, and full ownership on delivery."
        trustPoints={["Mobile-first performance", "SEO-ready structure", "Full ownership handover"]}
      />

      <section className="py-20 lg:py-28 bg-[hsl(var(--surface))]">
        <div className="container">
          <div className="text-center mb-12">
            <span className="section-label block mb-3">Why It Matters</span>
            <h2 className="text-3xl font-bold text-foreground">Your Website Is Your First Salesperson</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {whyMatters.map((item) => (
              <div key={item.stat} className="rounded-2xl border border-border bg-card p-7 text-center shadow-sm">
                <div className="icon-well-lg mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-accent" />
                </div>
                <div className="text-2xl font-extrabold text-accent mb-2">{item.stat}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <span className="section-label block mb-3">Our Offerings</span>
            <h2 className="text-3xl font-bold text-foreground">Choose the Right Tier</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Every tier includes mobile-first design, SEO setup, and revision support before launch.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {offerings.map((offering) => (
              <div
                key={offering.name}
                className={`rounded-2xl border p-6 flex flex-col ${
                  offering.featured
                    ? "border-accent/50 bg-accent/5 shadow-md"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={offering.featured ? "default" : "secondary"} className={offering.featured ? "bg-accent text-accent-foreground" : ""}>
                    {offering.badge}
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{offering.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{offering.description}</p>

                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Examples</p>
                  <div className="flex flex-wrap gap-2">
                    {offering.examples.map((example) => (
                      <span
                        key={example}
                        className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto">
                  <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                    {offering.timeline}
                  </p>
                  <Button
                    onClick={() => openWhatsApp(offering.ctaMessage)}
                    className={`w-full ${
                      offering.featured
                        ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                        : "bg-primary hover:bg-primary/90"
                    }`}
                  >
                    {offering.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-[hsl(var(--surface))]">
        <div className="container">
          <div className="text-center mb-12">
            <span className="section-label block mb-3">How It Works</span>
            <h2 className="text-3xl font-bold text-foreground">How Website Projects Work</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-border" />
            {websiteProcess.map((step) => (
              <div key={step.step} className="flex flex-col items-center text-center relative">
                <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center mb-4 z-10 bg-card">
                  <span className="text-xl font-extrabold text-accent">{step.step}</span>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[hsl(215_20%_20%)] border-l-4 border-accent text-white">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to Build Your Website?</h2>
          <p className="text-white/60 text-sm mb-6">
            Tell us about your business and we will recommend the right tier and timeline.
          </p>
          <Button
            onClick={() => openWhatsApp("Hi Shyara Marketing, I want to build a website for my business. Can we discuss the options and pricing?")}
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
