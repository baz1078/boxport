import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Shield, DollarSign } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Free to List, 4.9% on Sales",
  description:
    "BoxPort is free to list containers. We only charge a 4.9% platform fee when your container sells. No monthly fees, no hidden costs.",
  alternates: { canonical: "https://boxport.io/pricing" },
};

export const metadata = { title: "Pricing — BoxPort" };

const FREE_FEATURES = [
  "Up to 3 active listings",
  "Offer & counter-offer system",
  "Secure escrow on every sale",
  "Buyer inquiries & messaging",
  "Standard listing placement",
  "No monthly fee",
];

const PRO_FEATURES = [
  "Unlimited active listings",
  "Priority listing placement",
  "Offer & counter-offer system",
  "Secure escrow on every sale",
  "Buyer inquiries & messaging",
  "1 free featured boost per month",
  "Bulk listing tools (coming soon)",
  "Priority seller support",
];

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge className="bg-accent/10 text-accent border-accent/20">Simple, transparent pricing</Badge>
        <h1 className="text-4xl font-bold">Pay only when you sell</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          No hidden fees. BoxPort takes a small 4.9% platform fee per completed transaction —
          only when a sale goes through. Everything else is free or flat-rate.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Free */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Free</CardTitle>
            <p className="text-4xl font-bold">$0<span className="text-base font-normal text-muted-foreground">/mo</span></p>
            <p className="text-sm text-muted-foreground">For casual or occasional sellers</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/register">Get Started Free</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pro */}
        <Card className="border-2 border-primary relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground px-3">Most Popular</Badge>
          </div>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              Pro <Zap className="h-4 w-4 text-accent" />
            </CardTitle>
            <p className="text-4xl font-bold">$49<span className="text-base font-normal text-muted-foreground">/mo</span></p>
            <p className="text-sm text-muted-foreground">For volume sellers & dealers</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-2.5">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/auth/register">Start Pro Trial</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Fee */}
      <div className="bg-muted/40 rounded-2xl p-8 max-w-3xl mx-auto text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-2xl font-bold">
          <DollarSign className="h-6 w-6 text-accent" />
          4.9% Transaction Fee
        </div>
        <p className="text-muted-foreground">
          Applied on every completed sale. This covers payment processing, escrow protection,
          and platform operations. Only charged when a deal closes — never on offers or listings.
        </p>
        <div className="text-sm text-muted-foreground pt-2">
          Example: $5,000 container sale → you receive <strong>$4,755</strong> · BoxPort fee: $245
        </div>
      </div>

      {/* Featured Boost */}
      <div className="border border-border rounded-2xl p-8 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-6">
        <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Zap className="h-7 w-7 text-accent" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-bold text-lg">Featured Listing Boost</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Pin any listing to the top of search results for 30 days. Get significantly more views and inquiries.
          </p>
        </div>
        <div className="text-center flex-shrink-0">
          <p className="text-2xl font-bold">$9.99</p>
          <p className="text-xs text-muted-foreground">per listing / 30 days</p>
        </div>
      </div>

      {/* Trust */}
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
