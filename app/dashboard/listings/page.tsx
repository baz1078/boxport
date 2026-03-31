import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { listings } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Eye, MoreVertical, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils/fees";
import { CONTAINER_TYPE_LABELS } from "@/lib/constants/containers";
import { formatDate } from "@/lib/utils/formatters";

export const metadata = { title: "My Listings" };

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  draft: { label: "Draft", className: "bg-gray-100 text-gray-600 border-gray-200" },
  pending: { label: "Sale Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  sold: { label: "Sold", className: "bg-blue-100 text-blue-800 border-blue-200" },
  paused: { label: "Paused", className: "bg-orange-100 text-orange-700 border-orange-200" },
};

export default async function MyListingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const myListings = await db.query.listings.findMany({
    where: eq(listings.sellerId, session.user.id),
    with: { images: true },
    orderBy: [desc(listings.createdAt)],
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-sm text-muted-foreground mt-1">{myListings.length} total listing{myListings.length !== 1 ? "s" : ""}</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/dashboard/listings/new">
            <Plus className="mr-2 h-4 w-4" /> New Listing
          </Link>
        </Button>
      </div>

      {myListings.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
          <p className="text-muted-foreground mb-6">Create your first listing to start selling containers</p>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/dashboard/listings/new">Create Your First Listing</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {myListings.map((listing) => {
            const status = statusConfig[listing.status] ?? { label: listing.status, className: "bg-gray-100 text-gray-600" };
            const thumb = listing.images[0];

            return (
              <Card key={listing.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {thumb ? (
                        <Image src={thumb.url} alt={listing.title} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">{listing.title}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${status.className}`}>
                          {status.label}
                        </span>
                        {listing.isFeatured && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {CONTAINER_TYPE_LABELS[listing.containerType]} · {listing.city}, {listing.state}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Listed {formatDate(listing.createdAt)} · {listing.viewCount} views · {listing.inquiryCount} inquiries
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-lg">{formatCurrency(Number(listing.price))}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/listings/${listing.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/listings/${listing.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
