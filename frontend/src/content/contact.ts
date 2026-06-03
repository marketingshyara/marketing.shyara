export const contactPage = {
  label: "Contact us",
  title: "Let's talk about",
  titleAccent: "your business.",
  description:
    "No forms or call centers. Message us directly and speak with the team that will handle your website.",
  trustPoints: [
    "Reply within 2–4 hours on business days",
    "First conversation is free",
    "Honest advice if we are not the right fit",
    "No pushy sales, just clarity",
  ],
  channels: {
    whatsapp: {
      title: "Chat on WhatsApp",
      subtitle: "Fastest way to reach us",
      hint: "Typical reply in 2–4 hours",
      action: "Open WhatsApp",
    },
    email: {
      title: "Email us",
      address: "marketing.shyara@gmail.com",
      hint: "Reply within 24 hours",
    },
    hours: {
      title: "Business hours",
      body: "Mon–Sat, 9am–7pm IST. Messages after hours are answered first thing next morning.",
    },
  },
  faq: {
    label: "Common concerns",
    title: "Before you reach out",
    subtitle: "Most owners ask these before their first message.",
    items: [
      {
        q: "I'm not sure what I need yet.",
        a: "That is fine. Tell us what you do and what you want more of (calls, walk-ins, bookings). We will recommend the right next step.",
      },
      {
        q: "My budget is small.",
        a: "Share your budget honestly. We work with businesses at different stages and will tell you what is realistic.",
      },
      {
        q: "I've been disappointed by agencies before.",
        a: "Ask us for our process upfront: what you get, when, and how we communicate before you pay anything.",
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
