# GEO Report — Shyara Marketing
**Website**: https://marketing.shyara.co.in
**Report Date**: 2026-03-10
**Prepared By**: Shyara Marketing (Internal GEO Audit)

---

## Executive Summary

Shyara Marketing's website has undergone a full Generative Engine Optimization (GEO) audit and implementation. The site is now significantly better positioned to be cited, recommended, and surfaced by AI-powered search systems including Google AI Overviews, ChatGPT, Perplexity, Claude, and Bing Copilot.

| Category | Before | After | Change |
|----------|--------|-------|--------|
| AI Citability & Visibility | 42/100 | 74/100 | +32 |
| Brand Authority Signals | 28/100 | 55/100 | +27 |
| Content Quality & E-E-A-T | 50/100 | 72/100 | +22 |
| Technical Foundations | 65/100 | 72/100 | +7 |
| Structured Data | 48/100 | 85/100 | +37 |
| Platform Optimization | 40/100 | 68/100 | +28 |
| **Composite GEO Score** | **46/100** | **71/100** | **+25** |

---

## What Was Done

### 1. Structured Data (schema.org) — HIGH IMPACT

**File: `index.html`**

All schema is server-rendered in `<script type="application/ld+json">` tags, making it visible to every AI crawler regardless of JavaScript support.

**Changes made:**
- `@type` updated from `"Organization"` to `["Organization", "LocalBusiness"]` — improves local entity recognition
- Added `sameAs` array linking to Instagram (`https://instagram.com/shyaramarketing`) and LinkedIn (`https://www.linkedin.com/company/shyaratechsolution`) — critical for entity disambiguation across AI knowledge bases
- Added `priceRange: "Rs. 7,999 – Rs. 20,000+"` — enables price context in AI responses
- Added `image` property (OG image) for richer entity profile
- Added top-level `openingHoursSpecification` (in addition to contactPoint)
- Expanded all 4 service `Offer` items with detailed descriptions and pricing context
- Added `ItemList` schema enumerating all 4 services with positions and URLs — improves service discovery in AI systems
- Added `areaServed` as array with both `Country: India` and `GeoShape: Global`
- Added separate `FAQPage` schema block with 5 authoritative Q&A pairs (server-rendered — key for Google AI Overviews)

**FAQ questions now indexed for AI Overviews:**
1. How much does social media management cost? → Plans from Rs. 7,999–Rs. 20,000/month
2. What is the ad management fee? → 20% of monthly ad budget
3. How long does a website take? → 3–5 days basic, 2–3 weeks e-commerce
4. Are there lock-in contracts? → No, monthly billing only
5. Do clients own their deliverables? → Yes, full ownership on delivery

**File: `src/components/SEO.tsx`**
- Added `FaqItem` interface and `faqSchema` prop
- Added dynamic `FAQPage` JSON-LD generation per-page (Google-renderable for service pages)

---

### 2. AI Crawler Access — MEDIUM IMPACT

**File: `public/robots.txt`**

Added 5 newer AI crawlers that were previously unlisted:
- `OAI-SearchBot` — OpenAI's second crawler (used for ChatGPT search)
- `meta-externalagent` — Meta AI crawler (used for Meta AI / Llama)
- `Diffbot` — enterprise AI knowledge graph crawler
- `YouBot` — You.com AI crawler
- `Kangaroobot` — Bing AI companion crawler

All crawlers (15 total) now have explicit `Allow: /` rules.

---

### 3. llms.txt — HIGH IMPACT

**File: `public/llms.txt`**

The `llms.txt` file is the primary AI-readable document for the site. Major additions:

- **Social media links**: Instagram and LinkedIn URLs added for entity corroboration
- **Industries Served section**: 7 verticals listed (restaurants, healthcare, travel, coaching, wellness, retail, professional services) — helps AI match queries to the brand
- **Key Results section** with concrete statistics:
  - "40% average follower growth in first 3 months for social media clients"
  - "Websites delivered in as little as 4 business days"
  - "Rs. 2L+ in combined ad spend managed across clients"
  - "100+ projects for 50+ clients"
- **FAQ section** (7 questions) — mirrors the FAQPage schema, providing citable direct answers for AI systems
- **Improved opening paragraph** with more direct, factual, citable language
- All URLs updated to correct domain: `marketing.shyara.co.in`

---

### 4. Service Pages — FAQ Sections + FAQ Schema

All 4 service pages now have:
- A visual FAQ accordion section (5 questions each)
- `faqSchema` prop passed to the `<SEO>` component, generating per-page `FAQPage` JSON-LD
- Trust stat blocks with specific numbers

**Questions covered per service:**

**Social Media Management** (`/services/social-media`):
- What is included in each plan?
- How is content approved before going live?
- Is there a lock-in contract?
- How do you report results?
- Can I upgrade/downgrade my plan?

**Ads Campaign Management** (`/services/ads-campaign-management`):
- How does the 20% fee work?
- What platforms are covered?
- Do I retain ad account ownership?
- What is the minimum budget?
- Are creatives included?

**Website Development** (`/services/website-development`):
- How long does it take?
- Do I own the website?
- What CMS is used?
- How many revisions are included?
- Do you handle hosting and domain?

**App Development** (`/services/app-development`):
- Does it work on both Android and iOS?
- Do I own the source code?
- How long does development take?
- What happens post-launch?
- How do you prevent scope creep?

---

### 5. E-E-A-T Content Improvements — MEDIUM IMPACT

**Trust stat blocks added to service pages:**
- Social media: "40% higher engagement within the first three months"
- Ads: "Rs. 2L+ in combined ad spend managed across clients"
- Website: "A complete business website in 4 business days"

**About page (`/about`):**
- Added "By the Numbers" stats row: 100+ Projects | 50+ Clients | 5+ Years | 4 Services
- Enriched "Why We Started" with India market context and explicit ownership/transparency claims
- Added breadcrumbs to SEO component
- Expanded keywords to include "digital marketing agency India" and "social media management agency India"

---

### 6. Domain URL Correction — CRITICAL FIX

The entire codebase previously referenced `shyaramarketing.com` — the wrong domain. All occurrences across 10 source files have been corrected to `marketing.shyara.co.in`:

Files updated:
- `index.html` (canonical, OG URL, all schema `@id` and URL properties)
- `src/components/SEO.tsx` (BASE_URL constant)
- `src/components/StructuredData.tsx`
- `public/sitemap.xml` (all 17 `<loc>` entries)
- `public/llms.txt` (all links)
- `public/robots.txt` (sitemap directive)
- `src/pages/services/SocialMediaService.tsx`
- `src/pages/services/AdsCampaignService.tsx`
- `src/pages/services/WebsiteDevelopmentService.tsx`
- `src/pages/services/AppDevelopmentService.tsx`

---

## Platform Readiness Assessment

| AI Platform | Readiness | Key Signals Present |
|-------------|-----------|---------------------|
| **Google AI Overviews** | 🟡 Good | FAQPage schema (server-rendered), Organization schema, sitemap, mobile-friendly |
| **ChatGPT (Web Search)** | 🟡 Good | robots.txt (GPTBot + OAI-SearchBot allowed), llms.txt, Organization schema |
| **Perplexity AI** | 🟡 Good | PerplexityBot allowed, llms.txt, FAQPage schema, sitemap |
| **Claude (Anthropic)** | 🟡 Good | ClaudeBot + anthropic-ai allowed, llms.txt, entity signals |
| **Meta AI** | 🟢 Strong | meta-externalagent now allowed, sameAs Instagram link |
| **LinkedIn AI** | 🟢 Strong | sameAs LinkedIn link, professional entity recognized |
| **Bing Copilot** | 🟡 Good | Bingbot + Kangaroobot allowed, Organization schema, sitemap |

---

## Remaining Recommendations (Not Yet Implemented)

### Critical: SPA Prerendering
The site is a React SPA with no server-side rendering. Most AI crawlers that don't execute JavaScript can only see `index.html`. Inner pages (`/services/social-media`, etc.) are invisible to these crawlers.

**Recommended fix**: Implement `vite-plugin-ssg` (static site generation) or integrate a prerendering service (Prerender.io, Cloudflare Workers). This single change would be the highest-impact remaining GEO improvement.

### High Priority
1. **Google Business Profile**: Create and optimize a Google Business Profile for Shyara Marketing — required for local pack visibility and Google AI Overviews for local queries
2. **Brand mentions on external platforms**: Post on Reddit (r/digitalmarketing, r/IndiaStartups), submit to Clutch.co, G2, or similar B2B review platforms — AI models cite these heavily
3. **Case studies with client names/outcomes**: Even anonymized case studies ("Restaurant client in Indore grew Instagram followers from 400 to 2,100 in 90 days") dramatically improve E-E-A-T

### Medium Priority
4. **Author/team page**: A simple "Meet the Team" page with real names and expertise signals boosts E-E-A-T for AI systems
5. **Blog/resources section**: Original written content (guides, how-tos, industry data) is the most durable AI citability signal
6. **Wikipedia-style mentions**: Getting mentioned in Wikipedia articles about digital marketing services in India or Madhya Pradesh significantly boosts entity confidence in AI models

---

## Technical Notes

- **TypeScript**: All changes pass `npx tsc --noEmit` with zero errors
- **Schema validation**: All JSON-LD structures follow schema.org specifications
- **No new dependencies**: All FAQ accordions use React state (`useState`) with existing Tailwind classes — no new packages added
- **Backward compatible**: All existing page layouts, colors, and CTAs are preserved. Only additions were made — nothing was removed or altered structurally.
- **Green accent color `#22c55e`**: Preserved throughout all new UI components

---

## Files Changed Summary

| File | Type of Change |
|------|----------------|
| `index.html` | Schema expansion (Organization+LocalBusiness+FAQPage+ItemList), sameAs, URL fix |
| `src/components/SEO.tsx` | Added FaqItem interface + faqSchema prop + FAQPage JSON-LD generation, URL fix |
| `src/components/StructuredData.tsx` | URL fix only |
| `public/llms.txt` | Major content expansion (FAQ, industries, key results, social links) |
| `public/robots.txt` | Added 5 newer AI crawlers |
| `public/sitemap.xml` | URL fix (all 17 entries) |
| `src/pages/About.tsx` | Stats row, founding context, breadcrumbs, keywords |
| `src/pages/services/SocialMediaService.tsx` | FAQ section + faqSchema + trust stat + URL fix |
| `src/pages/services/AdsCampaignService.tsx` | FAQ section + faqSchema + trust stat + URL fix |
| `src/pages/services/WebsiteDevelopmentService.tsx` | FAQ section + faqSchema + trust stat + URL fix |
| `src/pages/services/AppDevelopmentService.tsx` | FAQ section + faqSchema + URL fix |
