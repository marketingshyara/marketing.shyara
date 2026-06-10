import { motion } from "framer-motion";
import { ArrowRight, Smartphone, Megaphone, Share2, type LucideIcon } from "lucide-react";
import { SITE } from "@/constants/site";

const secondaryServices: {
  icon: LucideIcon;
  title: string;
  text: string;
  tag: string;
}[] = [
  {
    icon: Smartphone,
    title: "App Development",
    text: "MVP to full-scale mobile apps. Clearly scoped before we write a single line of code so there are zero surprises.",
    tag: "Scoped Upfront",
  },
  {
    icon: Megaphone,
    title: "Ads Campaign Management",
    text: "20% flat management fee. No hidden markups on your ad budget. Transparent, results-focused traffic generation.",
    tag: "20% Flat Fee",
  },
  {
    icon: Share2,
    title: "Social Media Management",
    text: "Engaging reels, creatives, and Google Business Profile optimization to keep your brand relevant.",
    tag: "From ₹7,999/mo",
  },
];

export const Services = () => (
  <section id="services" data-testid="services-section" className="scroll-mt-24 pt-28 pb-24 md:pb-32">
    <div className="mx-auto max-w-7xl px-6 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 max-w-3xl"
      >
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#FF3333]">Our Services</p>
        <h2 data-testid="services-headline" className="font-heading text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
          Everything You Need to Grow Online.{" "}
          <span className="text-[#0A0A0A]/40">Starting with a Great Website.</span>
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        data-testid="service-featured-webdev"
        className="grid overflow-hidden border-2 border-[#0A0A0A] bg-white shadow-[8px_8px_0px_0px_#0a0a0a] md:grid-cols-2"
      >
        <div className="flex flex-col justify-center p-8 md:p-12">
          <span className="mb-5 inline-block w-fit bg-[#FF3333] px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
            Flagship Service
          </span>
          <h3 className="font-heading text-2xl font-black tracking-tight sm:text-3xl">
            Custom Website Development
          </h3>
          <p className="mt-5 leading-relaxed text-[#0A0A0A]/70">
            From basic landing pages to premium, highly functional web builds.
            We design fast, responsive websites built to convert, delivered
            with clear timelines and transparent pricing.
          </p>
          <ul className="mt-6 space-y-2 text-sm font-bold uppercase tracking-wide">
            {["Mobile-first & blazing fast", "Built-in Local SEO", "Clear timelines, no surprises"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="h-2 w-2 bg-[#FF3333]" /> {f}
              </li>
            ))}
          </ul>
          <a
            href={SITE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="service-webdev-link"
            className="group mt-8 inline-flex w-fit items-center gap-2 border-b-2 border-[#0A0A0A] pb-1 font-bold uppercase tracking-wide transition-colors hover:border-[#FF3333] hover:text-[#FF3333]"
          >
            Explore Web Packages
            <ArrowRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
        <div className="relative min-h-[280px] border-t-2 border-[#0A0A0A] md:border-l-2 md:border-t-0">
          <img
            src="https://images.unsplash.com/photo-1634084462412-b54873c0a56d?q=80&w=1400&auto=format&fit=crop"
            alt="Premium website design mockup"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </motion.div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {secondaryServices.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              data-testid={`service-card-${i + 2}`}
              className="group border border-[#0A0A0A]/20 bg-[#F0F0F0] p-8 transition-all hover:-translate-y-1 hover:border-[#0A0A0A] hover:bg-white hover:shadow-[4px_4px_0px_0px_#0a0a0a]"
            >
              <div className="mb-6 flex items-center justify-between">
                <Icon size={28} strokeWidth={2} className="text-[#0A0A0A]/60 transition-colors group-hover:text-[#FF3333]" />
                <span className="border border-[#0A0A0A]/30 px-2.5 py-1 text-[11px] font-black uppercase tracking-widest text-[#0A0A0A]/60">
                  {s.tag}
                </span>
              </div>
              <h3 className="font-heading text-xl font-black tracking-tight">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#0A0A0A]/60">{s.text}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);
