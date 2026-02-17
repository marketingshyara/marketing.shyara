import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, Clock, ArrowRight } from "lucide-react";

export default function Contact() {
  const openWhatsApp = () => {
    window.open(
      "https://wa.me/919584661610?text=Hi%2C%20I%27d%20like%20to%20discuss%20your%20services.",
      "_blank"
    );
  };

  return (
    <Layout>
      <SEO 
        title="Contact Us"
        description="Get in touch with Shyara Marketing. Reach out to us directly via WhatsApp or email and let us help you choose the right digital marketing and technology solution for your business."
        canonical="/contact"
        keywords="contact digital marketing agency, hire marketing company, get quote website development, digital marketing consultation, Shyara Marketing contact"
      />

      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Get in Touch
            </h1>
            <p className="text-lg text-muted-foreground">
              Reach out to us directly - we're just a message away.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="pb-20">
        <div className="container">
          <div className="max-w-xl mx-auto space-y-6">

            {/* WhatsApp CTA */}
            <Button
              onClick={openWhatsApp}
              className="w-full justify-start h-auto py-5 px-6 bg-[#25D366] hover:bg-[#1fb855] text-white rounded-xl"
            >
              <MessageCircle className="h-7 w-7 mr-4 flex-shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-base">Chat on WhatsApp</div>
                <div className="text-sm opacity-90">Quick response within hours</div>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 opacity-70" />
            </Button>

            {/* Email */}
            <a
              href="mailto:marketing.shyara@gmail.com"
              className="flex items-center w-full h-auto py-5 px-6 rounded-xl border border-border bg-card hover:bg-secondary transition-colors"
            >
              <Mail className="h-7 w-7 mr-4 text-accent flex-shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-foreground">Email Us</div>
                <div className="text-sm text-muted-foreground">marketing.shyara@gmail.com</div>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
            </a>

            {/* Response Time Info */}
            <div className="rounded-xl border border-border bg-secondary/50 p-6 flex items-start gap-4">
              <Clock className="h-6 w-6 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Response Time</h3>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 2-4 hours during business hours (IST).
                  For urgent inquiries, WhatsApp is the fastest way to reach us.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}
