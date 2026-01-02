import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";

export default function TermsOfService() {
  return (
    <Layout>
      <SEO 
        title="Terms of Service"
        description="Read the terms and conditions for using Shyara Marketing services including social media management, advertising, website, and app development."
        canonical="/terms-of-service"
        keywords="terms of service, service agreement, Shyara Marketing terms, terms and conditions"
      />
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Terms of Service
            </h1>
            <p className="text-muted-foreground mb-8">Last updated: 2025</p>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
              <p className="text-foreground leading-relaxed">
                By accessing or using Shyara Marketing's website and services, you agree to these Terms of Service.
              </p>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Services</h2>
                <p className="text-muted-foreground leading-relaxed">Shyara Marketing provides:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Social Media Management</li>
                  <li>Advertising Campaign Management</li>
                  <li>Website Development</li>
                  <li>App Development</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Services may be offered as subscriptions or one-time engagements, depending on scope.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Client Responsibilities</h2>
                <p className="text-muted-foreground leading-relaxed">Clients agree to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Provide accurate information</li>
                  <li>Share required assets and access on time</li>
                  <li>Communicate approvals and feedback promptly</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Payments</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Payments may be monthly, milestone-based, or one-time</li>
                  <li>Pricing and scope are communicated before engagement</li>
                  <li>Services begin only after payment confirmation</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All strategies, creatives, designs, and deliverables remain the property of Shyara Marketing until full payment is received, unless otherwise agreed in writing.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Shyara Marketing shall not be liable for indirect, incidental, or consequential damages arising from service use or performance.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Modifications</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to update these terms at any time. Continued use of services constitutes acceptance of revised terms.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These terms are governed by the laws of India.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
