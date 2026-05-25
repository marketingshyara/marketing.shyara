import { createFileRoute } from "@tanstack/react-router";
import { Phone, MessageCircle, Mail, MapPin, Clock, Instagram, Facebook } from "lucide-react";

export const Route = createFileRoute("/_site/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Shyara Auto Care" },
      { name: "description", content: "Call, WhatsApp or visit Shyara Auto Care. Open Mon–Sun, 8 AM – 9 PM." },
      { property: "og:title", content: "Contact — Shyara Auto Care" },
      { property: "og:description", content: "Reach out — we usually reply within minutes." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <>
      <section className="pt-36 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="reveal text-xs uppercase tracking-[0.25em] text-primary">Contact</p>
          <h1 className="reveal reveal-delay-1 mt-3 text-5xl sm:text-6xl font-bold max-w-3xl">
            Let's get your ride <span className="text-gradient">shining.</span>
          </h1>
          <p className="reveal reveal-delay-2 mt-5 text-muted-foreground max-w-xl">
            One tap to call or WhatsApp. We typically respond within minutes.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-6">
          <a
            href="tel:+919584661610"
            className="reveal-scale group p-8 sm:p-10 rounded-3xl bg-gradient-brand text-primary-foreground shadow-glow hover-lift relative overflow-hidden focus-ring rounded-3xl"
          >
            <Phone className="size-10" />
            <h2 className="mt-6 text-2xl font-semibold">Call us</h2>
            <p className="mt-1 text-primary-foreground/80 text-sm">Talk to our team directly.</p>
            <div className="mt-6 text-3xl sm:text-4xl font-display font-bold">+91 95846 61610</div>
            <div className="absolute -bottom-10 -right-10 size-40 rounded-full bg-primary-foreground/10 blur-2xl group-hover:scale-150 transition-transform" />
          </a>

          <a
            href="https://wa.me/919584661610?text=Hi%20Shyara%20Auto%20Care%2C%20I%27d%20like%20to%20know%20more."
            target="_blank"
            rel="noopener noreferrer"
            className="reveal-scale reveal-delay-1 group p-8 sm:p-10 rounded-3xl bg-card border border-border hover-lift relative overflow-hidden focus-ring rounded-3xl"
          >
            <div className="size-12 rounded-2xl bg-[#25D366] grid place-items-center">
              <MessageCircle className="size-6 text-white" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold">WhatsApp</h2>
            <p className="mt-1 text-muted-foreground text-sm">Chat with us — share pictures, get quotes instantly.</p>
            <div className="mt-6 text-3xl sm:text-4xl font-display font-bold text-gradient">+91 95846 61610</div>
          </a>

          <div className="reveal p-8 rounded-3xl bg-card border border-border">
            <Mail className="size-7 text-primary" />
            <h3 className="mt-4 text-lg font-semibold">Email</h3>
            <a href="mailto:hello@shyaraautocare.in" className="mt-1 text-muted-foreground hover:text-foreground transition-colors block">
              hello@shyaraautocare.in
            </a>
          </div>

          <div className="reveal reveal-delay-1 p-8 rounded-3xl bg-card border border-border">
            <Clock className="size-7 text-primary" />
            <h3 className="mt-4 text-lg font-semibold">Hours</h3>
            <p className="mt-1 text-muted-foreground">Monday – Sunday · 8:00 AM – 9:00 PM</p>
          </div>

          <div className="reveal lg:col-span-2 p-8 rounded-3xl bg-card border border-border">
            <MapPin className="size-7 text-primary" />
            <h3 className="mt-4 text-lg font-semibold">Visit the studio</h3>
            <p className="mt-1 text-muted-foreground">
              Shyara Auto Care · Drive in any day, no appointment needed.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                aria-label="Instagram"
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="size-10 grid place-items-center rounded-full border border-border hover:border-primary hover:text-primary transition-colors focus-ring"
              >
                <Instagram className="size-4" />
              </a>
              <a
                aria-label="Facebook"
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="size-10 grid place-items-center rounded-full border border-border hover:border-primary hover:text-primary transition-colors focus-ring"
              >
                <Facebook className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
