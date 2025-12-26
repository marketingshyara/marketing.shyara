import { Link } from "react-router-dom";
import shyaraLogo from "@/assets/shyara-logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <div className="h-7 w-18 overflow-hidden flex items-center justify-center">
                <img 
                  src={shyaraLogo} 
                  alt="Shyara" 
                  className="h-18 w-auto dark:invert" 
                />
              </div>
              <span className="text-xl font-bold text-accent">Marketing</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              We help businesses grow through social media, advertising, websites, and apps — 
              with clarity, consistency, and measurable results.
            </p>
            <p className="text-muted-foreground text-sm mt-4">
              A brand under Shyara Tech Solutions (OPC) Pvt. Ltd.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Social Media Management
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Ads Campaign Management
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Website Development
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  App Development
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-4">
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
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Shyara Marketing. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
