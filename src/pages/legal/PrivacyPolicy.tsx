import { Layout } from "@/components/Layout";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground mb-8">Last updated: 2025</p>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
              <p className="text-foreground leading-relaxed">
                Shyara Marketing ("we", "our", "us") operates under Shyara Tech Solutions (OPC) Pvt. Ltd. and is committed to protecting your privacy.
              </p>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed">We may collect:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Name, email address, phone number</li>
                  <li>Business and brand details shared during onboarding</li>
                  <li>Social media account handles and access (with consent)</li>
                  <li>Payment-related metadata (processed securely by third-party gateways)</li>
                  <li>Usage data such as browser type, device information, and IP address</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">How We Use Information</h2>
                <p className="text-muted-foreground leading-relaxed">We use your information to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Deliver social media, advertising, website, and app services</li>
                  <li>Communicate regarding campaigns, reports, and support</li>
                  <li>Process payments and subscriptions</li>
                  <li>Improve service quality and performance</li>
                  <li>Ensure security and prevent misuse</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Payment Processing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All payments are processed through secure third-party payment gateways. We do not store credit/debit card details or banking information on our servers.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Data Protection</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement reasonable technical and organizational measures to protect client data from unauthorized access or disclosure.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Third-Party Tools</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may use third-party platforms for analytics, communication, advertising, and project management. Their data usage is governed by their respective privacy policies.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You may request access, correction, or deletion of your data by contacting us.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For privacy-related concerns, contact:<br />
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
