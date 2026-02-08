import { useState } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const services = [
  "Social Media Management",
  "Ads Campaign Management",
  "Website Development",
  "App Development",
  "Multiple Services",
  "Other",
];

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const openWhatsApp = () => {
    window.open(
      "https://wa.me/919584661610?text=Hi%2C%20I%27d%20like%20to%20discuss%20your%20services.",
      "_blank"
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: "Missing details",
        description: "Please fill in all the required fields before sending.",
        variant: "destructive",
      });
      return;
    }
    
    // Build a well-formatted WhatsApp message from form data
    const lines = [
      `Hello, I'm *${formData.name.trim()}*.`,
      ``,
      `*Service Interested In:* ${formData.service || "General Inquiry"}`,
      ``,
      `*Message:*`,
      formData.message.trim(),
      ``,
      `--- Contact Details ---`,
      `*Email:* ${formData.email.trim()}`,
    ];

    if (formData.phone.trim()) {
      lines.push(`*Phone:* ${formData.phone.trim()}`);
    }

    const message = lines.join("\n");

    window.open(
      `https://wa.me/919584661610?text=${encodeURIComponent(message)}`,
      "_blank"
    );

    toast({
      title: "Redirecting to WhatsApp",
      description: "Your message is ready - just hit send on WhatsApp!",
    });

    // Reset form after submission
    setFormData({
      name: "",
      email: "",
      phone: "",
      service: "",
      message: "",
    });
  };

  return (
    <Layout>
      <SEO 
        title="Contact Us"
        description="Get in touch with Shyara Marketing. Share your requirements and let us help you choose the right digital marketing and technology solution for your business."
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
              Fill in your details below and we'll connect with you on WhatsApp instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pb-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Form */}
            <div className="bg-card rounded-xl border border-border p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 9999999999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">Service Interested In</Label>
                  <Select
                    value={formData.service}
                    onValueChange={(value) => setFormData({ ...formData, service: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your project or requirements..."
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#25D366] hover:bg-[#1fb855] text-white"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Send via WhatsApp
                  <Send className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  You'll be redirected to WhatsApp with your message pre-filled. Just tap send!
                </p>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Quick Connect
                </h2>
                <p className="text-muted-foreground mb-8">
                  Prefer a faster response? Reach out to us directly via WhatsApp or email.
                </p>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={openWhatsApp}
                  className="w-full justify-start h-auto py-4 px-6 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <MessageCircle className="h-6 w-6 mr-4" />
                  <div className="text-left">
                    <div className="font-semibold">WhatsApp</div>
                    <div className="text-sm opacity-80">Quick response within hours</div>
                  </div>
                </Button>

                <a 
                  href="mailto:marketing.shyara@gmail.com"
                  className="flex items-center w-full justify-start h-auto py-4 px-6 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
                >
                  <Mail className="h-6 w-6 mr-4 text-accent" />
                  <div className="text-left">
                    <div className="font-semibold text-foreground">Email</div>
                    <div className="text-sm text-muted-foreground">marketing.shyara@gmail.com</div>
                  </div>
                </a>
              </div>

              <div className="bg-secondary/50 rounded-xl p-6 mt-8">
                <h3 className="font-semibold text-foreground mb-2">Response Time</h3>
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
