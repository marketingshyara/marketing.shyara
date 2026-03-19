import { Share2, Target, Globe, Smartphone, MessageCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { ServiceCard } from "@/components/ServiceCard";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";

const services = [
  {
    id: "social-media",
    title: "Social Media Management",
    description: "Monthly plans from Rs. 7,999 with reels, creatives, engagement management, and Google Business Profile support.",
    icon: Share2,
    href: "/services/social-media",
    ctaLabel: "Explore Plans",
  },
  {
    id: "ads",
    title: "Ads Campaign Management",
    description: "Transparent 20% management fee model with no hidden markups on your ad budget.",
    icon: Target,
    href: "/services/ads-campaign-management",
    ctaLabel: "See Pricing",
  },
  {
    id: "website",
    title: "Website Development",
    description: "Basic to custom builds with clear timelines, mobile-first performance, and full ownership.",
    icon: Globe,
    href: "/services/website-development",
    ctaLabel: "View Tiers",
  },
  {
    id: "app",
    title: "App Development",
    description: "From MVP apps to scalable products with clear scope, timeline, and handover.",
    icon: Smartphone,
    href: "/services/app-development",
    ctaLabel: "View Details",
  },
];

export default function Services() {
  const openWhatsApp = () => {
    window.open(
      "https://wa.me/919584661610?text=Hi%20Shyara%20Marketing%2C%20I%27m%20not%20sure%20which%20service%20fits%20my%20business.%20Can%20you%20guide%20me%20to%20the%20right%20option%3F",
      "_blank"
    );
  };

  const openWhatsAppCustom = () => {
    window.open(
      "https://wa.me/919584661610?text=Hi%20Shyara%20Marketing%2C%20I%20have%20specific%20requirements%20that%20may%20need%20a%20custom%20approach.%20Can%20we%20discuss%20my%20needs%3F",
      "_blank"
    );
  };

  return (
    <Layout>
      <SEO
        title="Services"
        description="Explore our comprehensive digital services including social media management, advertising campaign management, website development, and app development tailored to your business needs."
        canonical="/services"
        keywords="digital marketing services, social media management service, ad campaign management, website development company, app development agency, digital advertising, SEO services India"
      />

      <PageHero
        label="Our Services"
        title={<>Everything Your Business Needs to Grow <span className="text-accent">Online.</span></>}
        description="Four focused services. One execution team. Clear pricing, fixed deliverables, and direct support."
        trustPoints={["Transparent pricing", "Defined deliverables", "Direct WhatsApp support"]}
      >
        <Button onClick={openWhatsApp} variant="outline" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Need Help Choosing a Service?
        </Button>
      </PageHero>

      <section className="py-20 lg:py-28 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-section font-bold text-foreground md:text-4xl">Our Services</h2>
            <p className="text-body text-muted-foreground mt-3 max-w-2xl mx-auto">
              Click any service to explore pricing, process, and frequently asked questions.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="animate-fade-in-up opacity-0"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <ServiceCard
                  title={service.title}
                  description={service.description}
                  icon={service.icon}
                  href={service.href}
                  ctaLabel={service.ctaLabel}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-[hsl(var(--surface))]">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-section font-bold mb-3 text-foreground">Need Something Unique?</h2>
          <p className="text-body text-muted-foreground mb-6">
            Our services can be combined or customized. Tell us your goal and we will design the right approach.
          </p>
          <Button
            size="lg"
            onClick={openWhatsAppCustom}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Discuss My Requirements
          </Button>
        </div>
      </section>
    </Layout>
  );
}
