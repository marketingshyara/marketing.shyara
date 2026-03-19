import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, Clock, Check } from "lucide-react";

const trustPoints = [
  "We respond within 2–4 hours on business days",
  "First consultation is always free",
  "We'll tell you honestly if we're not the right fit",
  "No pushy sales calls — just a genuine conversation",
];

const preContactFaqs = [
  {
    q: "I'm not sure which service I need.",
    a: "That's exactly what the initial conversation is for. Tell us about your business and goal — we'll recommend the right service.",
  },
  {
    q: "I have a very small budget.",
    a: "We work with businesses at different stages. Share your budget honestly and we'll tell you what's realistic within it.",
  },
  {
    q: "I've worked with agencies before and been disappointed.",
    a: "We hear this a lot. Ask us for our process documentation upfront — we'll show you exactly what you'll receive and when, before you pay.",
  },
];

export default function Contact() {
  const openWhatsApp = () => {
    window.open(
      "https://wa.me/919584661610?text=Hi%20Shyara%20Marketing%2C%20I%27m%20reaching%20out%20from%20your%20website.%20I%27d%20like%20to%20discuss%20a%20project%20for%20my%20business.%20Please%20let%20me%20know%20a%20good%20time%20to%20connect.",
      "_blank"
    );
  };

  return (
    <Layout>
      <SEO
        title="Contact Us"
        description="Get in touch with Shyara Marketing. Reach out to us directly via WhatsApp or email and let us help you choose the right digital marketing and technology solution for your business."
        canonical="/contact"
        keywords="contact digital marketing agency, hire marketing company, get quote website development, digital marketing consultation, Shyara Marketing contact"
      />

      {/* Main Contact Section */}
      <section className="py-20 lg:py-28 gradient-hero">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left: Trust content */}
            <div>
              <span className="section-label block mb-4">Contact Us</span>
              <h1 className="text-hero font-extrabold tracking-tight text-foreground lg:text-display">
                Let's Talk About{" "}
                <span className="text-accent">Your Business.</span>
              </h1>
              <p className="mt-4 text-body text-muted-foreground leading-relaxed md:text-lg">
                No forms. No call centers. Just a direct conversation with the team that
                will actually be managing your work.
              </p>
              <div className="mt-8 space-y-3">
                {trustPoints.map((point) => (
                  <div key={point} className="flex items-center gap-3 text-small text-muted-foreground">
                    <Check className="h-4 w-4 text-accent flex-shrink-0" />
                    {point}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Contact cards */}
            <div className="space-y-4">
              {/* WhatsApp card */}
              <button
                onClick={openWhatsApp}
                type="button"
                className="w-full rounded-card border-2 border-[#25D366] bg-[#25D366]/5 hover:bg-[#25D366]/10 shadow-card p-6 text-left flex items-center gap-4 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground text-body">Chat on WhatsApp</div>
                  <div className="text-small text-muted-foreground">Fastest way to reach us — typical reply in 2–4 hours</div>
                  <div className="text-caption text-[#25D366] font-medium mt-1 group-hover:gap-1.5 flex items-center gap-1 transition-all">
                    Open WhatsApp →
                  </div>
                </div>
              </button>

              {/* Email card */}
              <a
                href="mailto:marketing.shyara@gmail.com"
                className="w-full rounded-card border border-border bg-card shadow-card hover:border-accent/40 hover:shadow-elevated p-6 text-left flex items-center gap-4 transition-all duration-300 block"
              >
                <div className="icon-well-lg flex-shrink-0">
                  <Mail className="h-7 w-7 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-body">Email Us</div>
                  <div className="text-small text-muted-foreground">marketing.shyara@gmail.com</div>
                  <div className="text-caption text-accent font-medium mt-1">Expect a reply within 24 hours</div>
                </div>
              </a>

              {/* Business hours info */}
              <div className="rounded-card bg-muted/50 border border-border p-4 flex items-start gap-3">
                <Clock className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <p className="text-small text-muted-foreground">
                  Business hours:{" "}
                  <strong className="text-foreground">Mon–Sat, 9am–7pm IST.</strong>{" "}
                  Messages received outside hours are answered first thing next morning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before You Reach Out */}
      <section className="py-20 lg:py-28 bg-[hsl(var(--surface))]">
        <div className="container">
          <div className="text-center mb-10">
            <span className="section-label block mb-3">Common Concerns</span>
            <h2 className="text-section font-bold text-foreground">Before You Reach Out</h2>
            <p className="text-body text-muted-foreground mt-2">These are the most common things people wonder before messaging us.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {preContactFaqs.map((faq) => (
              <div key={faq.q} className="rounded-card border border-border bg-card shadow-card p-6">
                <h3 className="font-semibold text-foreground text-small mb-2">"{faq.q}"</h3>
                <p className="text-muted-foreground text-small leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer context */}
      <section className="py-8 bg-background">
        <div className="container">
          <p className="text-sm text-muted-foreground text-center">
            Shyara Tech Solutions (OPC) Pvt. Ltd. · India · Serving clients globally
          </p>
        </div>
      </section>
    </Layout>
  );
}
