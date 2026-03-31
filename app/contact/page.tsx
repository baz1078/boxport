import { Mail, MapPin, Clock } from "lucide-react";

export const metadata = { title: "Contact Us — BoxPort" };

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary text-primary-foreground py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-3">Get in Touch</h1>
        <p className="text-primary-foreground/80 text-lg">
          Have a question, issue, or just want to say hi? We're here.
        </p>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-bold mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <a href="mailto:hello@boxport.io" className="text-primary hover:underline">
                    hello@boxport.io
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    For general questions, listing issues, and account support.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Based In</p>
                  <p className="text-muted-foreground">Chicago, IL — serving the entire US market</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Response Time</p>
                  <p className="text-muted-foreground">Typically within 1 business day</p>
                </div>
              </div>
            </div>

            <div className="mt-10 p-5 rounded-xl bg-muted/50 border border-border">
              <p className="font-semibold mb-1">Dispute or transaction issue?</p>
              <p className="text-sm text-muted-foreground">
                If you have an active transaction dispute, please email us with your order ID
                and a brief description. We'll respond within 24 hours.
              </p>
            </div>
          </div>

          {/* FAQ-style common questions */}
          <div>
            <h2 className="text-xl font-bold mb-6">Common Questions</h2>
            <div className="space-y-5">
              {[
                {
                  q: "How do I report a fraudulent listing?",
                  a: 'Email hello@boxport.io with the listing URL and details. We take fraud seriously and act fast.',
                },
                {
                  q: "I paid but haven't received my container — what do I do?",
                  a: "If you paid through BoxPort's escrow, your funds are protected. Open a dispute from your dashboard and we'll step in.",
                },
                {
                  q: "Can I list containers as an individual (not a business)?",
                  a: "Yes. You don't need to be a registered business to sell on BoxPort.",
                },
                {
                  q: "How do I delete my account?",
                  a: "Email hello@boxport.io with your request and we'll handle it within 2 business days.",
                },
              ].map(({ q, a }) => (
                <div key={q} className="border-b border-border pb-5">
                  <p className="font-medium mb-1">{q}</p>
                  <p className="text-sm text-muted-foreground">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
