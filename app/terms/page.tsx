export const metadata = { title: "Terms of Service — BoxPort" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary text-primary-foreground py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
        <p className="text-primary-foreground/80">Effective date: January 1, 2025</p>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-10 text-muted-foreground leading-relaxed">

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p>
                By creating an account or using BoxPort ("Platform"), you agree to these Terms
                of Service. If you do not agree, do not use the Platform. BoxPort is operated
                from Chicago, IL and serves users in the United States.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">2. Eligibility</h2>
              <p>
                You must be at least 18 years old and legally able to enter into contracts to
                use BoxPort. By using the Platform, you represent that you meet these requirements.
                Business accounts must be authorized representatives of their organization.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">3. Seller Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Sellers must provide accurate, complete, and honest listings. Misrepresenting container condition, size, or availability is grounds for immediate account termination.</li>
                <li>Sellers are responsible for ensuring containers are available and transferable at the time of sale.</li>
                <li>Sellers must fulfill confirmed orders in a timely manner and cooperate with the buyer on logistics.</li>
                <li>BoxPort charges a 4.9% platform fee on completed transactions, deducted from the seller's payout.</li>
                <li>Sellers must complete identity verification before receiving payouts.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">4. Buyer Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Buyers must make payment in full through BoxPort's checkout to be protected by escrow.</li>
                <li>Buyers must inspect and confirm or dispute delivery within the allowed window. Failure to respond constitutes acceptance.</li>
                <li>Buyers may not attempt to circumvent BoxPort's payment system by paying sellers directly.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">5. Escrow & Payments</h2>
              <p className="mb-3">
                All transactions on BoxPort use an escrow system. Buyer funds are held securely
                and released to the seller only after delivery is confirmed. Payment processing
                is handled by Stripe.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Funds are released to the seller after the buyer confirms delivery, or automatically after the release window expires without a dispute.</li>
                <li>If a dispute is opened, BoxPort will review the transaction and make a determination. BoxPort's decision is final.</li>
                <li>Refunds are issued at BoxPort's discretion based on dispute outcomes.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">6. Prohibited Conduct</h2>
              <p className="mb-3">The following are strictly prohibited:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Listing containers you do not own or have authorization to sell</li>
                <li>Creating fake or duplicate accounts</li>
                <li>Attempting to conduct transactions off-platform to avoid fees</li>
                <li>Harassment, threats, or abusive behavior toward other users</li>
                <li>Submitting fraudulent disputes or false information</li>
                <li>Any activity that violates applicable US law</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">7. Listings & Content</h2>
              <p>
                By posting a listing, you grant BoxPort a non-exclusive license to display your
                content on the Platform. You retain ownership of your content. BoxPort reserves
                the right to remove any listing that violates these Terms or our content standards,
                without notice.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">8. Dispute Resolution</h2>
              <p>
                BoxPort provides a dispute process for transaction issues. To open a dispute,
                contact hello@boxport.io with your order ID within the dispute window shown in
                your dashboard. We will review all submitted evidence and issue a ruling within
                5 business days. Both parties agree to be bound by BoxPort's ruling.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">9. Limitation of Liability</h2>
              <p>
                BoxPort is a marketplace platform, not a party to transactions between buyers
                and sellers. To the maximum extent permitted by law, BoxPort's liability is
                limited to the fees collected on the disputed transaction. We are not responsible
                for logistics, container condition disputes outside our escrow window, or
                third-party services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">10. Termination</h2>
              <p>
                BoxPort reserves the right to suspend or terminate any account that violates
                these Terms, engages in fraud, or harms other users — with or without notice.
                You may close your account at any time by emailing hello@boxport.io.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">11. Changes to Terms</h2>
              <p>
                We may update these Terms at any time. Material changes will be communicated
                via email to registered users. Continued use of the Platform constitutes
                acceptance of the updated Terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">12. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the State of Illinois, without regard
                to conflict of law principles. Any disputes shall be resolved in the courts of
                Cook County, Illinois.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">13. Contact</h2>
              <p>
                Questions about these Terms? Email{" "}
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
