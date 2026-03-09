# GEO-SEO Audit Report: Shyara Marketing

**Domain:** shyaramarketing.com
**Business:** Shyara Tech Solutions (OPC) Pvt. Ltd.
**Audit Date:** 2026-03-10
**Auditor:** Source Code Analysis (React/Vite SPA)
**Report Version:** 1.0

---

## Executive Summary

Shyara Marketing's website is a well-designed, modern React SPA with clear value propositions and strong trustworthiness signals. However, it suffers from three systemic, interconnected problems that critically undermine its visibility to both traditional crawlers and the AI systems that now drive a growing share of discovery: (1) full client-side rendering with no server-side or static pre-rendering, (2) zero structured data in the static HTML shell, and (3) no brand presence on the knowledge-graph platforms (Wikipedia, Wikidata, LinkedIn company page) that AI citation engines rely on.

Without addressing the SSR/prerendering gap, all meta tags, content, and schema injected by React Helmet Async are invisible to GPTBot, ClaudeBot, PerplexityBot, and most other AI crawlers. The homepage has static meta in `index.html` but every other route returns a bare `<div id="root"></div>` to non-JS crawlers — meaning 17 out of 18 routes are essentially invisible to AI search.

The good news: pricing is transparent and well-structured, the site copy is clear and direct (not generic AI filler), legal pages are complete, and the service pages have real depth. These are strong foundations. The fixes are mostly technical and implementable within the existing Vite stack.

### Score Breakdown

| Category | Score | Weight | Weighted |
|---|---|---|---|
| AI Citability | 28/100 | 25% | 7.00 |
| Brand Authority | 12/100 | 20% | 2.40 |
| Content E-E-A-T | 42/100 | 20% | 8.40 |
| Technical GEO | 57/100 | 15% | 8.55 |
| Schema & Structured Data | 18/100 | 10% | 1.80 |
| Platform Optimization | 8/100 | 10% | 0.80 |
| **Composite GEO Score** | | | **28.95 / 100** |

**Overall Rating: CRITICAL — Immediate Action Required**

> Note on Schema score: `StructuredData.tsx` and `OrganizationSchema()` components exist in source code, but since they use `react-helmet-async` to inject `<script>` tags, they are only rendered after JavaScript executes. AI crawlers and many Googlebot passes do not execute JS, so these schemas score near-zero for effective structured data. The component infrastructure scores partial credit (18 vs 5) versus having no schema code at all.

---

## Critical Issues (Fix Immediately — Week 1)

### CRIT-01: No Server-Side Rendering — All Inner Pages Invisible to AI Crawlers

**Severity:** Critical
**Impact:** AI Citability, Technical GEO, Schema

The entire site is a React SPA served from `index.html` which contains only:
```html
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```

When GPTBot, ClaudeBot, PerplexityBot, or Googlebot (first crawl pass) fetch any URL other than `/`, they receive this empty shell. All content — including React Helmet meta tags, page titles, structured data, and body copy — is injected by JavaScript after hydration, which these crawlers never execute.

**Affected routes (all invisible to AI crawlers):**
- `/services` through `/services/app-development` (4 service pages)
- `/samples`, `/samples/social-media`, `/samples/websites`
- `/about`, `/contact`, `/offers`
- All 4 legal pages

**Recommended Fix — Static Pre-rendering with vite-plugin-ssg:**

The lowest-disruption fix for a Vite/React Router v6 stack is `vite-ssg` or `vite-plugin-ssr` in static mode. This pre-generates HTML for every route at build time.

```bash
npm install vite-ssg
```

In `vite.config.ts`:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  ssgOptions: {
    script: "async",
    formatting: "minify",
  },
});
```

Alternatively, configure the existing Vite build with `@prerenderer/plugin-vite` or use a CDN/hosting-level prerender service (Prerender.io, Rendertron) if a code-level solution is not feasible immediately.

**Interim fix (deploy today):** Add all known routes to the hosting platform's prerender configuration if using Vercel, Netlify, or Render — most support SSR/prerender middleware without code changes.

---

### CRIT-02: Sitemap Missing 7 High-Priority URLs + All Dates Stale

**Severity:** Critical
**Impact:** Technical GEO, AI Citability

The current `public/sitemap.xml` lists only 9 URLs and is missing 7 routes that exist in the application. All `lastmod` dates are `2025-01-02` — 14+ months stale as of audit date.

**Missing from sitemap:**
- `https://shyaramarketing.com/services/social-media`
- `https://shyaramarketing.com/services/ads-campaign-management`
- `https://shyaramarketing.com/services/website-development`
- `https://shyaramarketing.com/services/app-development`
- `https://shyaramarketing.com/samples`
- `https://shyaramarketing.com/samples/social-media`
- `https://shyaramarketing.com/samples/websites`

**Fix:** Update `public/sitemap.xml` immediately. Use today's date for all `lastmod` values and set appropriate priorities:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://shyaramarketing.com/</loc>
    <lastmod>2026-03-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://shyaramarketing.com/services</loc>
    <lastmod>2026-03-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://shyaramarketing.com/services/social-media</loc>
    <lastmod>2026-03-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://shyaramarketing.com/services/ads-campaign-management</loc>
    <lastmod>2026-03-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://shyaramarketing.com/services/website-development</loc>
    <lastmod>2026-03-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://shyaramarketing.com/services/app-development</loc>
    <lastmod>2026-03-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://shyaramarketing.com/samples</loc>
    <lastmod>2026-03-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://shyaramarketing.com/samples/social-media</loc>
    <lastmod>2026-03-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://shyaramarketing.com/samples/websites</loc>
    <lastmod>2026-03-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://shyaramarketing.com/offers</loc>
    <lastmod>2026-03-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://shyaramarketing.com/about</loc>
    <lastmod>2026-03-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://shyaramarketing.com/contact</loc>
    <lastmod>2026-03-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://shyaramarketing.com/privacy-policy</loc>
    <lastmod>2026-03-10</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://shyaramarketing.com/terms-of-service</loc>
    <lastmod>2026-03-10</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://shyaramarketing.com/refund-policy</loc>
    <lastmod>2026-03-10</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://shyaramarketing.com/service-delivery-policy</loc>
    <lastmod>2026-03-10</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
```

---

### CRIT-03: Schema Markup Exists in Code But Is Invisible to AI Crawlers

**Severity:** Critical
**Impact:** Schema & Structured Data, AI Citability

`src/components/StructuredData.tsx` contains well-formed Organization, LocalBusiness, Service, Offer, and WebPage schemas — but injects them via `react-helmet-async`, which means the JSON-LD is only present in the DOM after JavaScript hydrates the page. Non-JS crawlers (GPTBot, ClaudeBot, PerplexityBot, Bing AI) never see it.

Additionally, the `OrganizationSchema` component has `"sameAs": []` — an empty array — which misses the opportunity to assert identity relationships to known entities.

**Cascading issue:** Even the `index.html` static shell, which AI crawlers can read, contains zero JSON-LD. This means the homepage has no machine-readable structured data for AI crawlers under any condition.

**Fix Part 1 — Embed Organization + WebSite schema statically in `index.html`:**

Add directly inside `<head>` in `index.html` (not via React Helmet):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://shyaramarketing.com/#organization",
      "name": "Shyara Marketing",
      "legalName": "Shyara Tech Solutions (OPC) Pvt. Ltd.",
      "url": "https://shyaramarketing.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://shyaramarketing.com/favicon.png"
      },
      "description": "Digital marketing and technology services company helping Indian businesses grow through social media management, ad campaigns, website development, and app development.",
      "email": "marketing.shyara@gmail.com",
      "telephone": "+919584661610",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN"
      },
      "areaServed": "Worldwide",
      "foundingDate": "2019",
      "numberOfEmployees": {"@type": "QuantitativeValue", "value": "5"},
      "sameAs": [
        "https://wa.me/919584661610"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://shyaramarketing.com/#website",
      "url": "https://shyaramarketing.com",
      "name": "Shyara Marketing",
      "publisher": {"@id": "https://shyaramarketing.com/#organization"}
    }
  ]
}
</script>
```

**Fix Part 2:** After SSG/prerendering is implemented, ensure each service page emits its own `Service` schema with `name`, `description`, `provider`, `offers`, and `areaServed` fields in the pre-rendered HTML.

**Fix Part 3 — Fill `sameAs` in `StructuredData.tsx`:**

Update the `organizationSchema` object in `src/components/StructuredData.tsx` once social/directory profiles are created:
```ts
"sameAs": [
  "https://www.linkedin.com/company/shyara-marketing",
  "https://www.instagram.com/shyaramarketing",
  "https://g.page/shyara-marketing"
]
```

---

### CRIT-04: No llms.txt File — AI Crawlers Have No Guidance

**Severity:** Critical
**Impact:** AI Citability, Platform Optimization

The emerging `llms.txt` standard (proposed by Answer.AI, adopted by major AI crawlers) allows site owners to provide a plain-text summary of their site's purpose, key pages, and preferred citation language for AI systems. Shyara Marketing has no `llms.txt` or `llms-full.txt`.

**Fix:** Create `public/llms.txt` with the following content:

```
# Shyara Marketing

> Shyara Marketing (legal name: Shyara Tech Solutions OPC Pvt. Ltd.) is a digital marketing and technology services company based in India, serving clients globally.

We help businesses establish and grow their online presence through four core services:

## Services

- [Social Media Management](/services/social-media): Monthly plans starting at ₹7,999/month. Includes reels, image creatives, Google Business Profile optimization, and engagement management. Plans: Starter (₹7,999), Growth (₹14,999), Scale (₹20,000).
- [Ads Campaign Management](/services/ads-campaign-management): Performance advertising on Meta and Google. Transparent 20% management fee model with no hidden markups on ad budgets.
- [Website Development](/services/website-development): Static to custom web applications. Basic, E-commerce, and Custom tiers with clear timelines and fixed pricing.
- [App Development](/services/app-development): Mobile app development from MVP to full-scale product. Scoped before build to avoid surprises.

## Key Facts

- Founded: 2019 (5+ years experience)
- Projects delivered: 100+
- Clients served: 50+
- Location: India (serving clients globally)
- Contact: marketing.shyara@gmail.com | WhatsApp: +91 9584661610
- Business hours: Monday–Saturday, 9am–7pm IST

## Portfolio

- [Social Media Samples](/samples/social-media): Image creatives and reels produced for clients
- [Website Samples](/samples/websites): Live interactive previews of completed websites

## Optional

- [Privacy Policy](/privacy-policy)
- [Terms of Service](/terms-of-service)
- [Refund Policy](/refund-policy)
- [Service Delivery Policy](/service-delivery-policy)
```

---

## High Priority Issues (Fix Within 2 Weeks)

### HIGH-01: robots.txt Does Not Name AI Crawlers Explicitly

**Severity:** High
**Impact:** AI Citability, Technical GEO

The current `robots.txt` uses wildcard `*` which allows all crawlers by default, but does not explicitly name the major AI indexing bots. While this doesn't block them, explicit Allow rules signal that the site owner is aware of and welcoming to AI crawlers — a positive signal for crawl frequency. More critically, some secondary AI crawlers (CCBot for Common Crawl, which feeds many LLM training sets) are missing.

**Current state:** GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Amazonbot, CCBot, Applebot-Extended, Bytespider — none named.

**Fix:** Update `public/robots.txt`:

```
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: CCBot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /

Sitemap: https://shyaramarketing.com/sitemap.xml
```

---

### HIGH-02: No FAQ / Q&A Content — Low AI Snippet Potential

**Severity:** High
**Impact:** AI Citability, Content E-E-A-T

FAQ sections were removed from service pages during a recent refactor. FAQs are the single highest-ROI content format for AI citability — AI search engines (Perplexity, ChatGPT, Gemini) extract direct Q&A pairs from page content to answer user queries. Without FAQ blocks, the site loses the most reliable path to AI citation.

The Contact page does have 3 pre-contact FAQ cards (rendered as `<h3>` inside `<div>` elements), but these are not marked up as `FAQPage` schema and are not structured to answer the types of questions AI engines receive.

**Recommended FAQ content per page (examples):**

For `/services/social-media`:
- "How much does social media management cost in India?" → Starter ₹7,999, Growth ₹14,999, Scale ₹20,000/month
- "How many reels are included in a social media package?" → 4 (Starter), 8 (Growth), 12 (Scale) per month
- "What is included in social media management?" → Reels, creatives, Google Business Profile, engagement management

For `/services/ads-campaign-management`:
- "How does Shyara Marketing charge for ads management?" → 20% of ad spend as management fee, no hidden markups
- "What advertising platforms do you manage?" → Meta (Facebook/Instagram) and Google Ads

For `/services/website-development`:
- "How long does website development take?" → Varies by tier; Basic typically 2–3 weeks
- "What is the cost of a basic website in India?" → Ranges by scope; contact for exact pricing

**Fix:** Re-add FAQ sections to each service page and the About page. Mark each FAQ block with `FAQPage` JSON-LD schema (which, once SSG is implemented, will be crawler-visible):

```tsx
// In each service page, add FAQPage schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does social media management cost in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Shyara Marketing offers three social media management plans: Starter at ₹7,999/month (4 reels, 8 creatives), Growth at ₹14,999/month (8 reels, 12 creatives, ad support), and Scale at ₹20,000/month (12 reels, 16 creatives, AI insights)."
      }
    }
  ]
};
```

---

### HIGH-03: BreadcrumbList Schema Missing on All Service/Subpages

**Severity:** High
**Impact:** Schema & Structured Data, Technical GEO

All service pages (`/services/social-media`, etc.) and sample pages render a visual breadcrumb trail in JSX — for example, in `SocialMediaService.tsx` line 100–103:

```tsx
<nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
  <Link to="/services">Services</Link>
  <ArrowRight className="h-3 w-3" />
  <span>Social Media Management</span>
</nav>
```

This visual breadcrumb is never accompanied by `BreadcrumbList` JSON-LD schema. Once SSG is in place, Google and AI crawlers use BreadcrumbList to understand site hierarchy and generate sitelinks.

**Fix:** Add to each service page's `<Helmet>` (via `StructuredData` or inline):

```ts
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://shyaramarketing.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Services",
      "item": "https://shyaramarketing.com/services"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Social Media Management",
      "item": "https://shyaramarketing.com/services/social-media"
    }
  ]
};
```

---

### HIGH-04: Service Schema Not Being Emitted on Service Pages

**Severity:** High
**Impact:** Schema & Structured Data, AI Citability

`StructuredData.tsx` defines a `Service` type and accepts arbitrary `data` props — but none of the service pages (`SocialMediaService.tsx`, `AdsCampaignService.tsx`, `WebsiteDevelopmentService.tsx`, `AppDevelopmentService.tsx`) actually call `<StructuredData type="service" ... />`. The component exists but is never used on service pages.

**Fix:** Import and use `StructuredData` in each service page. Example for `SocialMediaService.tsx`:

```tsx
import { StructuredData } from "@/components/StructuredData";

// Inside the component return:
<StructuredData
  type="service"
  data={{
    name: "Social Media Management",
    description: "Monthly social media management plans including reels, image creatives, Google Business Profile optimization, and engagement management for businesses in India.",
    url: "https://shyaramarketing.com/services/social-media",
    areaServed: "IN",
    offers: [
      {
        "@type": "Offer",
        "name": "Starter Plan",
        "price": "7999",
        "priceCurrency": "INR",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "7999",
          "priceCurrency": "INR",
          "unitText": "MONTH"
        }
      },
      {
        "@type": "Offer",
        "name": "Growth Plan",
        "price": "14999",
        "priceCurrency": "INR",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "14999",
          "priceCurrency": "INR",
          "unitText": "MONTH"
        }
      },
      {
        "@type": "Offer",
        "name": "Scale Plan",
        "price": "20000",
        "priceCurrency": "INR",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "20000",
          "priceCurrency": "INR",
          "unitText": "MONTH"
        }
      }
    ]
  }}
/>
```

---

### HIGH-05: No Google Business Profile Linked or Verified

**Severity:** High
**Impact:** Brand Authority, Platform Optimization, Local Trust

There is no Google Business Profile URL referenced anywhere in the site code, schema, or `sameAs` arrays. A verified GBP is one of the strongest local authority signals and is directly crawled by Google's AI systems for Gemini responses about local businesses.

**Action required (off-site):**
1. Claim and verify Google Business Profile for Shyara Tech Solutions (OPC) Pvt. Ltd.
2. Add the GBP URL to `organizationSchema.sameAs` in `StructuredData.tsx`
3. Add the GBP URL to the footer or contact page as a visible link
4. The `/services/social-media` page already mentions "Google Business Profile optimization" as a service feature — having a verified GBP strengthens this credibility claim

---

### HIGH-06: LocalBusiness Schema Missing Physical Coordinates + Phone

**Severity:** High
**Impact:** Schema & Structured Data, Local Trust

The `localBusinessSchema` in `StructuredData.tsx` includes `geo` coordinates (`22.7196, 75.8577` — Indore, MP) but is missing:
- `telephone` field
- `openingHoursSpecification`
- `priceRange` is set to `"₹₹"` but not tied to specific services

The Contact page clearly states business hours (Mon–Sat, 9am–7pm IST) and the WhatsApp number (+91 9584661610) — these should be mirrored in schema.

**Fix:** Update `localBusinessSchema` in `src/components/StructuredData.tsx`:

```ts
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Shyara Marketing",
  "legalName": "Shyara Tech Solutions (OPC) Pvt. Ltd.",
  "description": "Digital marketing and technology services: social media management, ads campaigns, website development, and app development.",
  "url": "https://shyaramarketing.com",
  "email": "marketing.shyara@gmail.com",
  "telephone": "+919584661610",
  "priceRange": "₹₹",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "22.7196",
    "longitude": "75.8577"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      "opens": "09:00",
      "closes": "19:00"
    }
  ],
  "areaServed": {
    "@type": "Country",
    "name": "India"
  }
};
```

---

## Medium Priority Issues (Fix Within 30 Days)

### MED-01: Zero Brand Presence on AI Knowledge Graphs

**Severity:** Medium-High
**Impact:** Brand Authority (currently 12/100)

AI citation engines (ChatGPT, Perplexity, Gemini) preferentially cite entities they can confirm exist in knowledge graphs. Shyara Marketing has no Wikipedia article, no Wikidata entity, no LinkedIn company page (linked on site), no Crunchbase listing, and no industry directory presence.

**Actions (prioritized by impact):**
1. Create LinkedIn Company Page → add to `sameAs` in schema
2. List on Indian business directories: IndiaMART, Justdial, Sulekha (marketing category)
3. Submit to Clutch.co (B2B agency directory — high DA, AI-cited frequently)
4. Create Crunchbase listing
5. Request Wikidata entity (requires notability — build other profiles first)

**Note:** A Gmail address (`marketing.shyara@gmail.com`) vs. a custom domain email (`hello@shyaramarketing.com`) reduces perceived authority. Consider adding a custom email for brand consistency, even if it forwards to Gmail.

---

### MED-02: No E-E-A-T Signals — No Named Team, No Author Attribution

**Severity:** Medium-High
**Impact:** Content E-E-A-T (currently 42/100)

The site claims "5+ Years of Experience" but names no individuals, shows no team photos, and has zero author attribution on any content. AI systems evaluating expertise look for identifiable humans with verifiable credentials.

**Recommended additions:**
1. Add a team section to the About page with at minimum the founder's name, role, and a brief professional bio (does not need to be exhaustive)
2. Link any team member LinkedIn profiles
3. Consider adding 1–2 named client testimonials (with permission) and business name

**Impact:** Moving from "implied expertise" to "verified expertise" is the single fastest E-E-A-T improvement after schema and SSG.

---

### MED-03: No Blog or Educational Content — Zero Topical Authority

**Severity:** Medium
**Impact:** Content E-E-A-T, AI Citability, Brand Authority

The site has zero blog posts, guides, or educational content. Topical authority — demonstrated knowledge through published content — is a major factor in AI citation probability. When a user asks ChatGPT "how should I manage social media for my restaurant in India?", the AI cites sources with demonstrated expertise in that exact topic. Shyara Marketing currently cannot be cited for any query beyond direct brand searches.

**Minimum viable content plan (start with 3 posts):**
1. "Social Media Management for Local Businesses in India: What to Expect and What to Pay" — targets high-intent "social media management cost India" queries
2. "How Facebook and Instagram Ads Work in India: The 20% Fee Model Explained" — builds transparency narrative
3. "Basic vs E-commerce vs Custom Website: Which Does Your Business Need?" — targets decision-stage queries

Each post should be 1,000–1,500 words, include clear headings, and contain specific data points (prices, timelines, deliverable counts) that AI systems can extract and cite.

**Route to add:** `/blog` and `/blog/[slug]` pages using React Router dynamic routes.

---

### MED-04: OpenGraph Image May Not Exist or Be Optimized

**Severity:** Medium
**Impact:** Platform Optimization, Brand Authority

The `index.html` references `/og-image.png` and the file exists in `public/` (confirmed in directory scan). However, no verification of its dimensions (should be 1200×630px), content quality, or whether it matches current branding was possible from source analysis alone.

**Action:** Verify `public/og-image.png` is:
- Exactly 1200×630 pixels (or 1200×628)
- Contains the Shyara Marketing logo, brand name, and a 1-line value proposition
- Uses brand colors (teal accent on dark background for contrast)
- Is under 8MB (ideally under 1MB for fast sharing previews)

When multiple pages have unique OG images (e.g., the Social Media service page has an image featuring social media icons), this increases click-through rates from shared links significantly.

---

### MED-05: Canonical Tag Missing from `index.html` Static Shell

**Severity:** Medium
**Impact:** Technical GEO, Indexability

The `index.html` canonical `<link>` points to `https://shyaramarketing.com` (without trailing slash). This is fine for the homepage. However, since this same `index.html` is served for ALL routes in a standard SPA deployment, any crawler that reads the static HTML for `/services/social-media` will see a canonical pointing to the homepage — creating canonical confusion for non-JS crawlers.

**Fix:** This is resolved by SSG (CRIT-01), which generates unique HTML files per route. However, as an interim measure, remove the canonical from `index.html` entirely and rely only on the React Helmet canonicals set per page — at minimum preventing incorrect canonicalization of inner pages to the homepage.

---

### MED-06: Google Fonts CDN Dependency — Render-Blocking Risk

**Severity:** Medium
**Impact:** Technical GEO (Core Web Vitals), Page Speed

Plus Jakarta Sans is loaded from Google Fonts CDN. This creates a render-blocking external DNS lookup on every page load. While Vite handles JS bundling efficiently, the font request is in the critical path.

**Fix:** Self-host Plus Jakarta Sans using `@fontsource/plus-jakarta-sans`:
```bash
npm install @fontsource/plus-jakarta-sans
```
Then import in `src/main.tsx`:
```ts
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
```
Remove the Google Fonts `<link>` from `index.html`. This eliminates the external DNS lookup and removes a render-blocking resource.

---

## Low Priority Issues (Fix Within 60 Days)

### LOW-01: Twitter/X Card Missing `twitter:site` and `twitter:creator`

**Severity:** Low
**Impact:** Platform Optimization

`src/components/SEO.tsx` emits Twitter Card meta tags but omits `twitter:site` (the account's @handle) and `twitter:creator`. Without these, Twitter/X cannot attribute shared links to a verified account.

**Fix:** Add to `SEO.tsx` if a Twitter/X account exists:
```tsx
<meta name="twitter:site" content="@shyaramarketing" />
<meta name="twitter:creator" content="@shyaramarketing" />
```

---

### LOW-02: `<meta name="author">` Is Generic

**Severity:** Low
**Impact:** Content E-E-A-T

All pages set `<meta name="author" content="Shyara Marketing" />`. For service pages and any future blog posts, this should reference the specific team member who authored or is responsible for the content.

---

### LOW-03: No Testimonials or Reviews on Site

**Severity:** Low-Medium
**Impact:** Content E-E-A-T (Trustworthiness)

The site claims "50+ Happy Clients" but shows zero testimonials, reviews, or case studies. AI systems evaluating trustworthiness look for social proof. Adding even 3–5 short testimonials with client name and business type would strengthen the trust signals significantly.

**Schema addition:** Mark testimonials with `Review` schema once added.

---

### LOW-04: Legal Pages Not Excluded from AI Crawler Indexing

**Severity:** Low
**Impact:** AI Citability (noise reduction)

Legal pages (`/privacy-policy`, `/terms-of-service`, `/refund-policy`, `/service-delivery-policy`) use `noIndex = false` (index, follow) by default. While having these indexed doesn't harm SEO directly, they contribute noise to the site's content profile for AI engines. Consider adding `noIndex: true` to `SEO` on legal pages to concentrate crawl equity on commercial pages.

**Check in source:** Each legal page's `<SEO>` component call — if `noIndex` prop is not passed, it defaults to `false` (indexed). Recommend passing `noIndex={true}` to all legal pages.

---

### LOW-05: No `<meta name="geo.region">` Tags

**Severity:** Low
**Impact:** Local GEO Signals

Geographic meta tags (`geo.region`, `geo.placename`, `geo.position`) are not standard HTML spec but are recognized by some search engines for local relevance signals. Add to `index.html`:

```html
<meta name="geo.region" content="IN" />
<meta name="geo.placename" content="India" />
```

---

## Category Deep Dives

### Category 1: AI Citability — 28/100

**What AI citability measures:** The probability that an AI search engine (Perplexity, ChatGPT, Gemini, Claude) will cite this site when answering queries related to digital marketing services in India.

**Current state analysis:**

The homepage (`index.html`) is the only page with static HTML that AI crawlers can read. Its meta description is strong: "Shyara Marketing helps businesses grow through social media management, advertising campaigns, website development, and app development with clarity, consistency, and measurable results." This is clear, entity-rich, and factual — but it only exists for the homepage.

All 17 other pages return `<div id="root"></div>`. For AI crawlers, these pages do not exist.

The pricing data on `/services/social-media` (₹7,999 / ₹14,999 / ₹20,000 per month with specific deliverable counts) is exactly the type of specific, structured information that AI systems extract and cite. If a user asks Perplexity "what does social media management cost in India?", this pricing table would be highly citable — except AI crawlers cannot see it because it's JS-rendered.

The Contact page's three pre-contact FAQ cards are also naturally Q&A formatted and would be extracted by AI engines — but again, invisible due to SPA rendering.

**Scoring breakdown:**
- Content directness and clarity: 12/25 (strong copy, but only homepage visible)
- FAQ/Q&A structure: 0/25 (no FAQ schema; contact FAQs exist but invisible to crawlers)
- Specific facts and data: 10/25 (excellent pricing data — when visible)
- Citation-ready answer blocks: 6/25 (some structured content visible on homepage)

**Path to 70+:** SSG + FAQ blocks + llms.txt. These three changes alone would push AI Citability to approximately 65–72.

---

### Category 2: Brand Authority — 12/100

**What brand authority measures:** Recognition of the brand as a real, legitimate entity by AI knowledge systems. AI models learn entity relationships from Wikipedia, Wikidata, LinkedIn, Crunchbase, press mentions, and high-DA directory listings.

**Current state analysis:**

Shyara Marketing has essentially no presence in the knowledge-graph ecosystem. The site exists, but from an AI model's training data perspective, there is little corroborating evidence that "Shyara Marketing" or "Shyara Tech Solutions OPC Pvt. Ltd." is a real, operating company.

The legal company name is present on the site (good), the company appears to be registered (OPC Pvt. Ltd. structure is specific), and the business has been operating for 5+ years. These are real authority signals — they just haven't been asserted in any format that AI training pipelines consume.

The Gmail email (`marketing.shyara@gmail.com`) versus a custom domain email is a minor negative signal. It doesn't hurt SEO rankings but signals to humans and AI alike that the brand may be less established than it is.

**Scoring breakdown:**
- Wikipedia/Wikidata entity: 0/30 (none)
- LinkedIn company presence: 0/20 (not linked/verified)
- Industry directory listings: 5/20 (likely exists somewhere but not linked from site)
- Press mentions / external citations: 0/15 (none found)
- Social platform verification: 7/15 (Instagram assumed to exist; not linked in schema)

**Path to 50+:** Create LinkedIn Company Page (free, immediate), list on Clutch.co (free for agencies), submit to IndiaMART and Justdial. These 3–4 actions would push Brand Authority to approximately 40–50 within 30 days.

---

### Category 3: Content E-E-A-T — 42/100

**Breakdown by E-E-A-T pillar:**

**Experience (8/25):**
The site claims "100+ Projects Delivered" and "50+ Happy Clients" but provides no case studies, no before/after comparisons, no specific client results, and no named examples. The portfolio pages show samples (website previews, social media content) which is genuine experience evidence, but these are framed as "what we can make" rather than "results we achieved for real clients." The Google Drive integration for social media samples is a positive differentiator — actual deliverables are more credible than stock mockups.

**Expertise (5/25):**
No team page. No founder bio. No author attribution on any content. No certifications or credentials displayed. No blog or educational content demonstrating domain knowledge. The service pages explain *what* is included in each service clearly, but offer no demonstration of *why* the team is qualified to deliver it. The 20% fee model explanation for ads is a good expertise signal — it shows knowledge of the ads industry's common problems (hidden markups).

**Authoritativeness (7/25):**
No external validation of any kind. No press coverage, no industry awards, no speaking engagements, no notable clients. The legal company registration (OPC Pvt. Ltd.) is the strongest external authority signal. Having service delivery, refund, and terms policies published is better than most small agencies.

**Trustworthiness (22/25):**
This is the site's strongest E-E-A-T dimension. Legal company name disclosed. Four legal policy pages published. Email and WhatsApp contact both accessible. Business hours stated clearly. HTTPS (assumed). Pricing is transparent and specific. The pre-contact FAQ section on the Contact page ("I've worked with agencies before and been disappointed") demonstrates honest, trust-building communication. Minus 3 points: no verified reviews, gmail email, no physical address detail.

---

### Category 4: Technical GEO — 57/100

**Crawlability (10/15):**
`robots.txt` is present and uses appropriate directives. The wildcard `Allow: /` means no pages are blocked. However, major AI crawlers are not named explicitly, which is a minor gap. The sitemap URL is correctly referenced. Score deducted for stale sitemap and missing URLs.

**Indexability (6/12):**
Canonical tags are set per page via React Helmet (good practice). However, since these are JS-injected, AI crawlers see only the homepage canonical. SPA routing means direct URL access to inner pages (`/services/social-media`) will 404 or redirect to homepage depending on hosting configuration unless the server is configured to serve `index.html` for all routes (standard SPA setup). Need to verify hosting configuration handles this correctly.

**Security (7/10):**
HTTPS is assumed based on domain and modern hosting. No security headers (Content-Security-Policy, HSTS, X-Frame-Options) were verifiable from source code alone — these are server/CDN configuration items. Score reflects typical Vite SPA deployment without explicit hardening.

**URL Structure (6/8):**
URLs are clean, logical, and hierarchical: `/services/social-media`, `/samples/websites`. No query parameters in canonical URLs. One minor issue: the About page could benefit from a more keyword-rich URL slug if ever restructured (though `/about` is standard and fine).

**Mobile (9/10):**
shadcn/ui with Radix UI primitives are built mobile-first. The Header has explicit hamburger menu behavior for mobile. `<meta name="viewport" content="width=device-width, initial-scale=1.0">` is correctly set. Score deducted for potential tap target issues on icon-only buttons (ThemeToggle) — not verifiable from source but common with icon buttons.

**Core Web Vitals (9/15):**
Vite's code splitting and tree-shaking should produce good LCP and FID scores. However, Google Fonts CDN creates a render-blocking request that can delay LCP. The site uses several Lucide icon imports — if not tree-shaken properly, this could inflate bundle size. No image lazy loading was observed in the JSX for hero sections (the floating stat cards are pure CSS/JSX, not images). Score estimates based on typical Vite SPA performance without CDN data.

**SSR (2/15):**
The homepage has static meta tags in `index.html` which earns 2 points. All inner pages are pure client-side rendered. This is the largest single technical deficiency.

**Page Speed (8/15):**
Vite optimizes JS bundle size well. No large media files in the main app (samples are loaded on demand via Google Drive or in `public/samples/`). Google Fonts dependency is the main speed risk. No CDN configuration was verifiable from source.

---

### Category 5: Schema & Structured Data — 18/100

**What exists:**
- `StructuredData.tsx` with Organization, LocalBusiness, Service, Offer, and WebPage schemas — well-formed but JS-injected
- `OrganizationSchema` component combining Organization + LocalBusiness — also JS-injected
- Neither component is confirmed to be rendered in `index.html` or any pre-rendered HTML

**What is missing:**
- Static JSON-LD in `index.html` (zero)
- FAQPage schema (zero)
- BreadcrumbList schema on service pages (zero)
- ProfessionalService or MarketingAgency type (more specific than base Organization)
- SiteLinksSearchBox schema
- ItemList schema for the samples/portfolio pages
- Service schema actually called from service pages (components exist, not used)

**Scoring:**
- Organization schema (exists but JS-only): 4/20
- LocalBusiness schema (exists but JS-only, missing phone/hours): 4/20
- Service schema (defined but not used on service pages): 2/20
- BreadcrumbList (not implemented): 0/20
- FAQPage (not implemented): 0/20
- WebSite schema (defined but JS-only): 4/10
- Other schemas (Offer, WebPage defined): 4/10

**Path to 70+:** Implement SSG (CRIT-01), add static JSON-LD to `index.html` (CRIT-03), add FAQPage schemas (HIGH-02), add BreadcrumbList (HIGH-03), call Service schema from service pages (HIGH-04).

---

### Category 6: Platform Optimization — 8/100

**AI search platforms (Perplexity, ChatGPT, Gemini):**
No verified presence. Not citable due to SSR gap. No llms.txt.

**Google:**
No confirmed Google Business Profile. No Google Search Console verified (cannot confirm from source). Google Ads account likely exists (service offered to clients) but this is irrelevant to organic/GEO.

**LinkedIn:**
No LinkedIn Company Page linked from site or referenced in schema. Individual profiles not linked.

**YouTube:**
No YouTube channel. Video content (reels) is produced for clients but not published on an owned YouTube channel for the agency itself.

**Reddit:**
No detected Reddit presence. Indian digital marketing subreddits (r/IndiaMarketing, r/digitalmoney) are potential GEO platforms.

**Instagram:**
Almost certainly has a presence (social media is the primary service offered) but not linked from the website or referenced in schema `sameAs`.

**Path to 40+:** Create Google Business Profile, add social links to site footer and schema `sameAs`, begin LinkedIn company page, verify with Google Search Console.

---

## Quick Wins (Implement This Week)

These 8 items can be completed with minimal development effort and immediate impact:

1. **Update `public/sitemap.xml`** — Add 7 missing URLs, update all `lastmod` dates to today. Zero code changes, 10-minute task. (CRIT-02)

2. **Update `public/robots.txt`** — Add explicit `Allow` rules for GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, Amazonbot. Zero code changes, 5-minute task. (HIGH-01)

3. **Create `public/llms.txt`** — Plain text file with site summary, key pages, pricing facts, and contact info. Zero code changes, 20-minute task. (CRIT-04)

4. **Add static JSON-LD to `index.html`** — Embed Organization + WebSite schema directly in `<head>` before the closing tag. Makes homepage schema visible to all crawlers immediately. 15-minute task. (CRIT-03)

5. **Add `telephone` and `openingHoursSpecification` to `localBusinessSchema`** in `src/components/StructuredData.tsx` — existing schema component just needs data fields added. 10-minute code change. (HIGH-06)

6. **Call `<StructuredData type="service" />` from each service page** — The component is already built. Just import and use it with appropriate data in each of the 4 service pages. 30-minute task across all 4 files. (HIGH-04)

7. **Pass `noIndex={true}` to `<SEO>` on all 4 legal pages** — Concentrate crawl equity on commercial pages. 5-minute change across 4 files. (LOW-04)

8. **Create a LinkedIn Company Page** — Free, off-site, immediate brand authority signal. Once created, add the URL to `organizationSchema.sameAs` in `StructuredData.tsx`. (MED-01)

---

## 30-Day Action Plan

### Week 1 — Foundation (No-Code and Low-Code Fixes)

- [ ] Update `public/sitemap.xml` with all 16 URLs and current dates (CRIT-02)
- [ ] Update `public/robots.txt` with explicit AI crawler rules (HIGH-01)
- [ ] Create `public/llms.txt` with business summary and key facts (CRIT-04)
- [ ] Add static Organization + WebSite JSON-LD to `index.html` `<head>` (CRIT-03)
- [ ] Update `localBusinessSchema` in `StructuredData.tsx` with phone, hours, area served (HIGH-06)
- [ ] Call `<StructuredData type="service" />` in all 4 service pages with pricing data (HIGH-04)
- [ ] Set `noIndex={true}` on all legal pages (LOW-04)
- [ ] Create LinkedIn Company Page for Shyara Marketing
- [ ] Submit to Google Search Console (if not already done) and request sitemap re-crawl

### Week 2 — Schema Completion and SSG Research

- [ ] Add `BreadcrumbList` JSON-LD to all service pages and sample pages (HIGH-03)
- [ ] Add FAQ sections to `/services/social-media` and `/services/website-development` with 3–5 Q&A pairs each
- [ ] Add `FAQPage` schema to pages with FAQ sections (HIGH-02)
- [ ] Research and select SSG/prerender solution: evaluate `vite-ssg`, Vercel prerender, or Prerender.io (CRIT-01)
- [ ] Verify `public/og-image.png` dimensions and content quality (MED-04)
- [ ] Claim Google Business Profile for Shyara Tech Solutions (OPC) Pvt. Ltd. (HIGH-05)
- [ ] Self-host Plus Jakarta Sans via `@fontsource/plus-jakarta-sans` (MED-06)

### Week 3 — SSG Implementation + Content

- [ ] Implement chosen SSG/prerender solution and verify inner pages serve full HTML to non-JS clients
- [ ] Test pre-rendered output by fetching URLs with `curl` (no JavaScript) and verifying content visibility
- [ ] Add FAQ sections to remaining service pages (`/ads-campaign-management`, `/app-development`)
- [ ] Begin writing first blog post: "Social Media Management for Local Businesses in India: What to Expect and What to Pay" (MED-03)
- [ ] Add Google Business Profile URL to `organizationSchema.sameAs` and site footer
- [ ] Submit to Clutch.co agency directory (MED-01)

### Week 4 — Authority Building + Review

- [ ] Publish first blog post with full SEO meta, canonical, and appropriate schema
- [ ] Add team section to About page with at minimum founder name and brief bio (MED-02)
- [ ] Add 3–5 client testimonials to homepage or dedicated section (LOW-03)
- [ ] List on IndiaMART and Justdial in the digital marketing / web development categories (MED-01)
- [ ] Run full GEO audit re-check: test all routes with JavaScript-disabled browser, validate schema with Google Rich Results Test, check AI crawler response with Bing Webmaster Tools
- [ ] Update `organizationSchema.sameAs` with all newly created platform URLs
- [ ] Re-submit sitemap to Google Search Console and Bing Webmaster Tools

---

## Appendix: Pages Analyzed

| Route | File | JS-Rendered? | Static Meta? | Schema? | Sitemap? |
|---|---|---|---|---|---|
| `/` | `src/pages/Home.tsx` | Partial (React Helmet) | YES (`index.html`) | NO (static) | YES |
| `/services` | `src/pages/Services.tsx` | Yes | NO | NO | YES |
| `/services/social-media` | `src/pages/services/SocialMediaService.tsx` | Yes | NO | NO | NO |
| `/services/ads-campaign-management` | `src/pages/services/AdsCampaignService.tsx` | Yes | NO | NO | NO |
| `/services/website-development` | `src/pages/services/WebsiteDevelopmentService.tsx` | Yes | NO | NO | NO |
| `/services/app-development` | `src/pages/services/AppDevelopmentService.tsx` | Yes | NO | NO | NO |
| `/samples` | `src/pages/Samples.tsx` | Yes | NO | NO | NO |
| `/samples/social-media` | `src/pages/SocialMediaSamplesPage.tsx` | Yes | NO | NO | NO |
| `/samples/websites` | `src/pages/WebsiteSamplesPage.tsx` | Yes | NO | NO | NO |
| `/offers` | `src/pages/Offers.tsx` | Yes | NO | NO | YES |
| `/about` | `src/pages/About.tsx` | Yes | NO | NO | YES |
| `/contact` | `src/pages/Contact.tsx` | Yes | NO | NO | YES |
| `/privacy-policy` | `src/pages/legal/PrivacyPolicy.tsx` | Yes | NO | NO | YES |
| `/terms-of-service` | `src/pages/legal/TermsOfService.tsx` | Yes | NO | NO | YES |
| `/refund-policy` | `src/pages/legal/RefundPolicy.tsx` | Yes | NO | NO | YES |
| `/service-delivery-policy` | `src/pages/legal/ServiceDeliveryPolicy.tsx` | Yes | NO | NO | YES |

**Legend:**
- "JS-Rendered?" — content requires JavaScript execution to be visible to crawlers
- "Static Meta?" — meta tags present in raw HTML (no JS required)
- "Schema?" — JSON-LD present in raw HTML
- "Sitemap?" — URL listed in `public/sitemap.xml`

### Key Files Referenced in This Report

| File | Purpose |
|---|---|
| `index.html` | Static app shell — only crawler-visible HTML |
| `public/robots.txt` | Crawler access rules |
| `public/sitemap.xml` | URL index for search engines |
| `src/components/SEO.tsx` | React Helmet wrapper for per-page meta tags |
| `src/components/StructuredData.tsx` | JSON-LD schema components (Organization, LocalBusiness, Service, Offer, WebPage) |
| `src/App.tsx` | Route definitions — all 18 application routes |
| `src/pages/services/SocialMediaService.tsx` | Best example of content depth + transparent pricing |
| `src/pages/Contact.tsx` | Contains business hours, WhatsApp, email, pre-contact FAQs |

---

*Report generated by source code analysis. Scores are estimates based on code inspection, architecture assessment, and published GEO/SEO scoring rubrics. Actual crawler behavior may vary by hosting configuration. Re-audit recommended after Week 4 actions are complete.*
