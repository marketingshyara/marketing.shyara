import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Phone, TrendingUp } from "lucide-react";
import { SITE } from "@/constants/site";

const ticker = [
  "Custom Websites",
  "Landing Pages",
  "E-Commerce",
  "Local SEO",
  "Ads Management",
  "Social Media",
  "App Development",
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const INTRO_KEY = "shyara-intro-shown";

const Word = ({
  children,
  base,
  delay,
  className = "",
  reduceMotion,
}: {
  children: React.ReactNode;
  base: number;
  delay: number;
  className?: string;
  reduceMotion: boolean;
}) => {
  if (reduceMotion) {
    return <span className={`inline-block ${className}`}>{children}</span>;
  }

  return (
    <span
      className="inline-block overflow-hidden align-bottom"
      style={{ padding: "0.12em 0.08em", margin: "-0.12em -0.08em" }}
    >
      <motion.span
        initial={{ y: "115%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.75, delay: base + delay, ease: EASE }}
        className={`inline-block ${className}`}
      >
        {children}
      </motion.span>
    </span>
  );
};

export const Hero = () => {
  const reduceMotion = useReducedMotion() ?? false;
  const introShown =
    typeof sessionStorage !== "undefined" && sessionStorage.getItem(INTRO_KEY);
  const BASE = reduceMotion ? 0 : introShown ? 0.15 : 2.75;

  const rise = (delay: number, x = 0, y = 30) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, x, y },
          animate: { opacity: 1, x: 0, y: 0 },
          transition: { duration: 0.6, delay: BASE + delay, ease: EASE },
        };

  return (
    <section className="relative flex min-h-[100dvh] min-h-[100svh] flex-col overflow-hidden">
      <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-14 px-6 pb-12 pt-28 md:grid-cols-12 md:px-12 md:pb-16 md:pt-32">
        <div className="md:col-span-7">
          <motion.p
            {...rise(0.05, -50, 0)}
            data-testid="hero-badge"
            className="mb-6 inline-block border-2 border-[#0A0A0A] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]"
          >
            Web Development Studio + Growth Marketing
          </motion.p>

          <h1
            data-testid="hero-headline"
            className="font-heading text-4xl font-black leading-[1.05] tracking-tighter sm:text-5xl lg:text-6xl"
          >
            <Word base={BASE} delay={0.08} reduceMotion={reduceMotion}>
              We
            </Word>{" "}
            <Word base={BASE} delay={0.14} reduceMotion={reduceMotion}>
              Build
            </Word>{" "}
            <Word base={BASE} delay={0.2} reduceMotion={reduceMotion}>
              Websites
            </Word>
            <br />
            <Word base={BASE} delay={0.28} reduceMotion={reduceMotion}>
              That
            </Word>{" "}
            <Word base={BASE} delay={0.34} className="text-[#FF3333]" reduceMotion={reduceMotion}>
              Work.
            </Word>
          </h1>

          <motion.p
            {...rise(0.5)}
            data-testid="hero-subheadline"
            className="mt-6 max-w-md text-base leading-relaxed text-[#0A0A0A]/70 md:text-lg"
          >
            Fast, conversion-focused websites, backed by the ads and social
            media that send traffic their way.
          </motion.p>

          <motion.div {...rise(0.6)} className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to="/work"
              data-testid="hero-primary-cta"
              className="group inline-flex items-center justify-center gap-2 whitespace-nowrap border-2 border-[#0A0A0A] bg-[#FF3333] px-8 py-4 font-bold uppercase tracking-wide text-white transition-all hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_#0a0a0a]"
            >
              View Our Website Portfolio
              <ArrowRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={SITE.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="hero-secondary-cta"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap border-2 border-[#0A0A0A] bg-transparent px-8 py-4 font-bold uppercase tracking-wide transition-all hover:bg-[#0A0A0A] hover:text-white"
            >
              <Phone size={18} strokeWidth={2.5} /> Book a Free Discovery Call
            </a>
          </motion.div>
        </div>

        <motion.div
          {...(reduceMotion
            ? {}
            : {
                initial: { opacity: 0, x: 70 },
                animate: { opacity: 1, x: 0 },
                transition: { duration: 0.8, delay: BASE + 0.35, ease: EASE },
              })}
          data-testid="hero-visual"
          className="relative hidden md:col-span-5 md:block"
        >
          <motion.span
            aria-hidden="true"
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={reduceMotion ? undefined : { repeat: Infinity, duration: 16, ease: "linear" }}
            className="absolute -left-10 -top-12 z-0 text-7xl font-black text-[#FF3333]"
          >
            ✱
          </motion.span>

          <div className="relative z-10 border-2 border-[#0A0A0A] bg-white shadow-[10px_10px_0px_0px_#FF3333]">
            <div className="flex items-center gap-1.5 border-b-2 border-[#0A0A0A] bg-[#F5F5F5] px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
              <span className="ml-3 flex-1 bg-white px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]/40">
                yourbusiness.in
              </span>
            </div>
            <img
              src="https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1200&auto=format&fit=crop"
              alt="Website design preview"
              className="h-[340px] w-full object-cover"
            />
          </div>

          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
            transition={reduceMotion ? undefined : { repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            data-testid="hero-float-stat"
            className="absolute -right-5 -top-7 z-20 flex items-center gap-3 border-2 border-[#0A0A0A] bg-[#0A0A0A] px-4 py-3 text-white"
          >
            <TrendingUp size={22} strokeWidth={2.5} className="text-[#FF3333]" />
            <div>
              <p className="font-heading text-lg font-black leading-none">+128%</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/60">Avg. Client Traffic</p>
            </div>
          </motion.div>

          <motion.div
            animate={reduceMotion ? undefined : { y: [0, 9, 0] }}
            transition={
              reduceMotion ? undefined : { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.8 }
            }
            data-testid="hero-float-enquiry"
            className="absolute -bottom-8 -left-7 z-20 flex items-center gap-3 border-2 border-[#0A0A0A] bg-white px-4 py-3 shadow-[4px_4px_0px_0px_#0a0a0a]"
          >
            <span className="flex h-9 w-9 items-center justify-center bg-[#25D366]">
              <MessageCircle size={18} strokeWidth={2.5} className="text-white" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wide">New Enquiry</p>
              <p className="text-[11px] text-[#0A0A0A]/50">"Need a website for my clinic"</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        {...(reduceMotion
          ? {}
          : {
              initial: { opacity: 0, y: 28 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.6, delay: BASE + 0.65, ease: EASE },
            })}
        className="overflow-hidden border-y-2 border-[#0A0A0A] bg-white py-3"
        data-testid="hero-ticker"
      >
        <div className="animate-marquee flex w-max whitespace-nowrap">
          {[...ticker, ...ticker].map((item, i) => (
            <span key={i} className="flex items-center text-sm font-bold uppercase tracking-widest">
              <span className="px-6">{item}</span>
              <span className="text-[#FF3333]">✱</span>
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
