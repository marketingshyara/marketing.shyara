import type { BrandTone } from "@/lib/brandColors";

export const homeSeo = {
  title: "Websites for Local Businesses | Shyara Marketing",
  description:
    "Shyara Marketing builds websites that help local Indian businesses get found on Google, trusted by new customers, and recommended in AI search.",
  keywords:
    "website development India, local business website, restaurant website, clinic website, gym website, SEO, local SEO, Shyara Marketing",
};

export const homeHero = {
  label: "Websites for local businesses",
  headlineLines: ["We create", "websites."],
  subline: "For local businesses across India, in any industry.",
  outcomes: [
    "Show up on Google and Maps",
    "Get calls and WhatsApp enquiries",
    "Customers trust you before they visit",
  ],
  primaryCta: "Talk on WhatsApp",
  secondaryCta: "See samples",
};

export const homeOutcomes = {
  label: "What you get",
  headline: "Four outcomes. One website.",
  items: [
    {
      id: "found",
      title: "Found",
      description: "Show up on Google and Maps.",
      tone: "sky" as BrandTone,
    },
    {
      id: "trusted",
      title: "Trusted",
      description: "Look real before the first visit.",
      tone: "emerald" as BrandTone,
    },
    {
      id: "recommended",
      title: "Recommended",
      description: "Cited when AI answers “near me”.",
      tone: "violet" as BrandTone,
    },
    {
      id: "contacted",
      title: "Contacted",
      description: "Calls and WhatsApp that convert.",
      tone: "coral" as BrandTone,
    },
  ],
};

export const homeDiscoverability = {
  label: "Get found",
  headline: "SEO → AEO → GEO",
  subline: "Every layer of search, built in.",
  steps: [
    {
      id: "seo",
      title: "SEO",
      subtitle: "Search engines",
      description: 'Rank for what people type: "gym near me", "best clinic Indore".',
      tone: "sky" as BrandTone,
    },
    {
      id: "aeo",
      title: "AEO",
      subtitle: "Voice and answers",
      description: "Structured facts for Siri and Google Assistant.",
      tone: "emerald" as BrandTone,
    },
    {
      id: "geo",
      title: "GEO",
      subtitle: "AI recommendations",
      description: "Accurate info when ChatGPT or Gemini suggests a local business.",
      tone: "violet" as BrandTone,
    },
  ],
};

export const homeProof = {
  label: "Built for you",
  headline: "Restaurants to garages.",
  verticals: [
    { name: "Restaurants", tone: "coral" as BrandTone },
    { name: "Clinics", tone: "sky" as BrandTone },
    { name: "Gyms", tone: "amber" as BrandTone },
    { name: "Coaching", tone: "violet" as BrandTone },
    { name: "Garages", tone: "teal" as BrandTone },
    { name: "Car wash", tone: "emerald" as BrandTone },
  ],
  cta: "All samples",
  samples: [
    {
      id: "restaurant-classic-website",
      name: "Restaurant",
      href: "/samples/websites/restaurant-classic-website/index.html",
      posterUrl: "/samples/websites/restaurant-classic-website/poster.jpg",
    },
    {
      id: "clinic-dental-waiting-room-classic",
      name: "Dental clinic",
      href: "/samples/websites/clinic-dental-waiting-room-classic/index.html",
      posterUrl: "/samples/websites/clinic-dental-waiting-room-classic/poster.jpg",
    },
    {
      id: "gym-ironforge-website",
      name: "Gym",
      href: "/samples/websites/gym-ironforge-website/index.html",
      posterUrl: "/samples/websites/gym-ironforge-website/poster.jpg",
    },
  ],
};

export const homeFinalCta = {
  headline: "Get your business online.",
  body: "One WhatsApp chat. We will tell you if a website makes sense.",
  primaryCta: "Start on WhatsApp",
  secondaryCta: "View samples",
};
