import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Shield, Zap, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — BoxPort Container Marketplace",
  description:
    "Free to list on BoxPort. Pay a small flat fee only when your container sells. No monthly fees, no hidden costs.",
  alternates: { canonical: "https://boxport.io/pricing" },
};

const SELLER_FEES = [
  {
    category: "Used Containers",
    sub: "Cargo Worthy · Wind & Water Tight · As-Is",
    fee: "$49",
    detail: "flat per sale",
    example: "$2,000 sale → you keep $1,951",
  },
  {
    category: "New Containers",
    sub: "One-Trip · Factory Fresh",
    fee: "$69",
    detail: "flat per sale (or 1.5%, whichever is greater)",
    example: "$4,000 sale → you keep $3,931",
  },
  {
    category: "Rent-to-Own",
    sub: "Monthly payment plans",
    fee: "$99",
    detail: "flat per completed deal",
    example: "Deal closes → you keep the difference",
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Free to list. Pay only when you sell.</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          No monthly fees. No upfront costs. List your containers for free and pay a small flat
          fee only when a deal closes.
        </p>
      </div>

      {/* Two-column: seller vs buyer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-muted/40 rounded-2xl p-8 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">For Sellers</p>
          <p className="text-3xl font-bold">$0 to list</p>
          <ul className="space-y-2.5">
            {[
              "Create your account for free",
              "List up to 3 containers at no cost",
              "Offer & counter-offer system included",
              "Pay a flat fee only when you sell",
              "No monthly fees — ever",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/auth/register">Start Selling Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="bg-muted/40 rounded-2xl p-8 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">For Buyers</p>
          <p className="text-3xl font-bold">2.9% + $0.30</p>
          <p className="text-sm text-muted-foreground">
            A small buyer protection fee is added at checkout. Your payment is held in escrow
            and only released to the seller once you confirm the container arrived as described.
          </p>
          <div className="bg-background border border-border rounded-lg px-4 py-3 text-sm text-muted-foreground">
            Example: $2,000 container → buyer pays <strong className="text-foreground">$2,058.30</strong> total
          </div>
          <ul className="space-y-2.5">
            {[
              "Funds held in escrow until you confirm receipt",
              "Disputes handled by BoxPort",
              "Verified buyers and sellers only",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Seller success fee table */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Seller Success Fees</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Only charged when your container sells. Never on listings, offers, or messages.
          </p>
        </div>
        <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden">
          {SELLER_FEES.map((row) => (
            <div key={row.category} className="flex items-center justify-between px-6 py-5 bg-card">
              <div>
                <p className="font-semibold">{row.category}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{row.sub}</p>
                <p className="text-xs text-muted-foreground mt-1.5 italic">{row.example}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-8">
                <p className="text-2xl font-bold">{row.fee}</p>
                <p className="text-xs text-muted-foreground">{row.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Boost */}
      <div className="border border-border rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Zap className="h-6 w-6 text-accent" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-bold text-lg">Featured Listing Boost</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Pin your listing to the top of search results for 30 days. More views, more inquiries,
            faster sales.
          </p>
        </div>
        <div className="text-center flex-shrink-0">
          <p className="text-2xl font-bold">$9.99</p>
          <p className="text-xs text-muted-foreground">per listing / 30 days</p>
        </div>
      </div>

      {/* Trust footer */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-emerald-600" />
          Every transaction protected by BoxPort escrow — funds held until buyer confirms receipt
        </div>
        <p className="text-sm text-muted-foreground">
          Questions? <Link href="/how-it-works" className="text-primary underline">See how it works</Link>
        </p>
      </div>

    </div>
  );
}
