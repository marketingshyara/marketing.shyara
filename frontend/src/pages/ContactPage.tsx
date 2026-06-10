import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { SEO } from "@/components/SEO";
import { SOCIAL_SHARE } from "@/constants/socialShare";
import { SITE } from "@/constants/site";
import { contactPage } from "@/content/contact";
import { contactWhatsAppMessages, openWhatsApp } from "@/lib/whatsapp";

export default function ContactPage() {
  const { channels, faq, cta } = contactPage;

  return (
    <>
      <SEO
        title="Contact Us"
        description={contactPage.description}
        shareTitle={SOCIAL_SHARE.contact.title}
        shareDescription={SOCIAL_SHARE.contact.description}
        canonical="/contact"
        keywords="contact Shyara Marketing, website quote, WhatsApp, email, business hours"
      />

      <section
        data-testid="contact-section"
        className="scroll-mt-24 border-b-2 border-[#0A0A0A] bg-[#F0EEE9] pt-28 pb-16 md:pb-24"
      >
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-14 max-w-3xl"
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#FF3333]">
              {contactPage.label}
            </p>
            <h1
              data-testid="contact-headline"
              className="font-heading text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
            >
              {contactPage.title}{" "}
              <span className="text-[#0A0A0A]/40">{contactPage.titleAccent}</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-[#0A0A0A]/70 md:text-lg">
              {contactPage.description}
            </p>
            <ul className="mt-6 space-y-2 text-sm font-bold uppercase tracking-wide text-[#0A0A0A]/80">
              {contactPage.trustPoints.map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-[#FF3333]" />
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              data-testid="contact-channel-whatsapp"
              className="flex flex-col border-2 border-[#0A0A0A] bg-white p-8 shadow-[6px_6px_0px_0px_#0a0a0a] lg:col-span-1"
            >
              <MessageCircle className="text-[#25D366]" size={32} strokeWidth={2.5} />
              <h2 className="mt-5 font-heading text-xl font-black tracking-tight">
                {channels.whatsapp.title}
              </h2>
              <p className="mt-2 text-sm font-bold uppercase tracking-wide text-[#0A0A0A]/60">
                {channels.whatsapp.subtitle}
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[#0A0A0A]/70">
                {channels.whatsapp.hint}
              </p>
              <button
                type="button"
                data-testid="contact-whatsapp-btn"
                onClick={() => openWhatsApp(contactWhatsAppMessages.main)}
                className="mt-8 inline-flex w-fit items-center gap-2 bg-[#25D366] px-6 py-4 font-bold uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 hover:bg-[#1DA851] hover:shadow-[4px_4px_0px_0px_#0a0a0a]"
              >
                <MessageCircle size={18} strokeWidth={2.5} />
                {channels.whatsapp.action}
              </button>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              data-testid="contact-channel-email"
              className="flex flex-col border-2 border-[#0A0A0A] bg-white p-8 shadow-[6px_6px_0px_0px_#0a0a0a]"
            >
              <Mail className="text-[#FF3333]" size={32} strokeWidth={2.5} />
              <h2 className="mt-5 font-heading text-xl font-black tracking-tight">
                {channels.email.title}
              </h2>
              <a
                href={`mailto:${SITE.email}`}
                data-testid="contact-email-link"
                className="mt-4 break-all font-bold text-[#0A0A0A] underline decoration-[#FF3333]/40 underline-offset-4 transition-colors hover:text-[#FF3333]"
              >
                {channels.email.address}
              </a>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[#0A0A0A]/70">
                {channels.email.hint}
              </p>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              data-testid="contact-channel-phone"
              className="flex flex-col border-2 border-[#0A0A0A] bg-white p-8 shadow-[6px_6px_0px_0px_#0a0a0a]"
            >
              <Phone className="text-[#0A0A0A]/70" size={32} strokeWidth={2.5} />
              <h2 className="mt-5 font-heading text-xl font-black tracking-tight">Call us</h2>
              <a
                href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                data-testid="contact-phone-link"
                className="mt-4 font-bold text-[#0A0A0A] underline decoration-[#FF3333]/40 underline-offset-4 transition-colors hover:text-[#FF3333]"
              >
                {SITE.phone}
              </a>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[#0A0A0A]/70">
                Prefer a quick call? Reach us during business hours.
              </p>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              data-testid="contact-channel-hours"
              className="flex flex-col border-2 border-[#0A0A0A] bg-[#0A0A0A] p-8 text-white shadow-[6px_6px_0px_0px_#ff3333] md:col-span-2 lg:col-span-3"
            >
              <Clock className="text-[#FF3333]" size={32} strokeWidth={2.5} />
              <h2 className="mt-5 font-heading text-xl font-black tracking-tight">
                {channels.hours.title}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 md:text-base">
                {channels.hours.body}
              </p>
            </motion.article>
          </div>
        </div>
      </section>

      <section
        data-testid="contact-faq-section"
        className="border-b-2 border-[#0A0A0A] bg-[#FAFAFA] py-16 md:py-24"
      >
        <div className="mx-auto max-w-3xl px-6 md:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#FF3333]">{faq.label}</p>
          <h2 className="mt-4 font-heading text-2xl font-black tracking-tight sm:text-3xl">
            {faq.title}
          </h2>
          <p className="mt-3 text-sm text-[#0A0A0A]/70 md:text-base">{faq.subtitle}</p>

          <div className="mt-10 divide-y-2 divide-[#0A0A0A]/15 border-2 border-[#0A0A0A] bg-white">
            {faq.items.map((item) => (
              <details key={item.q} className="group px-6 py-1">
                <summary className="cursor-pointer list-none py-4 font-bold tracking-tight marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-4">
                    <span>{item.q}</span>
                    <span
                      aria-hidden
                      className="mt-1 shrink-0 text-[#FF3333] transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="pb-5 text-sm leading-relaxed text-[#0A0A0A]/70">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        data-testid="contact-cta-section"
        className="border-b-2 border-[#0A0A0A] bg-[#0A0A0A] py-20 text-white md:py-28"
      >
        <div className="mx-auto max-w-3xl px-6 text-center md:px-12">
          <h2 className="font-heading text-3xl font-black tracking-tight sm:text-4xl">{cta.headline}</h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/70">{cta.body}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              data-testid="contact-cta-whatsapp-btn"
              onClick={() => openWhatsApp(contactWhatsAppMessages.cta)}
              className="inline-flex items-center gap-2 bg-[#25D366] px-8 py-4 font-bold uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 hover:bg-[#1DA851] hover:shadow-[4px_4px_0px_0px_#ffffff]"
            >
              <MessageCircle size={20} strokeWidth={2.5} />
              {cta.primary}
            </button>
            <Link
              to="/work"
              data-testid="contact-cta-samples-link"
              className="inline-flex items-center gap-2 border-2 border-white px-8 py-4 font-bold uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 hover:bg-white hover:text-[#0A0A0A]"
            >
              {cta.secondary}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
