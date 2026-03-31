export const metadata = { title: "Privacy Policy — BoxPort" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary text-primary-foreground py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-primary-foreground/80">Effective date: January 1, 2025</p>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert max-w-none">
          <div className="space-y-10 text-muted-foreground leading-relaxed">

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">1. Who We Are</h2>
              <p>
                BoxPort ("we", "our", "us") operates the marketplace at boxport.io, a platform
                for buying and selling shipping containers in the United States. We are based
                in Chicago, IL. Questions about this policy can be directed to hello@boxport.io.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">2. Information We Collect</h2>
              <p className="mb-3">We collect information you provide directly:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Account information (name, email address, password)</li>
                <li>Profile information (business name, phone number, location)</li>
                <li>Listing content (photos, descriptions, pricing)</li>
                <li>Payment information (processed securely by Stripe — we do not store card numbers)</li>
                <li>Communications with other users or with BoxPort support</li>
              </ul>
              <p className="mt-3">We also collect information automatically:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>IP address and browser type</li>
                <li>Pages visited and time spent on the platform</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To operate and improve the BoxPort marketplace</li>
                <li>To process transactions and facilitate escrow payments</li>
                <li>To send transactional emails (order confirmations, dispute updates)</li>
                <li>To verify seller identity and prevent fraud</li>
                <li>To respond to support requests</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">4. How We Share Your Information</h2>
              <p className="mb-3">We do not sell your personal information. We share it only with:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-foreground">Stripe</strong> — to process payments securely</li>
                <li><strong className="text-foreground">Transaction counterparties</strong> — buyers and sellers see each other's relevant contact information once a transaction is confirmed</li>
                <li><strong className="text-foreground">Service providers</strong> — hosting, email, and analytics providers who are contractually bound to protect your data</li>
                <li><strong className="text-foreground">Law enforcement</strong> — when required by law or to protect the rights and safety of users</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">5. Cookies</h2>
              <p>
                We use cookies to keep you logged in, remember your preferences, and understand
                how the platform is used. You can disable cookies in your browser settings, but
                some features may not work as expected.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">6. Data Retention</h2>
              <p>
                We retain your account data for as long as your account is active. Transaction
                records are retained for a minimum of 7 years for legal and financial compliance.
                You may request deletion of your account by emailing hello@boxport.io.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">7. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access the personal data we hold about you</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt out of marketing emails at any time</li>
              </ul>
              <p className="mt-3">To exercise any of these rights, email hello@boxport.io.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">8. Security</h2>
              <p>
                We use industry-standard security measures including SSL encryption, secure
                password hashing, and access controls. Payment processing is handled entirely
                by Stripe and is never stored on BoxPort servers.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. We'll notify registered users by
                email of any material changes. Continued use of BoxPort after changes take
                effect constitutes your acceptance of the updated policy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">10. Contact</h2>
              <p>
                Questions or concerns about this Privacy Policy? Email us at{" "}
                <a href="mailto:hello@boxport.io" className="text-primary hover:underline">
                  hello@boxport.io
                </a>.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
