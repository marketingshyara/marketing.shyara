import { IntroLoader } from "@/components/landing/IntroLoader";
import { Hero } from "@/components/landing/Hero";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { Process } from "@/components/landing/Process";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { SEO } from "@/components/SEO";

export default function Home() {
  return (
    <>
      <SEO
        title="We Build Websites That Work"
        description="Fast, conversion-focused websites backed by ads and social media. Shyara Marketing builds digital solutions for businesses across India."
        canonical="/"
        keywords="website development, web design India, local SEO, digital marketing, Shyara Marketing"
      />
      <IntroLoader />
      <Hero />
      <SocialProofBar />
      <Process />
      <FinalCTA />
    </>
  );
}
