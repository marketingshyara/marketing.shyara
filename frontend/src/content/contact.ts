export const contactPage = {
  label: "Contact us",
  title: "Let's talk about",
  titleAccent: "your business.",
  description:
    "No forms or call centers. Message us directly and speak with the team that will handle your website.",
  trustPoints: [
    "Reply within 2 to 4 hours on business days",
    "Honest advice if we are not the right fit",
    "No pushy sales, just clarity",
  ],
  channels: {
    whatsapp: {
      title: "Chat on WhatsApp",
      subtitle: "Fastest way to reach us",
      hint: "Typical reply in 2 to 4 hours on Mon to Sat, 9am to 7pm IST",
      action: "Open WhatsApp",
    },
    email: {
      title: "Email us",
      address: "sales@shyara.co.in",
      hint: "Best for briefs, attachments, or if you prefer email. We reply within 24 hours on business days.",
    },
    hours: {
      title: "Business hours",
      body: "Monday to Saturday, 9am to 7pm IST. Messages sent after hours are answered first thing the next morning.",
    },
  },
  faq: {
    label: "Common questions",
    title: "Before you reach out",
    subtitle: "Clear answers so you know what to expect before your first message.",
    items: [
      {
        q: "What should our website include?",
        a: "At minimum: what you sell or offer, your location and service area, opening hours, photos of your work or space, and one obvious way to call or WhatsApp you. We also set up Google-friendly titles and descriptions, a contact section, and a mobile layout so people searching on phones can reach you quickly. Tell us your business type and whether you want more calls, walk-ins, bookings, or form leads, and we will propose a page list before any payment.",
      },
      {
        q: "What should I put in my first WhatsApp or email?",
        a: "Your business name, city, what you want the site to achieve (e.g. more calls from Google), and whether you already have a domain, logo, or photos. If you saw a sample on our Work page, mention which one. That is enough for us to suggest scope, a rough timeline, and next steps in one reply.",
      },
      {
        q: "How much does a website cost and what is included?",
        a: "Pricing depends on number of pages, custom features (booking, menus, galleries), and content you already have. We quote in writing after a short chat: what pages you get, what we write or design, hosting setup, basic on-page SEO, and how many revision rounds are included. There are no hidden monthly platform fees from us for a standard business site; hosting and domain are separate third-party costs we can explain upfront.",
      },
      {
        q: "How long does it take to go live?",
        a: "A focused local business site often takes 2 to 4 weeks from agreed scope and content handoff. Simpler single-page sites can be faster; larger builds with many sections or integrations take longer. We share a delivery schedule when you approve the quote so you know when drafts, review, and launch happen.",
      },
      {
        q: "What happens after I message you?",
        a: "We reply with a few clarifying questions, then either a short call or WhatsApp thread to confirm scope. You receive a written summary: pages, timeline, price, and payment steps. Work starts after advance payment and content checklist are agreed. You review staging links before we point your domain and go live.",
      },
      {
        q: "Do you work with small budgets?",
        a: "Yes, if expectations match the budget. We will say plainly what is possible at your number (e.g. single landing page vs multi-page site, template-based layout vs heavy custom design). If we cannot deliver something you would be happy with at that budget, we will tell you rather than oversell.",
      },
      {
        q: "I have been burned by another agency before. How are you different?",
        a: "You get a named scope document before payment, staging links you can click and share, and direct access to the people building the site (not a ticket queue). Payments are tied to agreed milestones. We do not hand over a half-finished template and disappear; launch includes basic checks for mobile, contact links, and search basics.",
      },
      {
        q: "Will my site show up on Google and Maps?",
        a: "We build with local discovery in mind: clear business info, fast mobile pages, readable headings, and meta data for search and social previews. Ranking also depends on your Google Business Profile, reviews, and competition in your area. We can guide you on profile setup and on-page basics; ongoing SEO campaigns are separate if you want them later.",
      },
      {
        q: "Can you use our existing domain, logo, and photos?",
        a: "Yes. Send your domain registrar login when we are ready to connect, or we can help you buy one. Logos and photos you own can be used as-is; if quality is low for web, we will say so and suggest simple fixes. We do not provide stock photography unless agreed in scope.",
      },
    ],
  },
  cta: {
    headline: "Ready when you are",
    body: "One message is enough to get started.",
    primary: "Message on WhatsApp",
    secondary: "Browse samples",
  },
} as const;
