import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";
import { SmoothScrollProvider } from "@/components/marketing/motion/SmoothScrollProvider";
import { useHomeScroll } from "@/components/marketing/motion/useHomeScroll";
import { HomeHero } from "@/components/marketing/home/HomeHero";
import { HomeOutcomes } from "@/components/marketing/home/HomeOutcomes";
import { HomeDiscoverability } from "@/components/marketing/home/HomeDiscoverability";
import { HomeProof } from "@/components/marketing/home/HomeProof";
import { HomeFinalCta } from "@/components/marketing/home/HomeFinalCta";
import { homeSeo } from "@/content/home";

export default function Home() {
  const homeRef = useHomeScroll();

  return (
    <Layout>
      <SEO
        title={homeSeo.title}
        description={homeSeo.description}
        keywords={homeSeo.keywords}
        canonical="https://marketing.shyara.co.in/"
      />
      <StructuredData
        type="webpage"
        data={{
          name: homeSeo.title,
          description: homeSeo.description,
          url: "https://marketing.shyara.co.in/",
        }}
      />
      <StructuredData
        type="service"
        data={{
          name: "Website Development for Local Businesses",
          description:
            "Mobile-first websites for Indian local businesses, built to get found on Google and Maps, trusted by new customers, and recommended in AI search.",
          serviceType: "Website Development",
          areaServed: { "@type": "Country", name: "India" },
        }}
      />

      <SmoothScrollProvider>
        <div ref={homeRef}>
          <HomeHero />
          <HomeOutcomes />
          <HomeDiscoverability />
          <HomeProof />
          <HomeFinalCta />
        </div>
      </SmoothScrollProvider>
    </Layout>
  );
}
