import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { SITE } from "@/constants/site";

const links = [
  { label: "Services", to: "/services" },
  { label: "Work", to: "/work" },
];

const RollingText = ({ text }: { text: string }) => (
  <span className="relative block overflow-hidden">
    <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full">
      {text}
    </span>
    <span
      aria-hidden="true"
      className="absolute inset-0 block translate-y-full text-[#FF3333] transition-transform duration-300 ease-out group-hover:translate-y-0"
    >
      {text}
    </span>
  </span>
);

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const wordRef = useRef<HTMLSpanElement>(null);
  const [wordWidth, setWordWidth] = useState(90);

  useEffect(() => {
    document.fonts.ready.then(() => {
      if (wordRef.current) setWordWidth(wordRef.current.scrollWidth);
    });
  }, []);

  const { scrollY } = useScroll();
  const rawWidth = useTransform(scrollY, [20, 160], [wordWidth, 0]);
  const rawOpacity = useTransform(scrollY, [20, 130], [1, 0]);
  const width = useSpring(rawWidth, { stiffness: 260, damping: 34 });
  const opacity = useSpring(rawOpacity, { stiffness: 260, damping: 34 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed left-4 right-4 top-4 z-50 md:left-10 md:right-auto md:top-6">
      <motion.header
        initial={{ y: -90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0A0A0A]/90 py-2.5 pl-4 pr-2 backdrop-blur-md md:justify-start md:gap-1 md:py-3 md:pl-5 md:pr-5"
      >
        <Link
          to="/"
          data-testid="nav-logo"
          className="flex items-baseline font-logo text-lg font-bold text-white md:text-xl"
          style={{ lineHeight: 1.2 }}
        >
          <span>S</span>
          <motion.span
            style={{ width, opacity, paddingTop: "0.35em", marginTop: "-0.35em" }}
            className="inline-block overflow-hidden whitespace-nowrap"
          >
            <span ref={wordRef} className="inline-block">
              HYARA
            </span>
          </motion.span>
          <span className="text-[#FF3333]">.</span>
        </Link>

        <span className="mx-3 hidden h-5 w-px bg-white/20 md:block" />

        <nav className="flex flex-1 items-center justify-evenly md:flex-none md:justify-start">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `group px-2.5 text-[11px] font-bold uppercase tracking-wide md:px-4 md:text-[13px] ${
                  isActive ? "text-[#FF3333]" : "text-white"
                }`
              }
            >
              <RollingText text={l.label} />
            </NavLink>
          ))}
          <a
            href={SITE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="nav-whatsapp-btn"
            className="group px-2.5 text-[11px] font-bold uppercase tracking-wide text-white md:px-4 md:text-[13px]"
          >
            <RollingText text="Contact" />
          </a>
        </nav>
      </motion.header>

      <AnimatePresence>
        {scrolled && (
          <motion.a
            key="nav-cta-pill"
            href={SITE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="nav-cta-pill"
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 hidden items-center gap-2.5 self-start rounded-xl bg-white px-5 py-3 text-[13px] font-bold uppercase tracking-wide text-[#0A0A0A] shadow-[0_8px_24px_rgba(0,0,0,0.18)] md:inline-flex"
          >
            <span className="h-2 w-2 rounded-full bg-[#25D366]" />
            Start a Project
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  );
};
