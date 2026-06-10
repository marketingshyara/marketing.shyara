import { FinalCTA } from "@/components/landing/FinalCTA";
import { PortfolioHeader } from "@/components/landing/PortfolioHeader";
import { WorkSamplesGrid } from "@/components/landing/WorkSamplesGrid";
import { SEO } from "@/components/SEO";
import { useSearchParams } from "react-router-dom";

export default function WorkPage() {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("category");
  const seoCanonical = activeCategory ? `/work?category=${activeCategory}` : "/work";

  return (
    <>
      <SEO
        title="Our Work — Website Portfolio"
        description="Don't just take our word for it. See real websites designed for real businesses — restaurants, clinics, gyms, and more."
        canonical={seoCanonical}
        keywords="website portfolio, website samples, web design examples, live website previews, business website examples"
      />
      <section
        id="portfolio"
        data-testid="portfolio-section"
        className="scroll-mt-24 border-y-2 border-[#0A0A0A] bg-[#F0EEE9] pt-28 pb-24 md:pb-32"
      >
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <PortfolioHeader />
          <WorkSamplesGrid />
        </div>
      </section>
      <FinalCTA />
    </>
  );
}
