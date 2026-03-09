import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Target, Shield, MessageCircle } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Execution-Driven",
    description: "We focus on delivering results, not just plans. Every strategy is backed by clear action and measurable outcomes.",
  },
  {
    icon: Shield,
    title: "Transparent Communication",
    description: "No hidden agendas and no jargon. We keep you informed at every step with clear communication.",
  },
  {
    icon: Users,
    title: "Long-Term Partnerships",
    description: "We build relationships, not just projects. Your success is our success, and we are here for the long run.",
  },
  {
    icon: CheckCircle,
    title: "Quality Over Quantity",
    description: "We take on projects we can execute well. Every client gets focused attention and strong delivery.",
  },
];

const workingWithUs = [
  {
    title: "Free initial consultation",
    description: "No pressure and no hard pitch. We listen to your goals and tell you honestly what will work.",
  },
  {
    title: "A written plan before any payment",
    description: "We share a clear scope document with deliverables, timeline, and pricing before you commit.",
  },
  {
    title: "Regular WhatsApp updates",
    description: "You are never left guessing. We update you at every meaningful milestone.",
  },
  {
    title: "Results you can see",
    description: "Reports, links, and screenshots every month. You always know what has been delivered.",
  },
  {
    title: "No lock-in contracts for recurring services",
    description: "Monthly billing. If we are not delivering value, you can stop. We earn your business every month.",
  },
];

export default function About() {
  const openWhatsApp = () => {
    window.open(
      "https://wa.me/919584661610?text=Hi%20Shyara%20Marketing%2C%20I%20read%20about%20your%20approach%20and%20I%27d%20like%20to%20have%20an%20initial%20conversation%20about%20my%20business.%20When%20can%20we%20talk%3F",
      "_blank"
    );
  };

  return (
    <Layout>
      <SEO
        title="About Us"
        description="Shyara Marketing is a digital marketing and technology services brand under Shyara Tech Solutions (OPC) Pvt. Ltd., built on trust, clarity, and execution."
        canonical="/about"
        keywords="Shyara Tech Solutions, digital marketing agency India, marketing company, technology services, about Shyara Marketing, digital agency"
      />

      <PageHero
        label="About Shyara Marketing"
        title={<>We Help Businesses Grow <span className="text-accent">Without the Confusion.</span></>}
        description="A digital marketing and technology brand under Shyara Tech Solutions (OPC) Pvt. Ltd., built on trust, clarity, and practical execution."
        trustPoints={["Registered Indian company", "Transparent delivery model", "Long-term growth focus"]}
      />

      <section className="py-20 lg:py-28 bg-[hsl(var(--surface))]">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            <div className="rounded-xl border-l-4 border-accent bg-accent/5 p-7">
              <h3 className="font-semibold text-foreground mb-3">Why We Started</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We saw too many small businesses paying for digital marketing and getting nothing measurable back.
                No clarity on what was being done, no honest reporting, and only vague promises. We built Shyara
                Marketing to be the opposite: transparent, execution-focused, and accountable.
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">What We Do</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We combine strategic thinking with practical execution across social media management, advertising,
                  website development, and app development. No over-promising and no under-delivering.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Who We Serve</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Based in India and serving clients globally, we work with local businesses building their first
                  digital presence and scaling brands looking for a reliable partner.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <span className="section-label block mb-3">Our Values</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              The Principles That Guide Everything We Do
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="absolute top-4 right-4 text-5xl font-extrabold text-accent/10 leading-none select-none">
                  0{index + 1}
                </span>
                <div className="icon-well mb-4">
                  <value.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-[hsl(var(--surface))]">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="mb-12">
              <span className="section-label block mb-3">Working With Us</span>
              <h2 className="text-3xl font-bold text-foreground">What to Expect When You Work With Us</h2>
              <p className="text-muted-foreground mt-2">
                No surprises and no vagueness. Just a clear process from start to finish.
              </p>
            </div>
            <div className="relative pl-10">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-accent/30" />
              {workingWithUs.map((item, i) => (
                <div key={item.title} className={`relative ${i < workingWithUs.length - 1 ? "mb-9" : ""}`}>
                  <div className="absolute -left-[2.1rem] w-4 h-4 rounded-full bg-card border-2 border-accent/40 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Let&apos;s Talk About Your Business</h2>
          <p className="text-muted-foreground mb-6">
            The first conversation is always free. Tell us where you are stuck and we will tell you exactly how we can help.
          </p>
          <Button
            onClick={openWhatsApp}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Start a Conversation
          </Button>
        </div>
      </section>
    </Layout>
  );
}
