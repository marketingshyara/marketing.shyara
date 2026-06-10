import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { SITE } from "@/constants/site";

export const FinalCTA = () => (
  <section data-testid="final-cta-section" className="border-t-2 border-[#0A0A0A] bg-[#0A0A0A] py-24 text-white md:py-32">
    <div className="mx-auto max-w-7xl px-6 text-center md:px-12">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        data-testid="final-cta-headline"
        className="font-heading mx-auto max-w-4xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
      >
        Ready for a Website That Actually{" "}
        <span className="text-[#FF3333]">Grows Your Business?</span>
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mx-auto mt-6 max-w-xl text-base text-white/70 md:text-lg"
      >
        Let's build something great. The first consultation is always free,
        with zero commitment required.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-10"
      >
        <a
          href={SITE.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="final-cta-whatsapp-btn"
          className="inline-flex items-center gap-3 bg-[#25D366] px-10 py-5 font-bold uppercase tracking-wide text-white transition-all hover:-translate-y-1 hover:bg-[#1DA851] hover:shadow-[5px_5px_0px_0px_#ffffff]"
        >
          <MessageCircle size={22} strokeWidth={2.5} />
          Start a WhatsApp Conversation
        </a>
      </motion.div>
    </div>
  </section>
);
