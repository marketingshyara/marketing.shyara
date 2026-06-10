import { SEO } from "@/components/SEO";
import { LegalPageShell } from "@/components/landing/LegalPageShell";

export default function ServiceDeliveryPolicy() {
  return (
    <>
      <SEO 
        title="Service Delivery Policy"
        description="Learn how Shyara Marketing delivers digital marketing and technology services including timelines, delivery methods, and support."
        canonical="/service-delivery-policy"
        keywords="service delivery, digital service delivery, online marketing delivery, Shyara Marketing delivery"
      />
      <LegalPageShell title="Service Delivery Policy">
              <p className="leading-relaxed">
                Shyara Marketing delivers digital marketing and technology services only. No physical goods are shipped.
              </p>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Delivery Method</h2>
                <p className="leading-relaxed">Services are delivered via:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Social media platforms</li>
                  <li>Advertising dashboards</li>
                  <li>Websites and apps</li>
                  <li>Email communication</li>
                  <li>Online project tools</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Timelines</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Timelines vary based on service scope and complexity</li>
                  <li>Delivery schedules are communicated during onboarding or proposal discussions</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Access & Credentials</h2>
                <p className="leading-relaxed">
                  Clients are responsible for providing required access to platforms (social media, ads, hosting, etc.) for service delivery.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Support</h2>
                <p className="leading-relaxed">
                  For delivery-related concerns, contact:<br />
                  Email: <a href="mailto:marketing.shyara@gmail.com" className="font-bold text-[#FF3333] hover:underline">marketing.shyara@gmail.com</a>
                </p>
              </section>
      </LegalPageShell>
    </>
  );
}
