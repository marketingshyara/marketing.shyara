import { SEO } from "@/components/SEO";
import { LegalPageShell } from "@/components/landing/LegalPageShell";

export default function TermsOfService() {
  return (
    <>
      <SEO 
        title="Terms of Service"
        description="Read the terms and conditions for using Shyara Marketing services including social media management, advertising, website, and app development."
        canonical="/terms-of-service"
        keywords="terms of service, service agreement, Shyara Marketing terms, terms and conditions"
      />
      <LegalPageShell title="Terms of Service">
              <p className="leading-relaxed">
                By accessing or using Shyara Marketing's website and services, you agree to these Terms of Service.
              </p>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Services</h2>
                <p className="leading-relaxed">Shyara Marketing provides:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Social Media Management</li>
                  <li>Advertising Campaign Management</li>
                  <li>Website Development</li>
                  <li>App Development</li>
                </ul>
                <p className="leading-relaxed">
                  Services may be offered as subscriptions or one-time engagements, depending on scope.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Client Responsibilities</h2>
                <p className="leading-relaxed">Clients agree to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Provide accurate information</li>
                  <li>Share required assets and access on time</li>
                  <li>Communicate approvals and feedback promptly</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Payments</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Payments may be monthly, milestone-based, or one-time</li>
                  <li>Pricing and scope are communicated before engagement</li>
                  <li>Services begin only after payment confirmation</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Intellectual Property</h2>
                <p className="leading-relaxed">
                  All strategies, creatives, designs, and deliverables remain the property of Shyara Marketing until full payment is received, unless otherwise agreed in writing.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Limitation of Liability</h2>
                <p className="leading-relaxed">
                  Shyara Marketing shall not be liable for indirect, incidental, or consequential damages arising from service use or performance.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Modifications</h2>
                <p className="leading-relaxed">
                  We reserve the right to update these terms at any time. Continued use of services constitutes acceptance of revised terms.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Governing Law</h2>
                <p className="leading-relaxed">
                  These terms are governed by the laws of India.
                </p>
              </section>
      </LegalPageShell>
    </>
  );
}
