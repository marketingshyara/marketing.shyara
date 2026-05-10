import { Link } from "react-router-dom";
import { MessageCircle, Mail } from "lucide-react";
import shyaraLogo from "@/assets/shyara-logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src={shyaraLogo}
                alt="Shyara"
                className="h-9 w-auto dark:invert"
              />
              <span className="text-xl font-extrabold tracking-tight text-accent">Marketing</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              We help businesses grow through social media, advertising, websites, and apps —
              with clarity, consistency, and measurable results.
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              A brand under Shyara Tech Solutions (OPC) Pvt. Ltd.
            </p>
            <div className="flex flex-col gap-2 mt-5">
              <a
                href="https://wa.me/919584661610"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-accent" />
                WhatsApp
              </a>
              <a
                href="mailto:marketing.shyara@gmail.com"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                <Mail className="h-4 w-4 text-accent" />
                marketing.shyara@gmail.com
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Home" },
                { to: "/services", label: "Services" },
                { to: "/about", label: "About" },
                { to: "/careers", label: "Careers" },
                { to: "/contact", label: "Contact" },
                { to: "/offers", label: "Offers" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">Services</h4>
            <ul className="space-y-2">
              {[
                { to: "/services/social-media", label: "Social Media Management" },
                { to: "/services/ads-campaign-management", label: "Ads Campaign Management" },
                { to: "/services/website-development", label: "Website Development" },
                { to: "/services/app-development", label: "App Development" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portfolio */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">Portfolio</h4>
            <ul className="space-y-2">
              {[
                { to: "/samples/websites", label: "Website Samples" },
                { to: "/offers", label: "Current Offers" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
            <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-accent transition-colors">
              Terms of Service
            </Link>
            <Link to="/refund-policy" className="text-sm text-muted-foreground hover:text-accent transition-colors">
              Refund & Cancellation Policy
            </Link>
            <Link to="/service-delivery-policy" className="text-sm text-muted-foreground hover:text-accent transition-colors">
              Service Delivery Policy
            </Link>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-right flex-shrink-0">
            © {new Date().getFullYear()} Shyara Tech Solutions (OPC) Pvt. Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
}
