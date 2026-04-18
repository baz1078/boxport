import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { offers, listings } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/fees";

export const metadata = { title: "Offers — Admin" };

export default async function AdminOffersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/dashboard");

  const allOffers = await db.query.offers.findMany({
    with: { listing: true },
    orderBy: (o, { desc }) => [desc(o.createdAt)],
    limit: 50,
  });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-emerald-100 text-emerald-800",
    declined: "bg-red-100 text-red-800",
    countered: "bg-blue-100 text-blue-800",
    expired: "bg-gray-100 text-gray-600",
    withdrawn: "bg-gray-100 text-gray-600",
    checkout_initiated: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">All Offers</h1>
        <p className="text-muted-foreground text-sm mt-1">Last 50 offers across the platform</p>
      </div>

      <Card>
        <div className="divide-y">
          {allOffers.length === 0 ? (
            <p className="text-sm text-muted-foreground p-5">No offers yet.</p>
          ) : (
            allOffers.map((offer) => (
              <div key={offer.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{offer.listing?.title ?? "Unknown listing"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {offer.buyerName} · {offer.buyerEmail}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-sm font-semibold">{formatCurrency(Number(offer.amount))}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[offer.status] ?? "bg-gray-100"}`}>
                    {offer.status.replace("_", " ")}
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
