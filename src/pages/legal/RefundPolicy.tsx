import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";

export default function RefundPolicy() {
  return (
    <Layout>
      <SEO 
        title="Refund & Cancellation Policy"
        description="Understand Shyara Marketing's refund and cancellation policy for digital marketing and technology services, subscriptions, and one-time engagements."
        canonical="/refund-policy"
        keywords="refund policy, cancellation policy, payment terms, Shyara Marketing refund"
      />
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Refund & Cancellation Policy
            </h1>
            <p className="text-muted-foreground mb-8">Last updated: 2025</p>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
              <p className="text-foreground leading-relaxed">
                Shyara Marketing aims to maintain transparency and fairness in all commercial engagements.
              </p>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Nature of Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All services are digital, time-based, and customized to client requirements.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Refund Policy</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Payments are non-refundable once service execution has started</li>
                  <li>If a payment is made by mistake or due to a technical error, refund requests may be reviewed on a case-by-case basis</li>
                  <li>Approved refunds will be processed within 7–10 business days to the original payment method</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Subscription Cancellation</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Subscriptions can be canceled before the next billing cycle</li>
                  <li>No refunds are issued for partially completed or active billing periods</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For refund or cancellation queries, contact:<br />
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
