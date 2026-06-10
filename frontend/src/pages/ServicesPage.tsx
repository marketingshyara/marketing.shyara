import { Services } from "@/components/landing/Services";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { SEO } from "@/components/SEO";

export default function ServicesPage() {
  return (
    <>
      <SEO
        title="Our Services"
        description="Everything you need to grow online — custom website development, app development, ads campaign management, and social media management."
        canonical="/services"
        keywords="website development, app development, ads management, social media management, Shyara Marketing services"
      />
      <Services />
      <FinalCTA />
    </>
  );
}
