import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import hero from "@/assets/hero.jpg";
import interior from "@/assets/interior.jpg";
import cut from "@/assets/cut.jpg";
import color from "@/assets/color.jpg";
import styling from "@/assets/styling.jpg";
import mens from "@/assets/mens.jpg";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison — A Unisex Hair Atelier in Brooklyn" },
      { name: "description", content: "A unisex hair atelier for cut, color, grooming and care. Book a visit to Maison." },
      { property: "og:title", content: "Maison — A Unisex Hair Atelier" },
      { property: "og:description", content: "Cut, color, grooming and care, practiced with patience." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <Layout>
      {/* HERO */}
      <section className="relative min-h-screen flex items-end pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={hero}
            alt="Editorial portrait with soft hair"
            className="w-full h-full object-cover"
            width={1600}
            height={1920}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/40" />
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-8 w-full">
          <div className="grid md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-7 reveal">
              <p className="text-xs uppercase tracking-[0.3em] text-accent mb-6">Est. 2014 · Brooklyn · Unisex</p>
              <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[1.02] text-balance">
                Hair, made
                <br />
                <em className="text-accent not-italic font-display italic">quietly</em> beautiful.
              </h1>
            </div>
            <div className="md:col-span-4 md:col-start-9 reveal reveal-delay-2">
              <p className="text-base text-foreground/75 leading-relaxed max-w-sm">
                A unisex studio of stylists and barbers who believe in slow consultations, honest mirrors and work that suits the life you actually live.
              </p>
              <Link
                to="/contact"
                className="mt-7 inline-flex items-center gap-2 group text-sm tracking-wide"
              >
                <span className="link-underline">Book a visit</span>
                <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="py-10 border-y border-border overflow-hidden bg-secondary/40">
        <div className="flex marquee whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-16 px-8 font-display text-2xl text-foreground/40">
              <span>Balayage</span><span>·</span>
              <span>Precision Cut</span><span>·</span>
              <span>Skin Fade</span><span>·</span>
              <span>Beard Sculpt</span><span>·</span>
              <span>Bridal</span><span>·</span>
              <span>Olaplex</span><span>·</span>
              <span>Color Correction</span><span>·</span>
              <span>Hot Towel Shave</span><span>·</span>
            </div>
          ))}
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid md:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="md:col-span-6 reveal img-zoom">
            <img src={interior} alt="Maison salon interior" className="w-full aspect-[4/5] object-cover" loading="lazy" width={1600} height={1200} />
          </div>
          <div className="md:col-span-6 md:pl-8">
            <p className="reveal text-xs uppercase tracking-[0.3em] text-accent mb-5">Our philosophy</p>
            <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl leading-tight text-balance">
              We don't chase trends. We listen, and then we work.
            </h2>
            <p className="reveal reveal-delay-2 mt-6 text-foreground/70 leading-relaxed">
              Every appointment begins with a conversation. We study how your hair grows, how you wear it, and what you'd rather not think about each morning. Then we build a plan that holds up between visits.
            </p>
            <Link to="/about" className="reveal reveal-delay-3 mt-8 inline-flex items-center gap-2 text-sm group">
              <span className="link-underline">More about us</span>
              <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* SIGNATURE SERVICES */}
      <section className="py-24 sm:py-32 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="reveal text-xs uppercase tracking-[0.3em] text-accent mb-4">Signature services</p>
              <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl max-w-xl text-balance">Four rooms. One craft.</h2>
            </div>
            <Link to="/services" className="reveal reveal-delay-2 text-sm self-start md:self-end group inline-flex items-center gap-2">
              <span className="link-underline">View all services</span>
              <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { img: cut, kicker: "01", title: "The Cut", text: "Architecture for hair. Shapes built to grow out gracefully." },
              { img: color, kicker: "02", title: "Color", text: "Hand-painted balayage, lived-in tones and gentle correction." },
              { img: mens, kicker: "03", title: "Grooming", text: "Skin fades, scissor work, beard sculpting and hot-towel shaves." },
              { img: styling, kicker: "04", title: "Occasion", text: "Bridal, editorial and event styling, by quiet appointment." },
            ].map((s, i) => (
              <article
                key={s.title}
                className={`reveal reveal-delay-${i + 1} group`}
              >
                <Link to="/services" className="block img-zoom mb-5">
                  <img src={s.img} alt={s.title} className="w-full aspect-[4/5] object-cover" loading="lazy" width={1200} height={1500} />
                </Link>
                <div className="flex items-baseline gap-4">
                  <span className="text-xs text-accent tracking-widest">{s.kicker}</span>
                  <h3 className="text-2xl">{s.title}</h3>
                </div>
                <p className="mt-3 text-sm text-foreground/70 leading-relaxed">{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 text-center">
          <p className="reveal text-xs uppercase tracking-[0.3em] text-accent mb-6">Kind words</p>
          <blockquote className="reveal reveal-delay-1 font-display text-3xl sm:text-5xl leading-tight text-balance">
            "The first salon where I've felt heard before a single strand was touched. I left looking like the better version of myself."
          </blockquote>
          <p className="reveal reveal-delay-2 mt-8 text-sm tracking-wide text-foreground/60">
            — Elena R., guest since 2019
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid md:grid-cols-2 gap-10 items-end">
          <h2 className="reveal text-4xl sm:text-6xl leading-tight text-balance">
            Find a chair.<br />
            <em className="not-italic text-accent font-display italic">Stay a while.</em>
          </h2>
          <div className="reveal reveal-delay-1 md:text-right">
            <p className="text-primary-foreground/70 max-w-md md:ml-auto mb-7">
              New guests are welcomed by appointment. We hold time for a thorough consultation before any service begins.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-7 py-4 bg-accent text-accent-foreground hover:bg-primary-foreground hover:text-primary transition-colors duration-300 text-sm tracking-wide"
            >
              Reserve your visit
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
