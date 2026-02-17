import { Camera, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { ServiceCard } from "@/components/ServiceCard";
import { SMMSamplesModal } from "@/components/modals/SMMSamplesModal";
import { useModalWithHistory } from "@/hooks/use-modal-history";

const sampleCategories = [
  {
    id: "smm-samples",
    title: "Social Media Samples",
    description: "Browse through our portfolio of engaging social media content - from scroll-stopping images to viral-ready reels.",
    icon: Camera,
    type: "modal" as const,
  },
  {
    id: "website-samples",
    title: "Website Samples",
    description: "Explore our collection of professionally designed websites with live previews you can interact with.",
    icon: Globe,
    type: "link" as const,
    href: "/samples/websites",
  },
];

export default function Samples() {
  const { openModal, isModalOpen, createOnOpenChange } = useModalWithHistory();
  const navigate = useNavigate();

  const handleViewDetails = (category: typeof sampleCategories[0]) => {
    if (category.type === "link" && category.href) {
      navigate(category.href);
    } else {
      openModal(category.id);
    }
  };

  return (
    <Layout>
      <SEO 
        title="Samples"
        description="Explore our portfolio of work including social media content samples, website designs, and more. See the quality of our work before you commit."
        canonical="/samples"
        keywords="portfolio samples, social media samples, website samples, digital marketing portfolio, web design examples, social media content examples"
      />
      
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Work Samples
            </h1>
            <p className="text-lg text-muted-foreground">
              See the quality of our work firsthand. Browse through our portfolio of 
              social media content and website designs to get a feel for what we can 
              create for your brand.
            </p>
          </div>
        </div>
      </section>

      {/* Samples Grid */}
      <section className="pb-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {sampleCategories.map((category, index) => (
              <div 
                key={category.id} 
                className="animate-fade-in-up opacity-0" 
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <ServiceCard
                  title={category.title}
                  description={category.description}
                  icon={category.icon}
                  onViewDetails={() => handleViewDetails(category)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      <SMMSamplesModal 
        open={isModalOpen("smm-samples")} 
        onOpenChange={createOnOpenChange("smm-samples")} 
      />
    </Layout>
  );
}
