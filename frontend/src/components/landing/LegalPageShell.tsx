import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function LegalPageShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <>
      <section className="border-b-2 border-[#0A0A0A] py-20 pt-28">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl px-6 text-center md:px-12"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#FF3333]">Legal</p>
          <h1 className="font-heading text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-2 text-sm text-[#0A0A0A]/60">Last updated: 2025</p>
        </motion.div>
      </section>
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-6 md:px-12">
          <div className="space-y-6 text-[#0A0A0A]/80">{children}</div>
        </div>
      </section>
    </>
  );
}
