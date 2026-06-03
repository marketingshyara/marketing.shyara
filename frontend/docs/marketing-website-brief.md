# Shyara Marketing — Website Brief

> **Audience for this doc:** Anyone implementing or writing copy for the **main marketing website** (`frontend/`, not Sales Portal).  
> **Cursor rule:** `.cursor/rules/marketing-website-mission.mdc`

---

## One-line positioning

**Shyara Marketing builds websites that help local Indian businesses get found, trusted, and chosen — online search, Google, and AI answers included.**

---

## Mission

### Turn India digital

India’s local economy runs on restaurants, clinics, gyms, coaching centres, garages, washes, and thousands of similar businesses. Most of their customers now **search before they visit**. Businesses without a credible web presence lose trust — and lose the customer to someone who shows up in search or in an AI recommendation.

Our mission: **make it normal for every such business to have a website that works for real life** — not a brochure that sits dead on the internet, but a presence that helps people find them, believe them, and contact them.

Every page should make a visitor feel: *“These people are serious about getting businesses like mine online.”*

---

## What we do (only this)

| We do | We do not (remove from site) |
|-------|------------------------------|
| Website design & development | Social media management |
| Local SEO & search visibility | Ads campaign management |
| AEO / GEO — visibility in AI answers (ChatGPT, Gemini, etc.) | App development |
| Trust-building structure (services, location, hours, contact) | Public pricing / offers pages |
| Industry-ready templates & custom sites for local verticals | Generic “full-stack marketing agency” positioning |

**Product:** A website plus the foundations for **being found** — structured for humans and for search/AI systems.

---

## Who we build for

Primary ICP: **owner-operated local businesses** who depend on footfall, appointments, or local discovery.

| Vertical | Why a website matters |
|----------|------------------------|
| Restaurants & cafés | Menu, location, hours, reservations — searched before dining |
| Clinics & healthcare | Trust, services, doctor info, appointment paths |
| Gyms & fitness | Timings, trainers, membership inquiry |
| Coaching & tuition | Courses, results, contact — parents search first |
| Garages & auto care | Services, location, call/WhatsApp |
| Car / bike washes | Pricing cues, location, “near me” searches |

Website samples in `/samples` should reinforce: *“We’ve done your kind of business.”*

---

## What customers actually care about

Write copy around **their** goals, not our tool list.

1. **“Can people find me?”** — Google, Maps, “near me”, category searches  
2. **“Do I look legitimate?”** — Professional site vs empty Maps pin or broken link  
3. **“Will I get more calls / visits / bookings?”** — Clear CTAs, mobile-friendly, fast  
4. **“Will AI recommend me?”** — AEO/GEO: correct business facts, schema, content AI can cite  
5. **“Is this worth my money?”** — Outcomes and trust, not discount tables  

### Terminology (use plainly)

- **SEO** — rank on Google for what customers search  
- **AEO** (Answer Engine Optimization) — show up when people ask assistants direct questions  
- **GEO** (Generative Engine Optimization) — be named/cited when ChatGPT, Gemini, Perplexity, etc. answer “best X near me” or “who should I use for…”  

Explain benefits in plain language; jargon is optional secondary detail.

---

## Voice & messaging pillars

1. **Mission** — Turn India digital; one business at a time  
2. **Proof** — Samples by vertical, client outcomes (when available)  
3. **Outcomes** — Found, trusted, contacted — not “beautiful design” alone  
4. **Honesty** — No hype; studies/behavior (“people search first”) over empty superlatives  
5. **Action** — WhatsApp / talk to us; no public price list  

### Avoid

- ₹ plans, “offers”, “starting at” on the marketing site  
- “360° digital marketing”, “viral growth”, agency clichés  
- Long FAQ essays; prefer scannable blocks and motion-led sections (overhaul)  
- Mentioning removed services in nav, footer, meta, or JSON-LD  

---

## Site structure (target direction)

Exact routes will be confirmed before build. Direction:

| Keep / evolve | Remove / merge |
|---------------|----------------|
| Home (mission + outcomes + verticals) | `/offers` |
| Work / samples (website portfolio) | SMM, ads, app service pages |
| About (mission story) | Pricing tables & plan cards |
| Contact | Careers (optional/minimal) |
| Legal policies | Duplicate service hubs for non-website services |

Home narrative (draft):

1. Hero — mission: turn India digital  
2. Problem — customers search first; invisible = untrusted  
3. What we build — websites built to be **found** (SEO, AEO, GEO)  
4. Who it’s for — vertical chips (restaurant, clinic, gym, …)  
5. Proof — sample sites + impact metrics when available  
6. CTA — get your business online  

---

## Technical ripples (checklist)

When implementing changes:

- [ ] `AppRoutes.tsx` — drop removed routes; add redirects if URLs were public  
- [ ] `Header.tsx` / `Footer.tsx` — nav labels match website-only positioning  
- [ ] `scripts/prerender.mjs` — SSG list matches live routes  
- [ ] `SEO.tsx` / page meta — no removed services in titles/descriptions  
- [ ] `StructuredData.tsx` — service schema = website development & local business visibility  
- [ ] `Home.tsx`, `Services.tsx` — single source of truth for offerings (`content/` module TBD)  
- [ ] Delete dead assets: offer images, unused modals under `components/modals/`  
- [ ] Sales Portal — **unchanged** unless separate product decision  

---

## Design overhaul (constraints)

- Less text-heavy, highly animated (GSAP, Lottie, scroll narratives)  
- Richer color system — still on-brand for Shyara  
- **All motion and visuals serve the mission** — local business discovery, not generic “creative agency”  

Skills to prefer during implementation: `design-taste-frontend`, `premium-frontend-ui`, `gsap-scrolltrigger`, `gsap-react`, `motion-design`, `accesslint-audit`, `web-design-guidelines`.

---

## Open items (for stakeholder input)

- Concrete client impact stories (metrics, vertical, before/after)  
- Final IA choice: single-page vs multi-page (see planning chat)  
- Whether `/services` remains or folds entirely into home  
- GEO/AEO claims — only state what we actually deliver in the product  

---

*Last updated: mission pivot — website-only, Turn India digital.*
