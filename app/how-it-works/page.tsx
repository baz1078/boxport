import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Camera,
  Search,
  Shield,
  DollarSign,
  CheckCircle,
  Clock,
  MessageSquare,
  Truck,
  AlertCircle,
  Zap,
} from "lucide-react";

export const metadata = { title: "How It Works — BoxPort" };

const SELLER_STEPS = [
  {
    step: "1",
    icon: Camera,
    title: "Create a Free Listing",
    desc: "Upload photos, set your asking price, add the container's condition and specs. Listings are always free — no upfront cost.",
  },
  {
    step: "2",
    icon: MessageSquare,
    title: "Receive Offers & Inquiries",
    desc: "Buyers can message you, make offers, or buy instantly. Accept, decline, or counter-offer. You're in control.",
  },
  {
    step: "3",
    icon: DollarSign,
    title: "Secure Escrow Payout",
    desc: "Once a buyer completes payment, funds are held in escrow. When they confirm receipt, BoxPort releases your payout minus the 4.9% fee.",
  },
];

const BUYER_STEPS = [
  {
    step: "1",
    icon: Search,
    title: "Browse & Filter",
    desc: "Search by container type (20ft, 40ft, reefer, etc.), condition, price range, and location. No account needed to browse.",
  },
  {
    step: "2",
    icon: MessageSquare,
    title: "Make an Offer or Buy Now",
    desc: "Submit an offer to negotiate, or hit Buy Now for immediate checkout. Sellers can counter-offer — you'll be notified each round.",
  },
  {
    step: "3",
    icon: Shield,
    title: "Pay Securely, Confirm Receipt",
    desc: "Pay via Stripe — your funds are held in escrow until you confirm the container arrived as described. If not, raise a dispute.",
  },
];

const ESCROW_STEPS = [
  { icon: DollarSign, label: "Buyer pays", desc: "Stripe holds the funds" },
  { icon: Truck, label: "Container delivered", desc: "Seller arranges transport" },
  { icon: CheckCircle, label: "Buyer confirms", desc: "Receipt confirmed in BoxPort" },
  { icon: Zap, label: "Seller paid", desc: "Payout released within 2 days" },
];

const FAQS = [
  {
    q: "Is it really free to list?",
    a: "Yes. Creating a listing costs nothing. BoxPort only earns a 4.9% fee when a sale is completed — never on listings, offers, or inquiries.",
  },
  {
    q: "What if the container doesn't match the description?",
    a: "Open a dispute within 72 hours of confirming receipt. BoxPort's team reviews evidence from both parties and resolves the case fairly. Funds remain in escrow until the dispute is settled.",
  },
  {
    q: "How long does the seller have to wait for payment?",
    a: "Once the buyer confirms receipt, the escrow is released and the payout typically arrives in the seller's bank within 1–2 business days via Stripe Connect.",
  },
  {
    q: "What if the buyer never confirms receipt?",
    a: "If the buyer hasn't confirmed or raised a dispute within 7 days of the expected delivery date, BoxPort auto-releases the funds to the seller.",
  },
  {
    q: "Do I need a Stripe account to sell?",
    a: "Yes. Sellers connect a Stripe account through the dashboard — it takes about 5 minutes. BoxPort uses Stripe Connect to route payouts directly to you.",
  },
  {
    q: "Can I sell without an account?",
    a: "Sellers need an account to manage listings and receive payouts. Buyers can browse without an account but need one to complete a purchase.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Badge className="bg-accent text-accent-foreground mb-4 text-xs font-semibold px-3 py-1">
            Simple & Transparent
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
            How BoxPort Works
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            BoxPort connects container sellers with buyers across the US. Every transaction is protected by escrow — funds don&apos;t move until both sides are satisfied.
          </p>
        </div>
      </section>

      {/* For Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">For Sellers</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            List for free, negotiate on your terms, and get paid securely.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SELLER_STEPS.map((item) => (
            <div key={item.step} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">
                  Step {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/auth/register">
              Start Selling Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* For Buyers */}
      <section className="bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">For Buyers</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Browse thousands of containers, negotiate the price, and pay with full escrow protection.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BUYER_STEPS.map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
                  <item.icon className="h-7 w-7 text-accent" />
                </div>
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                  Step {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline">
              <Link href="/listings">
                Browse Containers <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Escrow Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">The Escrow Flow</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Your money is protected at every stage. Funds only move when both parties are satisfied.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {ESCROW_STEPS.map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                {i < ESCROW_STEPS.length - 1 && (
                  <div className="hidden md:block absolute" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-10 bg-muted/40 rounded-2xl p-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Dispute Protection
            </div>
            <p className="text-sm text-muted-foreground">
              If the container doesn&apos;t match the listing, raise a dispute within 72 hours of delivery. Funds stay in escrow while BoxPort reviews your case.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Callout */}
      <section className="bg-muted/40 border-y border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
          <h2 className="text-2xl font-bold">Transparent Fees — No Surprises</h2>
          <p className="text-muted-foreground">
            BoxPort charges a flat <strong>4.9% platform fee</strong> on completed sales only. Listings, offers, and inquiries are always free.
          </p>
          <div className="inline-block bg-background border border-border rounded-xl px-6 py-4 text-sm">
            Example: $5,000 sale → seller receives{" "}
            <strong className="text-foreground">$4,755</strong> · BoxPort fee:{" "}
            <strong className="text-foreground">$245</strong>
          </div>
          <div className="pt-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/pricing">See full pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-6">
          {FAQS.map((faq) => (
            <div key={faq.q} className="border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join sellers and buyers across the US on the only container marketplace built around trust and transparency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
              <Link href="/auth/register">
                Start Selling Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold">
              <Link href="/listings">Browse Containers</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
