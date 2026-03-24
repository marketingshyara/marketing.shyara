import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function Careers() {
  return (
    <Layout>
      <SEO
        title="Careers"
        description="Join Shyara Marketing. We're hiring for Sales Executive and other roles. Send your resume to hr.shyara@gmail.com."
        canonical="/careers"
        keywords="careers Shyara Marketing, jobs digital marketing, Sales Executive hiring, Shyara Marketing jobs"
      />

      <PageHero
        label="Careers"
        title={<>Join Our <span className="text-accent">Team.</span></>}
        description="We're building a team that delivers clarity and results. If you're a fit, we'd love to hear from you."
      />

      <section className="py-20 lg:py-28 bg-background">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-section font-bold text-foreground mb-8">Open Positions</h2>
            <div className="rounded-card border border-border bg-card shadow-card p-6 md:p-8">
              <h3 className="text-xl font-semibold text-foreground mb-2">Sales Executive</h3>
              <p className="text-body text-muted-foreground mb-6">
                We're looking for a Sales Executive to help us connect with businesses that need our services. Send your resume and we'll get back to you.
              </p>
              <a href="mailto:hr.shyara@gmail.com">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                  <Mail className="h-4 w-4" />
                  Email your resume to hr.shyara@gmail.com
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
