import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { listings, userProfiles } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils/fees";

export const metadata = { title: "Listings — Admin" };

export default async function AdminListingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/dashboard");

  const allListings = await db.query.listings.findMany({
    with: { images: true },
    orderBy: (l, { desc }) => [desc(l.createdAt)],
  });

  const sellerIds = [...new Set(allListings.map((l) => l.sellerId))];
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

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Listings</h1>
          <p className="text-muted-foreground text-sm mt-1">{allListings.length} total listings across all sellers</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/admin/listings/new">
            <Plus className="mr-2 h-4 w-4" /> Create for Seller
          </Link>
        </Button>
      </div>

      <Card>
        <div className="divide-y">
          {allListings.length === 0 ? (
            <p className="text-sm text-muted-foreground p-5">No listings yet.</p>
          ) : (
            allListings.map((listing) => (
              <div key={listing.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {listing.images[0] && (
                    <img
                      src={listing.images[0].url}
                      alt={listing.title}
                      className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{listing.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {sellerMap[listing.sellerId]} · {listing.city}, {listing.state}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-sm font-semibold">{formatCurrency(Number(listing.price))}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[listing.status] ?? "bg-gray-100"}`}>
                    {listing.status}
                  </span>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/listings/${listing.slug}`} target="_blank">View</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
