import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";

export default function ServiceDeliveryPolicy() {
  return (
    <Layout>
      <SEO 
        title="Service Delivery Policy"
        description="Learn how Shyara Marketing delivers digital marketing and technology services including timelines, delivery methods, and support."
        canonical="/service-delivery-policy"
        keywords="service delivery, digital service delivery, online marketing delivery, Shyara Marketing delivery"
      />
      <section className="gradient-hero py-20 lg:py-28 border-b border-border/60">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="section-label block mb-3">Legal</span>
            <h1 className="text-hero font-bold text-foreground md:text-display mb-2">
              Service Delivery Policy
            </h1>
            <p className="text-body text-muted-foreground">Last updated: 2025</p>
          </div>
        </div>
      </section>
      <section className="py-16 lg:py-20 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
              <p className="text-body text-foreground leading-relaxed">
                Shyara Marketing delivers digital marketing and technology services only. No physical goods are shipped.
              </p>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Delivery Method</h2>
                <p className="text-muted-foreground leading-relaxed">Services are delivered via:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Social media platforms</li>
                  <li>Advertising dashboards</li>
                  <li>Websites and apps</li>
                  <li>Email communication</li>
                  <li>Online project tools</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Timelines</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Timelines vary based on service scope and complexity</li>
                  <li>Delivery schedules are communicated during onboarding or proposal discussions</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Access & Credentials</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Clients are responsible for providing required access to platforms (social media, ads, hosting, etc.) for service delivery.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Support</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For delivery-related concerns, contact:<br />
                  Email: <a href="mailto:marketing.shyara@gmail.com" className="text-accent hover:underline">marketing.shyara@gmail.com</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
