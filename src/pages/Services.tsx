import { Share2, Target, Globe, Smartphone } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { ServiceCard } from "@/components/ServiceCard";
import { SocialMediaModal } from "@/components/modals/SocialMediaModal";
import { AdsModal } from "@/components/modals/AdsModal";
import { WebsiteModal } from "@/components/modals/WebsiteModal";
import { AppModal } from "@/components/modals/AppModal";
import { useModalWithHistory } from "@/hooks/use-modal-history";

const services = [
  {
    id: "social-media",
    title: "Social Media Management",
    description: "Build a consistent presence with strategic content, community engagement, and data-driven insights.",
    icon: Share2,
  },
  {
    id: "ads",
    title: "Ads Campaign Management",
    description: "Drive results with professionally managed ad campaigns, continuous optimization, and transparent reporting.",
    icon: Target,
  },
  {
    id: "website",
    title: "Website Development",
    description: "Fast, functional, and business-focused websites designed to convert visitors and scale with your growth.",
    icon: Globe,
  },
  {
    id: "app",
    title: "App Development",
    description: "Mobile apps that solve real business problems — from simple MVPs to complex, scalable platforms.",
    icon: Smartphone,
  },
];

export default function Services() {
  const { openModal, isModalOpen, createOnOpenChange } = useModalWithHistory();

  return (
    <Layout>
      <SEO 
        title="Services"
        description="Explore our comprehensive digital services including social media management, advertising campaign management, website development, and app development tailored to your business needs."
        canonical="/services"
        keywords="digital marketing services, social media management service, ad campaign management, website development company, app development agency, digital advertising, SEO services India"
      />
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Services
            </h1>
            <p className="text-lg text-muted-foreground">
              Comprehensive digital solutions tailored to your business needs. 
              Click on any service to explore details and pricing.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
