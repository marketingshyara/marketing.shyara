export const samplesPage = {
  label: "Live portfolio",
  title: "See real websites",
  titleAccent: "before you commit.",
  description:
    "Scroll through live previews we built for local businesses. Open any sample, click around, and imagine your brand in its place.",
  trustPoints: [
    "Delivered work, not mockups",
    "Restaurants, clinics, fitness, florists, real estate, and more",
    "Ask us to build yours next",
  ],
  filterLabel: "Browse by industry",
  clinicBanner: {
    title: "Clinic waiting room flow",
    body:
      "Some clinic samples include a QR journey for patients in the waiting room: doctor profiles, blogs, and clinic info while they wait. Standard clinic sites are listed separately.",
  },
  waitingRoomHeading: "Waiting room enabled",
  standardClinicHeading: "Standard clinic websites",
  empty: {
    code: (code: string) => `No sample found for code ${code}.`,
    category: "No samples in this category yet.",
    default: "Website samples coming soon!",
    sub: "We are preparing more live previews for you to explore.",
  },
  cta: {
    headline: "Want a website like these?",
    body: "Tell us about your business on WhatsApp. We will suggest what fits your goals and budget.",
    primary: "Chat on WhatsApp",
  },
} as const;
