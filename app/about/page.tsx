import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, MapPin, User, ArrowRight } from "lucide-react";

export const metadata = { title: "About BoxPort — The Trusted Container Marketplace" };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Built for Buyers Who Got Burned</h1>
          <p className="text-lg text-primary-foreground/80">
            BoxPort was created because the shipping container market deserved better than
            Craigslist listings, mystery sellers, and zero recourse when things go wrong.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Founded by one person</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Chicago, IL
              </p>
            </div>
          </div>

          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>
              I built BoxPort after watching too many buyers get taken advantage of in the
              shipping container market. Shady dealers, misrepresented conditions, payments
              sent with nothing to show for it — it was a mess, and nobody was fixing it.
            </p>
            <p>
              The container market is massive, but it was still being run like a back-alley
              swap meet. No accountability, no protection, no transparency on pricing. Buyers
              had no way to verify who they were dealing with, and sellers with a real product
              were getting lumped in with the bad actors.
            </p>
            <p>
              BoxPort changes that. Every transaction goes through escrow — funds are held
              securely until the buyer confirms delivery. Sellers are verified. Listings are
              real. And if something goes wrong, there's an actual dispute process instead of
              a disconnected phone number.
            </p>
            <p>
              This is a marketplace built on trust, because that's what this industry has
              always been missing.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Buyer Protection",
                desc: "Every transaction is held in escrow until delivery is confirmed. You never pay and hope for the best.",
              },
              {
                icon: User,
                title: "Seller Accountability",
                desc: "Sellers complete a verified profile before listing. No anonymous dealers, no throwaway accounts.",
              },
              {
                icon: MapPin,
                title: "US-Focused",
                desc: "Built for the US market with pricing in USD, domestic logistics in mind, and real customer support.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-3">Ready to buy or sell with confidence?</h2>
          <p className="text-muted-foreground mb-8">
            Join buyers and sellers who are done with sketchy deals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/listings">
                Browse Containers <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/register">Start Selling Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
