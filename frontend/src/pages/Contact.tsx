import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { MarketingPageHero } from "@/components/marketing/MarketingPageHero";
import { MarketingCtaBand } from "@/components/marketing/MarketingCtaBand";
import { ScrollSection } from "@/components/marketing/motion/ScrollSection";
import { MotionReveal } from "@/components/marketing/motion/MotionReveal";
import { StaggerChildren, StaggerItem } from "@/components/marketing/motion/StaggerChildren";
import { useRevealOnScroll } from "@/components/marketing/motion/useRevealOnScroll";
import { contactPage } from "@/content/contact";
import { openWhatsApp, contactWhatsAppMessages } from "@/lib/whatsapp";
import { MessageCircle, Mail, Clock, Check, ArrowRight } from "lucide-react";

function ContactChannelCard({
  children,
  className,
  onClick,
  href,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}) {
  const reduce = useReducedMotion();
  const motionProps = reduce
    ? {}
    : {
        whileHover: { y: -3, transition: { duration: 0.2 } },
        whileTap: { scale: 0.99 },
      };

  const base =
    "w-full rounded-2xl border text-left transition-shadow duration-300 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  if (href) {
    return (
      <motion.a href={href} className={`${base} block ${className ?? ""}`} {...motionProps}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`${base} ${className ?? ""}`}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
}

export default function Contact() {
  const channelsRef = useRevealOnScroll({ direction: "up", stagger: 0.1 });
  const faqRef = useRevealOnScroll({ batch: true, stagger: 0.08 });
  const reduce = useReducedMotion();

  return (
    <Layout>
      <SEO
        title="Contact Us"
        description="Get in touch with Shyara Marketing via WhatsApp or email. We help local businesses get found online with professional websites."
        canonical="/contact"
        keywords="contact digital marketing agency, website development India, Shyara Marketing contact, WhatsApp business website"
      />

      <MarketingPageHero
        label={contactPage.label}
        title={
          <>
            {contactPage.title}{" "}
            <span className="text-brand-emerald">{contactPage.titleAccent}</span>
          </>
        }
        description={contactPage.description}
        trustPoints={[...contactPage.trustPoints]}
      />

      <ScrollSection section="contact-channels" className="surface-warm border-b border-border/40">
        <div ref={channelsRef} className="container py-14 md:py-20">
          <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-2 lg:gap-12">
            <div data-reveal>
              <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                Pick what feels easiest
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Most owners message us on WhatsApp with a short note about their business. We reply with
                clear next steps, not a sales script.
              </p>
              <ul className="mt-6 space-y-3">
                {contactPage.trustPoints.slice(0, 3).map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-emerald" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4" data-reveal>
              <ContactChannelCard
                onClick={() => openWhatsApp(contactWhatsAppMessages.main)}
                className="border-2 border-brand-coral/50 bg-brand-coral/5 p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-brand-coral">
                    <MessageCircle className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{contactPage.channels.whatsapp.title}</div>
                    <div className="text-sm text-muted-foreground">{contactPage.channels.whatsapp.subtitle}</div>
                    <div className="mt-1 flex items-center gap-1 text-sm font-medium text-brand-coral">
                      {contactPage.channels.whatsapp.action}
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </ContactChannelCard>

              <ContactChannelCard
                href={`mailto:${contactPage.channels.email.address}`}
                className="border-border bg-card p-6 shadow-card"
              >
                <div className="flex items-center gap-4">
                  <div className="icon-well-lg flex-shrink-0">
                    <Mail className="h-7 w-7 text-brand-emerald" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{contactPage.channels.email.title}</div>
                    <div className="text-sm text-muted-foreground">{contactPage.channels.email.address}</div>
                    <div className="mt-1 text-sm font-medium text-brand-emerald">
                      {contactPage.channels.email.hint}
                    </div>
                  </div>
                </div>
              </ContactChannelCard>

              <MotionReveal delay={0.1}>
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-sm">
                  <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-amber" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">{contactPage.channels.hours.title}:</strong>{" "}
                    {contactPage.channels.hours.body}
                  </p>
                </div>
              </MotionReveal>
            </div>
          </div>
        </div>
      </ScrollSection>

      <ScrollSection section="contact-faq" className="surface-trust py-14 md:py-20">
        <div ref={faqRef} className="container">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="section-label mb-3 block" data-reveal>
              {contactPage.faq.label}
            </span>
            <h2 className="font-display text-section font-bold text-foreground" data-reveal>
              {contactPage.faq.title}
            </h2>
            <p className="mt-2 text-muted-foreground" data-reveal>
              {contactPage.faq.subtitle}
            </p>
          </div>

          <StaggerChildren className="mx-auto grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-3">
            {contactPage.faq.items.map((faq) => (
              <StaggerItem key={faq.q}>
                <motion.div
                  className="h-full rounded-2xl border border-border/80 bg-card p-6 shadow-card"
                  whileHover={reduce ? undefined : { y: -4 }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                >
                  <h3 className="mb-2 font-semibold text-foreground text-sm leading-snug">
                    &ldquo;{faq.q}&rdquo;
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </ScrollSection>

      <MarketingCtaBand
        headline={contactPage.cta.headline}
        body={contactPage.cta.body}
        whatsappMessage={contactWhatsAppMessages.cta}
        primaryLabel={contactPage.cta.primary}
        secondaryHref="/samples"
        secondaryLabel={contactPage.cta.secondary}
      />
    </Layout>
  );
}
