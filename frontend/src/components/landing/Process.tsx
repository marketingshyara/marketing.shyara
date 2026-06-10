import { motion } from "framer-motion";
import { Search, FileText, Hammer, TrendingUp, type LucideIcon } from "lucide-react";
import { ScrollTimeline } from "@/components/landing/ScrollTimeline";

const steps: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Search,
    title: "Discovery",
    text: "Free consultation. We map out your goals and technical requirements before recommending a single thing.",
  },
  {
    icon: FileText,
    title: "Strategy & Scope",
    text: "You receive clear deliverables, wireframes, timelines, and pricing in writing.",
  },
  {
    icon: Hammer,
    title: "Build & Execute",
    text: "We design, develop, and launch. You stay in the loop with regular WhatsApp updates.",
  },
  {
    icon: TrendingUp,
    title: "Review & Grow",
    text: "Your site is live. Now we track the data, launch campaigns, and adjust based on real feedback.",
  },
];

export const Process = () => (
  <section id="process" data-testid="process-section" className="py-24 md:py-32">
    <div className="mx-auto max-w-7xl px-6 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 max-w-3xl"
      >
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#FF3333]">The Process</p>
        <h2 data-testid="process-headline" className="font-heading text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
          How We Take Your Project{" "}
          <span className="text-[#0A0A0A]/40">From Vision to Launch.</span>
        </h2>
      </motion.div>

      <ScrollTimeline steps={steps} />
    </div>
  </section>
);
