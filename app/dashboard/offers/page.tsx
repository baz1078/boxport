import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { offers, listings } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils/fees";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { OfferActions } from "@/components/offers/OfferActions";

export const metadata = { title: "Offers" };

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending Response", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  accepted: { label: "Accepted", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  declined: { label: "Declined", className: "bg-red-100 text-red-700 border-red-200" },
  countered: { label: "Counter Sent", className: "bg-blue-100 text-blue-800 border-blue-200" },
  expired: { label: "Expired", className: "bg-gray-100 text-gray-600 border-gray-200" },
  checkout_initiated: { label: "Checkout Started", className: "bg-purple-100 text-purple-800 border-purple-200" },
};

export default async function OffersPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  // Get all listings by this seller
  const sellerListings = await db.query.listings.findMany({
    where: eq(listings.sellerId, session.user.id),
    columns: { id: true, title: true },
  });

  const listingIds = sellerListings.map((l) => l.id);
  const listingMap = Object.fromEntries(sellerListings.map((l) => [l.id, l.title]));

  // Get all offers on those listings
  const allOffers = listingIds.length > 0
    ? await db.query.offers.findMany({
        where: (o, { inArray }) => inArray(o.listingId, listingIds),
        orderBy: [desc(offers.createdAt)],
      })
    : [];

  const pendingOffers = allOffers.filter((o) => o.status === "pending");
  const otherOffers = allOffers.filter((o) => o.status !== "pending");

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Offers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {pendingOffers.length} pending · {allOffers.length} total
        </p>
      </div>

      {allOffers.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No offers yet</h3>
          <p className="text-muted-foreground">Offers from buyers will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Offers */}
          {pendingOffers.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Requires Action ({pendingOffers.length})
              </h2>
              <div className="space-y-3">
                {pendingOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    listingTitle={listingMap[offer.listingId] ?? "Unknown Listing"}
                    showActions
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Offers */}
          {otherOffers.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Previous Offers ({otherOffers.length})
              </h2>
              <div className="space-y-3">
                {otherOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    listingTitle={listingMap[offer.listingId] ?? "Unknown Listing"}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OfferCard({ offer, listingTitle, showActions }: {
  offer: typeof offers.$inferSelect;
  listingTitle: string;
  showActions?: boolean;
}) {
  const status = statusConfig[offer.status] ?? { label: offer.status, className: "bg-gray-100 text-gray-600" };

  return (
    <Card className={showActions ? "border-yellow-200 bg-yellow-50/30" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full border">{listingTitle}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${status.className}`}>
                {status.label}
              </span>
              {offer.round > 1 && (
                <span className="text-xs text-muted-foreground">Round {offer.round}/3</span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(Number(offer.amount))}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{offer.buyerName}</p>
                <p>{offer.buyerEmail}</p>
                {offer.buyerPhone && <p>{offer.buyerPhone}</p>}
              </div>
            </div>

            {offer.message && (
              <p className="text-sm text-muted-foreground mt-2 italic">&ldquo;{offer.message}&rdquo;</p>
            )}

            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(offer.createdAt)}
              {offer.status === "pending" && (
                <span className="ml-2">· Expires {formatRelativeTime(offer.expiresAt)}</span>
              )}
            </div>
          </div>

          {showActions && <OfferActions offerId={offer.id} listingId={offer.listingId} currentAmount={Number(offer.amount)} />}
        </div>
      </CardContent>
    </Card>
  );
}
