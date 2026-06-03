const WHATSAPP_NUMBER = "919584661610";

export function openWhatsApp(message: string) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export const homeWhatsAppMessages = {
  hero: "Hi Shyara Marketing, I visited your website. I need a website for my business so customers can find me online. Can we talk?",
  cta: "Hi Shyara Marketing, I'm ready to get my business online with a website. When can we start?",
  verticals: "Hi Shyara Marketing, I saw your website samples. I run a local business and want a website like that. Can we discuss?",
} as const;

export const samplesWhatsAppMessages = {
  portfolio:
    "Hi Shyara Marketing, I browsed your website samples and want something similar for my business. Can we discuss scope, timeline, and pricing?",
  cta: "Hi Shyara Marketing, I've gone through your website samples and want a website built for my business. What would work best for me?",
} as const;

export const contactWhatsAppMessages = {
  main: "Hi Shyara Marketing, I'm reaching out from your website. I'd like to discuss a website for my business. When is a good time to connect?",
  cta: "Hi Shyara Marketing, I'd like to start a conversation about getting my business online. Please let me know a good time.",
} as const;
