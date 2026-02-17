import { Link } from "react-router-dom";
import { Share2, Target, Globe, Smartphone, ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { ServiceCard } from "@/components/ServiceCard";
import { SocialMediaModal } from "@/components/modals/SocialMediaModal";
import { AdsModal } from "@/components/modals/AdsModal";
import { WebsiteModal } from "@/components/modals/WebsiteModal";
import { AppModal } from "@/components/modals/AppModal";
import { Button } from "@/components/ui/button";
import { useModalWithHistory } from "@/hooks/use-modal-history";

const services = [
  {
    id: "social-media",
    title: "Social Media Management",
    description: "Build a consistent presence with strategic content and community engagement.",
    icon: Share2,
  },
  {
    id: "ads",
    title: "Ads Campaign Management",
    description: "Drive results with data-driven ad campaigns and continuous optimization.",
    icon: Target,
  },
  {
    id: "website",
    title: "Website Development",
    description: "Fast, functional websites designed to convert and scale with your business.",
    icon: Globe,
  },
  {
    id: "app",
    title: "App Development",
    description: "Mobile apps that solve real problems — from MVPs to complex platforms.",
    icon: Smartphone,
  },
];

export default function Home() {
  const { openModal, isModalOpen, createOnOpenChange } = useModalWithHistory();

  const openWhatsAppHero = () => {
    window.open(
      "https://wa.me/919584661610?text=Hi%20Shyara%20Marketing%2C%20I%20visited%20your%20website%20and%20I%27m%20looking%20for%20digital%20marketing%20%2F%20technology%20services%20for%20my%20business.%20Can%20we%20discuss%3F",
      "_blank"
    );
  };

  const openWhatsAppCTA = () => {
    window.open(
      "https://wa.me/919584661610?text=Hi%20Shyara%20Marketing%2C%20I%27ve%20gone%20through%20your%20services%20and%20I%27d%20like%20to%20discuss%20how%20you%20can%20help%20grow%20my%20business.%20When%20can%20we%20talk%3F",
      "_blank"
    );
  };

  const scrollToServices = () => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
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
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in">
              Grow Your Business with{" "}
              <span className="text-accent">Digital Excellence</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in opacity-0" style={{ animationDelay: "0.1s" }}>
              We help businesses grow through social media, advertising, websites, and apps — 
              with clarity, consistency, and measurable results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in opacity-0" style={{ animationDelay: "0.2s" }}>
              <Button 
                size="lg" 
                onClick={openWhatsAppHero}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Talk to Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={scrollToServices}
              >
                Explore Services
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive digital solutions to help your business thrive in the modern landscape.
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
                  onViewDetails={() => openModal(service.id)}
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <Button variant="outline" size="lg">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="text-4xl font-bold text-accent mb-2">100+</div>
                <p className="text-muted-foreground">Projects Delivered</p>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-accent mb-2">50+</div>
                <p className="text-muted-foreground">Happy Clients</p>
              </div>
              <div className="p-6">
                <div className="text-4xl font-bold text-accent mb-2">5+</div>
                <p className="text-muted-foreground">Years of Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Grow Your Business?
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Let's discuss how we can help you achieve your goals with our digital marketing 
              and technology solutions.
            </p>
            <Button 
              size="lg" 
              onClick={openWhatsAppCTA}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Start a Conversation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <SocialMediaModal 
        open={isModalOpen("social-media")} 
        onOpenChange={createOnOpenChange("social-media")} 
      />
      <AdsModal 
        open={isModalOpen("ads")} 
        onOpenChange={createOnOpenChange("ads")} 
      />
      <WebsiteModal 
        open={isModalOpen("website")} 
        onOpenChange={createOnOpenChange("website")} 
      />
      <AppModal 
        open={isModalOpen("app")} 
        onOpenChange={createOnOpenChange("app")} 
      />
    </Layout>
  );
}
