import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";

const appTypes = [
  {
    type: "Presence App",
    tier: "Basic App",
    tagline: "Your customers need to find you, see your menu, book appointments, or access your content.",
    examples: [
      "Business profile app",
      "Portfolio app",
      "Restaurant menu app",
      "Event or booking enquiry app",
      "Educational content or notes app",
      "Community or blog app",
    ],
    ctaMessage:
      "Hi Shyara Marketing, I need a Basic App for my business (business profile / menu / booking / content type). Can you share pricing and timeline?",
    border: "border-accent/40",
    bg: "bg-accent/5",
  },
  {
    type: "Product App",
    tier: "Custom App",
    tagline: "You need real functionality with payments, user accounts, dashboards, APIs, and scalable architecture.",
    examples: [
      "E-commerce marketplace app",
      "Fintech or banking app",
      "Healthcare management app",
      "Real estate platform",
      "Food delivery app",
      "On-demand service app",
    ],
    ctaMessage:
      "Hi Shyara Marketing, I am looking for a Custom App with advanced features and integrations. I would like to discuss my requirements and get a quote. When can we talk?",
    border: "border-border",
    bg: "bg-card",
  },
];

const appProcess = [
  {
    step: "1",
    title: "Requirements Scoping",
    description: "We define exactly what the app needs to do, the screens required, and the stack before coding starts.",
  },
  {
    step: "2",
    title: "UI/UX Design",
    description: "You review interactive mockups before development. We do not code blind.",
  },
  {
    step: "3",
    title: "Development and Testing",
    description: "We build iteratively and share regular Android and iOS test builds for feedback.",
  },
  {
    step: "4",
    title: "Launch and Handover",
    description: "We publish to app stores and hand over source code and assets. Full ownership is yours.",
  },
];

const faqItems = [
  {
    question: "Does the app work on both Android and iOS?",
    answer: "Yes. We build with React Native or Flutter, which produces a single codebase that runs natively on both Android and iOS. This means faster delivery and lower cost compared to building two separate apps. Native development is available when specific platform requirements demand it.",
  },
  {
    question: "Do I own the source code after delivery?",
    answer: "Yes. Full source code ownership is transferred to you after final payment. You can take the codebase to any developer in the future — there is no ongoing dependency on us.",
  },
  {
    question: "How long does app development take?",
    answer: "A basic presence app (business profile, menu, booking, content) typically takes 3–6 weeks. A custom product app (marketplace, fintech, healthcare, food delivery) typically takes 3–6 months. We scope requirements fully before providing a timeline — no surprise delays.",
  },
  {
    question: "What happens after the app launches?",
    answer: "We assist with app store submission (Google Play and Apple App Store) as part of the handover. Post-launch support and maintenance packages are available if you want ongoing updates and bug fixes.",
  },
  {
    question: "How do you prevent scope creep and cost overruns?",
    answer: "We write a detailed requirements document before a single line of code is written. You approve the scope, timeline, and pricing upfront. Any new features added after scope approval are quoted separately — there are no surprise bills.",
  },
];

export default function AppDevelopmentService() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const openWhatsApp = (message: string) => {
    window.open(`https://wa.me/919584661610?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <Layout>
      <SEO
        title="App Development"
        description="Mobile app development for business use cases, from basic MVPs to custom scalable products."
        canonical="/services/app-development"
        keywords="app development, mobile app development, custom app development, business mobile app"
        breadcrumbs={[
          { name: "Services", url: "https://marketing.shyara.co.in/services" },
          { name: "App Development", url: "https://marketing.shyara.co.in/services/app-development" },
        ]}
        serviceSchema={{
          name: "App Development",
          description: "Cross-platform mobile app development for Android and iOS using React Native and Flutter. From simple presence apps to full-scale product apps with payments, user accounts, and dashboards. Full source code ownership after delivery.",
          url: "https://marketing.shyara.co.in/services/app-development",
        }}
        faqSchema={faqItems}
      />

      <PageHero
        label="App Development"
        breadcrumbs={[
          { label: "Services", href: "/services" },
          { label: "App Development" },
        ]}
        title={<>Your Business Idea, Turned Into an App <span className="text-accent">That Works.</span></>}
        description="From simple business apps to complex marketplace platforms, we choose the right stack and scope everything before we build."
        trustPoints={["Clear scope before coding", "Regular test builds", "Full source-code ownership"]}
      />

      <section className="py-20 lg:py-28 bg-[hsl(var(--surface))]">
        <div className="container">
          <div className="text-center mb-12">
            <span className="section-label block mb-3">Our Offerings</span>
            <h2 className="text-section font-bold text-foreground">What Kind of App Do You Need?</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Not sure which applies to you? Pick either card and start the discussion.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {appTypes.map((app) => (
              <div
                key={app.type}
                className={`rounded-card border-2 ${app.border} ${app.bg} p-7 flex flex-col`}
              >
                <div className="mb-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-accent">{app.tier}</span>
                  <h3 className="text-section font-bold text-foreground mt-1">{app.type}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">{app.tagline}</p>

                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Examples</p>
                  <div className="flex flex-wrap gap-2">
                    {app.examples.map((example) => (
                      <span
                        key={example}
                        className="text-xs bg-background text-secondary-foreground border border-border px-3 py-1 rounded-full"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto">
                  <Button
                    onClick={() => openWhatsApp(app.ctaMessage)}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Enquire on WhatsApp
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <span className="section-label block mb-3">How It Works</span>
            <h2 className="text-section font-bold text-foreground">Our Development Process</h2>
            <p className="text-muted-foreground mt-2">We scope before we build, so there are no surprises.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-border" />
            {appProcess.map((step) => (
              <div key={step.step} className="flex flex-col items-center text-center relative">
                <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center mb-4 z-10 bg-background">
                  <span className="text-xl font-extrabold text-accent">{step.step}</span>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-[hsl(var(--surface))]">
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

      <section className="py-16 bg-ctaBand border-l-4 border-accent text-white">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-section font-bold mb-2">Ready to Build Your App?</h2>
          <p className="text-white/60 text-sm mb-6">
            Tell us about your idea and we will scope it into a clear plan with real pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => openWhatsApp("Hi Shyara Marketing, I want to build a mobile app. Can we discuss my requirements and get a quote?")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Get a Quote
            </Button>
            <Link to="/samples/websites">
              <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white gap-2">
                View Web Portfolio
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
