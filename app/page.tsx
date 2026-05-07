import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, DollarSign, Camera, Star, Package, Truck, Search } from "lucide-react";
import { db } from "@/lib/db";
import { listings } from "@/lib/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { ListingCard } from "@/components/listings/ListingCard";
import type { Metadata } from "next";
import { NEW_CONDITIONS, USED_CONDITIONS } from "@/lib/constants/containers";

export const revalidate = 60; // Refresh every 60 seconds

export const metadata: Metadata = {
  title: "BoxPort — Buy & Sell Shipping Containers in the US",
  description:
    "BoxPort is the safest way to buy and sell shipping containers in the US. Verified sellers, escrow-protected payments, and no hidden fees. Browse 20ft, 40ft, reefer, and high cube containers.",
  alternates: { canonical: "https://boxport.io" },
};

async function getListingsByCategory() {
  try {
    const [newListings, usedListings, rtoListings] = await Promise.all([
      db.query.listings.findMany({
        where: and(
          eq(listings.status, "active"),
          eq(listings.listingType, "sale"),
          inArray(listings.condition, [...NEW_CONDITIONS])
        ),
        with: { images: true },
        orderBy: [desc(listings.isFeatured), desc(listings.createdAt)],
        limit: 4,
      }),
      db.query.listings.findMany({
        where: and(
          eq(listings.status, "active"),
          eq(listings.listingType, "sale"),
          inArray(listings.condition, [...USED_CONDITIONS])
        ),
        with: { images: true },
        orderBy: [desc(listings.isFeatured), desc(listings.createdAt)],
        limit: 4,
      }),
      db.query.listings.findMany({
        where: and(
          eq(listings.status, "active"),
          eq(listings.listingType, "rent_to_own")
        ),
        with: { images: true },
        orderBy: [desc(listings.isFeatured), desc(listings.createdAt)],
        limit: 4,
      }),
    ]);
    return { newListings, usedListings, rtoListings };
  } catch {
    return { newListings: [], usedListings: [], rtoListings: [] };
  }
}

export default async function HomePage() {
  const { newListings, usedListings, rtoListings } = await getListingsByCategory();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy + CTAs */}
            <div>
              <Badge className="bg-accent text-accent-foreground mb-4 text-xs font-semibold px-3 py-1">
                🚢 The US Container Marketplace
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Buy & Sell Shipping Containers with Confidence
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
                Browse 20ft, 40ft, reefer, and specialty containers from verified sellers across the US. Secure escrow on every transaction.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base px-8">
                  <Link href="/listings">
                    Browse Containers <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-base px-8">
                  <Link href="/auth/register">Start Selling Free</Link>
                </Button>
              </div>
            </div>

            {/* Right: trust stats card */}
            <div className="hidden lg:flex justify-end">
              <div className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-2xl p-6 w-80 space-y-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/60 mb-2">Why BoxPort</p>
                {[
                  { icon: DollarSign, label: "Free to List", sub: "Flat seller fee only when you sell" },
                  { icon: Shield, label: "Escrow on Every Sale", sub: "Funds held until delivery confirmed" },
                  { icon: Star, label: "Verified Sellers", sub: "Ratings & reviews after every deal" },
                  { icon: Package, label: "All Container Types", sub: "20ft · 40ft · Reefer · Open Top · More" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary-foreground">{item.label}</p>
                      <p className="text-xs text-primary-foreground/60">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">What are you looking for?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/listings?category=new" className="group block bg-card border border-border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all">
              <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">New Containers</h3>
              <p className="text-sm text-muted-foreground mb-3">One-trip, factory-fresh units in near-perfect condition. Ideal for premium builds and storage.</p>
              <span className="text-xs font-semibold text-primary flex items-center gap-1">
                Browse New <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link href="/listings?category=used" className="group block bg-card border border-border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all">
              <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">Used Containers</h3>
              <p className="text-sm text-muted-foreground mb-3">Cargo worthy, wind & water tight, and as-is units. Best value for storage, farming, and construction.</p>
              <span className="text-xs font-semibold text-primary flex items-center gap-1">
                Browse Used <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link href="/listings?category=rent-to-own" className="group block bg-card border border-border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all">
              <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">Rent-to-Own</h3>
              <p className="text-sm text-muted-foreground mb-3">Low monthly payments leading to full ownership. No large upfront cost — own it over time.</p>
              <span className="text-xs font-semibold text-primary flex items-center gap-1">
                Browse Rent-to-Own <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* New Containers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">New Containers</h2>
            <p className="text-muted-foreground text-xs mt-0.5">One-trip, factory-fresh</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/listings?category=new">View All <ArrowRight className="ml-2 h-3 w-3" /></Link>
          </Button>
        </div>
        {newListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {newListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
            <Package className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No new containers listed yet</p>
          </div>
        )}
      </section>

      {/* Used Containers Section */}
      <section className="bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Used Containers</h2>
              <p className="text-muted-foreground text-xs mt-0.5">Cargo worthy, WWT, As-Is</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/listings?category=used">View All <ArrowRight className="ml-2 h-3 w-3" /></Link>
            </Button>
          </div>
          {usedListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {usedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
              <Package className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No used containers listed yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Rent-to-Own Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Rent-to-Own</h2>
            <p className="text-muted-foreground text-xs mt-0.5">Monthly payments → full ownership</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/listings?category=rent-to-own">View All <ArrowRight className="ml-2 h-3 w-3" /></Link>
          </Button>
        </div>
        {rtoListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {rtoListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
            <Package className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No rent-to-own listings yet</p>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How BoxPort Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Simple, secure, and transparent from listing to delivery</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Camera, step: "1", title: "Sellers List for Free", desc: "Upload photos, set your price, and describe the container condition. We only earn when you sell." },
              { icon: Search, step: "2", title: "Buyers Browse & Offer", desc: "Search by type, condition, price, and location. Make an offer or buy instantly. No account required." },
              { icon: Shield, step: "3", title: "Secure Escrow Payment", desc: "Funds held securely until you confirm receipt. A small flat seller fee is deducted at payout. Disputes handled fairly." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Step {item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: DollarSign, label: "Free to List", desc: "No upfront fees. Pay only when you sell." },
            { icon: Shield, label: "Escrow Protected", desc: "Funds held securely until delivery confirmed." },
            { icon: Star, label: "Verified Sellers", desc: "Ratings and reviews for every transaction." },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-3">
                <item.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-1">{item.label}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seller CTA Banner */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Truck className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-3">Have Containers to Sell?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join dealers and individuals already selling on BoxPort. Listings are always free. Upgrade to Pro for unlimited listings and featured placement.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
            <Link href="/auth/register">Start Selling Today <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
