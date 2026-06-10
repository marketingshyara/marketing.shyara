import { motion } from "framer-motion";

export const PortfolioHeader = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="mb-16 max-w-3xl"
  >
    <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#FF3333]">Our Work</p>
    <h2 data-testid="portfolio-headline" className="font-heading text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
      Don't Just Take Our Word For It.
      <br />
      <span className="text-[#0A0A0A]/40">See What We've Built.</span>
    </h2>
    <p className="mt-5 text-base text-[#0A0A0A]/70 md:text-lg">
      Real websites designed for real businesses.
    </p>
  </motion.div>
);
