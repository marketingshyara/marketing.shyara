import { Layout } from "@/components/Layout";

export default function ServiceDeliveryPolicy() {
  return (
    <Layout>
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Service Delivery Policy
            </h1>
            <p className="text-muted-foreground mb-8">Last updated: 2025</p>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
              <p className="text-foreground leading-relaxed">
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
