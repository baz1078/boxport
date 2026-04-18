import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { listings, offers, transactions, users, userProfiles } from "@/lib/db/schema";
import { count, sum, eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Users, MessageSquare, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils/fees";

export const metadata = { title: "Admin — BoxPort" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/dashboard");

  const [totalUsers, totalListings, totalOffers, revenue] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(listings),
    db.select({ count: count() }).from(offers),
    db.select({ total: sum(transactions.grossAmount) }).from(transactions).where(
      eq(transactions.status, "transferred")
    ),
  ]);

  const activeListings = await db.select({ count: count() }).from(listings).where(
    eq(listings.status, "active")
  );

  const pendingOffers = await db.select({ count: count() }).from(offers).where(
    eq(offers.status, "pending")
  );

  // Recent listings across all sellers
  const recentListings = await db.query.listings.findMany({
    with: { images: true },
    orderBy: (l, { desc }) => [desc(l.createdAt)],
    limit: 10,
  });

  // Get seller names for recent listings
  const sellerIds = [...new Set(recentListings.map((l) => l.sellerId))];
  const sellers = sellerIds.length > 0
    ? await db.query.userProfiles.findMany({
        where: (up, { inArray }) => inArray(up.id, sellerIds),
      })
    : [];
  const sellerMap = Object.fromEntries(sellers.map((s) => [s.id, s.fullName || s.businessName || "Unknown"]));

  const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800",
    draft: "bg-gray-100 text-gray-600",
    pending: "bg-yellow-100 text-yellow-800",
    sold: "bg-blue-100 text-blue-800",
    paused: "bg-orange-100 text-orange-800",
  };

  const stats = [
    { label: "Total Users", value: totalUsers[0]?.count ?? 0, icon: Users },
    { label: "Active Listings", value: activeListings[0]?.count ?? 0, icon: Package },
    { label: "Pending Offers", value: pendingOffers[0]?.count ?? 0, icon: MessageSquare },
    { label: "Total Revenue", value: formatCurrency(Number(revenue[0]?.total ?? 0)), icon: DollarSign },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">All activity across BoxPort</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
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
        ))}
      </div>

      {/* Recent Listings */}
      <Card>
        <div className="p-5 border-b">
          <h2 className="font-semibold text-sm">Recent Listings (All Sellers)</h2>
        </div>
        <div className="divide-y">
          {recentListings.length === 0 ? (
            <p className="text-sm text-muted-foreground p-5">No listings yet.</p>
          ) : (
            recentListings.map((listing) => (
              <div key={listing.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{listing.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {sellerMap[listing.sellerId] ?? "Unknown seller"} · {listing.city}, {listing.state}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-sm font-semibold">{formatCurrency(Number(listing.price))}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[listing.status] ?? "bg-gray-100"}`}>
                    {listing.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
