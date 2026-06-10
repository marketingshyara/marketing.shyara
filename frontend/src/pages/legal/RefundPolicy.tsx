import { SEO } from "@/components/SEO";
import { LegalPageShell } from "@/components/landing/LegalPageShell";

export default function RefundPolicy() {
  return (
    <>
      <SEO 
        title="Refund & Cancellation Policy"
        description="Understand Shyara Marketing's refund and cancellation policy for digital marketing and technology services, subscriptions, and one-time engagements."
        shareTitle="Shyara — Refunds"
        shareDescription="Refund & cancellation policy."
        canonical="/refund-policy"
        keywords="refund policy, cancellation policy, payment terms, Shyara Marketing refund"
      />
      <LegalPageShell title="Refund & Cancellation Policy">
              <p className="leading-relaxed">
                Shyara Marketing aims to maintain transparency and fairness in all commercial engagements.
              </p>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Nature of Services</h2>
                <p className="leading-relaxed">
                  All services are digital, time-based, and customized to client requirements.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Refund Policy</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Payments are non-refundable once service execution has started</li>
                  <li>If a payment is made by mistake or due to a technical error, refund requests may be reviewed on a case-by-case basis</li>
                  <li>Approved refunds will be processed within 7–10 business days to the original payment method</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Subscription Cancellation</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Subscriptions can be canceled before the next billing cycle</li>
                  <li>No refunds are issued for partially completed or active billing periods</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Contact</h2>
                <p className="leading-relaxed">
                  For refund or cancellation queries, contact:<br />
                  Email: <a href="mailto:marketing.shyara@gmail.com" className="font-bold text-[#FF3333] hover:underline">marketing.shyara@gmail.com</a>
                </p>
              </section>
      </LegalPageShell>
    </>
  );
}
