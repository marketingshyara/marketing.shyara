import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { CheckCircle, Users, Target, Shield } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Execution-Driven",
    description: "We focus on delivering results, not just plans. Every strategy is backed by clear action and measurable outcomes.",
  },
  {
    icon: Shield,
    title: "Transparent Communication",
    description: "No hidden agendas, no jargon. We keep you informed at every step with honest, clear communication.",
  },
  {
    icon: Users,
    title: "Long-Term Partnerships",
    description: "We build relationships, not just projects. Your success is our success, and we're here for the long run.",
  },
  {
    icon: CheckCircle,
    title: "Quality Over Quantity",
    description: "We take on projects we can execute excellently. Every client gets our full attention and best work.",
  },
];

export default function About() {
  return (
    <Layout>
      <SEO 
        title="About Us"
        description="Shyara Marketing is a digital marketing and technology services brand under Shyara Tech Solutions (OPC) Pvt. Ltd., built on trust, clarity, and execution."
        canonical="/about"
        keywords="Shyara Tech Solutions, digital marketing agency India, marketing company, technology services, about Shyara Marketing, digital agency"
      />
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About Shyara Marketing
            </h1>
            <p className="text-lg text-muted-foreground">
              A digital marketing and technology services brand built on trust, clarity, and execution.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="pb-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg dark:prose-invert">
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Shyara Marketing is a brand under Shyara Tech Solutions (OPC) Pvt. Ltd., 
                dedicated to helping businesses grow through digital excellence. We combine 
                strategic thinking with practical execution to deliver real results.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Based in India and serving clients globally, we understand the diverse needs 
                of modern businesses. Whether you're a startup looking to establish your digital 
                presence or an established brand seeking to scale, we provide tailored solutions 
                that align with your goals.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our approach is simple: understand deeply, plan carefully, execute flawlessly, 
                and communicate openly. We don't believe in over-promising or under-delivering. 
                Every commitment we make is backed by our reputation and dedication to your success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <div 
                key={value.title}
                className="bg-card rounded-xl border border-border p-6 animate-fade-in-up opacity-0"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Note */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Working With Us
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              When you work with Shyara Marketing, you're not just hiring a service provider — 
              you're gaining a dedicated partner invested in your growth.
            </p>
            <p className="text-muted-foreground">
              We believe in building relationships based on trust, delivering what we promise, 
              and always being transparent about what's working and what needs adjustment.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
