import { motion } from "framer-motion";

const stats = [
  { value: "50+", label: "Scaling Brands Trust Us" },
  { value: "100+", label: "Projects Delivered" },
  { value: "5+", label: "Years Building Digital Solutions" },
];

export const SocialProofBar = () => (
  <section data-testid="social-proof-bar" className="border-b-2 border-[#0A0A0A] bg-[#0A0A0A] text-white">
    <div className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-3">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.12 }}
          data-testid={`social-proof-stat-${i + 1}`}
          className="flex items-baseline justify-center gap-3 border-b border-white/15 px-6 py-7 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
        >
          <span className="font-heading text-3xl font-black tracking-tighter text-[#FF3333] md:text-4xl">
            {s.value}
          </span>
          <span className="text-sm font-bold uppercase tracking-wide text-white/80">{s.label}</span>
        </motion.div>
      ))}
    </div>
  </section>
);
