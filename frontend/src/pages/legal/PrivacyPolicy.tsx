import { SEO } from "@/components/SEO";
import { LegalPageShell } from "@/components/landing/LegalPageShell";

export default function PrivacyPolicy() {
  return (
    <>
      <SEO 
        title="Privacy Policy"
        description="Learn how Shyara Marketing collects, uses, and protects your personal information. We are committed to safeguarding your privacy."
        shareTitle="Shyara — Privacy"
        shareDescription="How we handle your data."
        canonical="/privacy-policy"
        keywords="privacy policy, data protection, Shyara Marketing privacy, personal information protection"
      />
      <LegalPageShell title="Privacy Policy">
              <p className="leading-relaxed">
                Shyara Marketing ("we", "our", "us") operates under Shyara Tech Solutions (OPC) Pvt. Ltd. and is committed to protecting your privacy.
              </p>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Information We Collect</h2>
                <p className="leading-relaxed">We may collect:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Name, email address, phone number</li>
                  <li>Business and brand details shared during onboarding</li>
                  <li>Social media account handles and access (with consent)</li>
                  <li>Payment-related metadata (processed securely by third-party gateways)</li>
                  <li>Usage data such as browser type, device information, and IP address</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">How We Use Information</h2>
                <p className="leading-relaxed">We use your information to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Deliver social media, advertising, website, and app services</li>
                  <li>Communicate regarding campaigns, reports, and support</li>
                  <li>Process payments and subscriptions</li>
                  <li>Improve service quality and performance</li>
                  <li>Ensure security and prevent misuse</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Payment Processing</h2>
                <p className="leading-relaxed">
                  All payments are processed through secure third-party payment gateways. We do not store credit/debit card details or banking information on our servers.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Data Protection</h2>
                <p className="leading-relaxed">
                  We implement reasonable technical and organizational measures to protect client data from unauthorized access or disclosure.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Third-Party Tools</h2>
                <p className="leading-relaxed">
                  We may use third-party platforms for analytics, communication, advertising, and project management. Their data usage is governed by their respective privacy policies.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Your Rights</h2>
                <p className="leading-relaxed">
                  You may request access, correction, or deletion of your data by contacting us.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="font-heading text-xl font-black">Contact</h2>
                <p className="leading-relaxed">
                  For privacy-related concerns, contact:<br />
                  Email: <a href="mailto:marketing.shyara@gmail.com" className="font-bold text-[#FF3333] hover:underline">marketing.shyara@gmail.com</a>
                </p>
              </section>
      </LegalPageShell>
    </>
  );
}
