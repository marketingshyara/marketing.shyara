import { Link } from "react-router-dom";
import { Share2, Target, Globe, Smartphone, ArrowRight, MessageCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";

const services = [
  {
    id: "social-media",
    title: "Social Media Management",
    description: "Monthly plans from ₹7,999 — reels, creatives, engagement management, and Google Business Profile.",
    icon: Share2,
    href: "/services/social-media",
    ctaLabel: "Explore Plans",
  },
  {
    id: "ads",
    title: "Ads Campaign Management",
    description: "20% management fee model. No hidden markups on your ad budget. Transparent, results-focused.",
    icon: Target,
    href: "/services/ads-campaign-management",
    ctaLabel: "See Pricing",
  },
  {
    id: "website",
    title: "Website Development",
    description: "Basic to custom. Fast, functional websites built to convert — with clear timelines and pricing.",
    icon: Globe,
    href: "/services/website-development",
    ctaLabel: "View Details",
  },
  {
    id: "app",
    title: "App Development",
    description: "MVP to full-scale apps. We scope before we build so there are no surprises.",
    icon: Smartphone,
    href: "/services/app-development",
    ctaLabel: "View Details",
  },
];

const processSteps = [
  {
    title: "Discovery Call",
    description: "Free consultation. We understand your goals before recommending anything.",
  },
  {
    title: "Strategy & Plan",
    description: "Clear deliverables, timeline, and pricing in writing. No surprises.",
  },
  {
    title: "Execution",
    description: "We build, publish, manage — with regular WhatsApp updates throughout.",
  },
  {
    title: "Review & Grow",
    description: "Monthly results shared. We adjust based on data and your feedback.",
  },
];

const trustStats = [
  {
    value: "100+",
    label: "Projects Delivered",
    note: "Across social media, ads, websites, and apps",
  },
  {
    value: "50+",
    label: "Happy Clients",
    note: "From local shops to scaling brands",
  },
  {
    value: "5+",
    label: "Years of Experience",
    note: "Building digital solutions that hold up",
  },
];

export default function Home() {
  const openWhatsAppHero = () => {
    window.open(
      "https://wa.me/919584661610?text=Hi%20Shyara%20Marketing%2C%20I%20visited%20your%20website%20and%20I%27m%20looking%20for%20digital%20marketing%20%2F%20technology%20services%20for%20my%20business.%20Can%20we%20discuss%3F",
      "_blank"
    );
  };

  const openWhatsAppServices = () => {
    window.open(
      "https://wa.me/919584661610?text=Hi%20Shyara%20Marketing%2C%20I%27m%20not%20sure%20which%20service%20fits%20my%20business.%20Can%20you%20help%20me%20figure%20out%20the%20right%20option%3F",
      "_blank"
    );
  };

  const openWhatsAppCTA = () => {
    window.open(
      "https://wa.me/919584661610?text=Hi%20Shyara%20Marketing%2C%20I%27ve%20gone%20through%20your%20services%20and%20I%27d%20like%20to%20discuss%20how%20you%20can%20help%20grow%20my%20business.%20When%20can%20we%20talk%3F",
      "_blank"
    );
  };

  return (
    <Layout>
      <SEO
        title="Digital Marketing & Technology Services"
        description="Shyara Marketing helps businesses grow through social media management, advertising campaigns, website development, and app development with clarity, consistency, and measurable results."
        canonical="/"
        keywords="digital marketing India, social media management, website development, app development, advertising campaigns, Shyara Marketing, digital marketing agency, online marketing services"
      />

      {/* Hero Section */}
      <section className="gradient-hero py-20 lg:py-28 overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text content */}
            <div className="animate-fade-in">
              <span className="section-label block mb-4">Digital Marketing & Technology</span>
              <h1 className="text-hero lg:text-display font-extrabold tracking-tight text-foreground">
                Your Business Deserves a Digital Presence That Actually{" "}
                <span className="text-accent">Converts.</span>
              </h1>
              <p className="mt-5 text-body text-muted-foreground leading-relaxed max-w-lg md:text-lg">
                We handle social media, ads, websites, and apps — so you can focus on running
                your business while we grow it online.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Button
                  size="lg"
                  onClick={openWhatsAppHero}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Get a Free Consultation
                </Button>
                <Link to="/samples">
                  <Button size="lg" variant="outline" className="gap-2">
                    See Our Work
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Floating stat cards (desktop only) */}
            <div className="relative h-[320px] hidden lg:block">
              <div className="absolute top-0 right-0 w-56 bg-card rounded-card border border-border shadow-card p-5 rotate-2 hover:rotate-0 hover:shadow-elevated transition-all duration-300">
                <div className="text-section font-extrabold text-accent">100+</div>
                <div className="text-small text-muted-foreground mt-1">Projects Delivered</div>
              </div>
              <div className="absolute top-28 left-4 w-48 bg-card rounded-card border border-border shadow-card p-5 -rotate-1 hover:rotate-0 hover:shadow-elevated transition-all duration-300">
                <div className="text-section font-extrabold text-accent">50+</div>
                <div className="text-small text-muted-foreground mt-1">Happy Clients</div>
              </div>
              <div className="absolute bottom-0 right-8 w-52 bg-card rounded-card border border-border shadow-card p-5 rotate-1 hover:rotate-0 hover:shadow-elevated transition-all duration-300">
                <div className="text-section font-extrabold text-accent">5+</div>
                <div className="text-small text-muted-foreground mt-1">Years of Experience</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 lg:py-28 bg-[hsl(var(--surface))]">
        <div className="container">
          <div className="text-center mb-12">
            <span className="section-label block mb-3">What We Do</span>
            <h2 className="text-section font-bold text-foreground md:text-4xl">
              Four Services. One Focused Team.
            </h2>
            <p className="text-body text-muted-foreground mt-3 max-w-2xl mx-auto">
              Whether you need online visibility, ads that convert, a website that works, or an app —
              we have a clear process for each.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          <div className="mt-12 max-w-xl mx-auto">
            <div className="rounded-card bg-card border border-border shadow-card p-6 text-center">
              <p className="text-small text-muted-foreground mb-4">
                Not sure which service fits your business?
              </p>
              <Button
                onClick={openWhatsAppServices}
                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Ask Us — We'll Recommend
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work — Process Section */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <span className="section-label block mb-3">Our Process</span>
            <h2 className="text-section font-bold text-foreground md:text-4xl">
              How We Turn Vision Into Results
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-border" />
            {processSteps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center relative">
                <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center mb-4 z-10 bg-background">
                  <span className="text-xl font-extrabold text-accent">{i + 1}</span>
                </div>
                <h3 className="text-body font-semibold mb-2 text-foreground">{step.title}</h3>
                <p className="text-small text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Teaser */}
      <section className="py-20 lg:py-28 bg-[hsl(var(--surface))]">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
            <div>
              <span className="section-label block mb-3">Our Work</span>
              <h2 className="text-section font-bold text-foreground md:text-4xl">See What We've Built</h2>
              <p className="text-body text-muted-foreground mt-2">
                Real websites we've built for real businesses.
              </p>
            </div>
            <Link to="/samples" className="flex-shrink-0">
              <Button variant="outline" className="gap-2">
                Browse Full Portfolio
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/samples/websites"
              className="group rounded-card border border-border bg-card shadow-card p-7 hover:shadow-elevated hover:border-accent/40 transition-all duration-300 flex items-start gap-5"
            >
              <div className="icon-well-lg group-hover:bg-accent/20 transition-colors">
                <Globe className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Website Designs</h3>
                <p className="text-muted-foreground text-small leading-relaxed">
                  Live interactive previews of websites we've built — explore them before you commit.
                </p>
                <span className="inline-flex items-center gap-1 text-accent text-small font-semibold mt-4 group-hover:gap-2 transition-all">
                  Preview Sites <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <span className="section-label block mb-3">By the Numbers</span>
            <h2 className="text-section font-bold text-foreground">Trusted by Growing Businesses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {trustStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-card border border-border bg-card p-8 text-center shadow-card"
              >
                <div className="text-5xl font-extrabold text-accent mb-2">{stat.value}</div>
                <div className="font-semibold text-foreground mb-1">{stat.label}</div>
                <div className="text-small text-muted-foreground">{stat.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-20 bg-ctaBand border-l-4 border-accent text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-section md:text-3xl font-bold mb-3">
              Ready to Grow Your Business?
            </h2>
            <p className="text-white/70 text-small mb-8">
              First consultation is always free. No commitment required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={openWhatsAppCTA}
                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                Start a Conversation
              </Button>
              <Link to="/services">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white gap-2"
                >
                  Explore Services
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
