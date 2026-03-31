import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { listings, offers, transactions, userProfiles } from "@/lib/db/schema";
import { eq, count, sum, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Package, MessageSquare, DollarSign, Eye, Plus, ArrowRight, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/fees";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const userId = session.user.id;

  // Fetch stats
  const [profile, listingStats, offerStats, earningsStats] = await Promise.all([
    db.query.userProfiles.findFirst({ where: eq(userProfiles.id, userId) }),
    db.select({ count: count() }).from(listings).where(
      and(eq(listings.sellerId, userId), eq(listings.status, "active"))
    ),
    db.select({ count: count() }).from(offers).where(
      eq(offers.status, "pending")
    ),
    db.select({ total: sum(transactions.sellerPayout) }).from(transactions).where(
      and(eq(transactions.sellerId, userId), eq(transactions.status, "transferred"))
    ),
  ]);

  const activeListings = listingStats[0]?.count ?? 0;
  const pendingOffers = offerStats[0]?.count ?? 0;
  const totalEarnings = Number(earningsStats[0]?.total ?? 0);
  const isProfileComplete = profile?.isProfileComplete ?? false;

  // Recent listings
  const recentListings = await db.query.listings.findMany({
    where: eq(listings.sellerId, userId),
    with: { images: true },
    orderBy: (l, { desc }) => [desc(l.createdAt)],
    limit: 5,
  });

  const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800",
    draft: "bg-gray-100 text-gray-600",
    pending: "bg-yellow-100 text-yellow-800",
    sold: "bg-blue-100 text-blue-800",
    paused: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {session.user.name?.split(" ")[0]} 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">Here&apos;s what&apos;s happening with your listings</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/dashboard/listings/new">
            <Plus className="mr-2 h-4 w-4" /> List a Container
          </Link>
        </Button>
      </div>

      {/* Profile Incomplete Banner */}
      {!isProfileComplete && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Complete your profile to start receiving payments</p>
            <p className="text-xs mt-0.5 opacity-80">Add your business details and connect Stripe to get paid.</p>
          </div>
          <Button asChild size="sm" variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
            <Link href="/dashboard/profile">Complete Profile</Link>
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Listings", value: activeListings, icon: Package, href: "/dashboard/listings" },
          { label: "Pending Offers", value: pendingOffers, icon: MessageSquare, href: "/dashboard/offers" },
          { label: "Total Earnings", value: formatCurrency(totalEarnings), icon: DollarSign, href: "/dashboard/transactions" },
          { label: "Profile Views", value: "—", icon: Eye, href: "/dashboard/profile" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Listings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-semibold">Recent Listings</CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link href="/dashboard/listings">
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentListings.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No listings yet</p>
              <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/dashboard/listings/new">Create Your First Listing</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/dashboard/listings/${listing.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{listing.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {listing.city}, {listing.state} · {listing.containerType}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="text-sm font-semibold">{formatCurrency(Number(listing.price))}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[listing.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {listing.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
