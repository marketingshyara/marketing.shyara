import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { SITE } from "@/constants/site";

const legalLinks = [
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms-of-service", label: "Terms of Service" },
  { to: "/refund-policy", label: "Refund Policy" },
  { to: "/service-delivery-policy", label: "Service Delivery" },
] as const;

export const Footer = () => (
  <footer data-testid="footer" className="border-t border-white/15 bg-[#0A0A0A] py-12 text-white">
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 md:flex-row md:items-start md:justify-between md:px-12">
      <div>
        <p className="font-logo text-2xl tracking-wide">
          SHYARA<span className="text-[#FF3333]">.</span>
        </p>
        <p className="mt-2 max-w-xs text-sm text-white/50">
          Websites that work, marketing that scales. Built for businesses across India.
        </p>
        <img 
          src="/msme-logo.png" 
          alt="MSME Registered" 
          className="mt-6 max-h-[40px] w-auto object-contain grayscale invert opacity-70 transition-all hover:opacity-100" 
        />
      </div>

      <div className="flex flex-col gap-3 text-sm">
        <a
          href={`mailto:${SITE.email}`}
          data-testid="footer-email-link"
          className="flex items-center gap-2 font-bold text-white/70 transition-colors hover:text-[#FF3333]"
        >
          <Mail size={16} /> {SITE.email}
        </a>
        <a
          href={`tel:${SITE.phone.replace(/\s/g, "")}`}
          data-testid="footer-phone-link"
          className="flex items-center gap-2 font-bold text-white/70 transition-colors hover:text-[#FF3333]"
        >
          <Phone size={16} /> {SITE.phone}
        </a>
      </div>

      <div className="flex flex-col gap-2 text-sm font-bold uppercase tracking-wide">
        <Link to="/services" className="text-white/70 transition-colors hover:text-[#FF3333]">
          Services
        </Link>
        <Link to="/work" className="text-white/70 transition-colors hover:text-[#FF3333]">
          Work
        </Link>
        <Link
          to="/contact"
          data-testid="footer-contact-link"
          className="text-white/70 transition-colors hover:text-[#FF3333]"
        >
          Contact
        </Link>
        <Link
          to="/portal/login"
          data-testid="footer-sales-portal-link"
          className="text-white/70 transition-colors hover:text-[#FF3333]"
        >
          Sales portal
        </Link>
      </div>

      <div className="flex flex-col gap-2 text-xs font-bold uppercase tracking-wide text-white/50">
        {legalLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="transition-colors hover:text-[#FF3333]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
    <div className="mx-auto mt-10 max-w-7xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-white/10 px-6 pt-6 pb-6 text-xs uppercase tracking-widest text-white/30 md:px-12">
      <span>© {new Date().getFullYear()} Shyara Marketing. All rights reserved.</span>
      <span className="select-all">GSTIN:10ABSCS1802N1Z8</span>
    </div>
  </footer>
);
