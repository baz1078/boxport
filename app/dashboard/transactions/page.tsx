import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { transactions, listings } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils/fees";
import { formatDate, formatRelativeTime } from "@/lib/utils/formatters";

export const metadata = { title: "Transactions — BoxPort" };

const statusConfig: Record<string, { label: string; className: string }> = {
  held: { label: "Funds Held", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  captured: { label: "Captured", className: "bg-blue-100 text-blue-800 border-blue-200" },
  transferred: { label: "Paid Out", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  disputed: { label: "Disputed", className: "bg-red-100 text-red-700 border-red-200" },
  refunded: { label: "Refunded", className: "bg-gray-100 text-gray-600 border-gray-200" },
  released: { label: "Released", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const sellerTransactions = await db.query.transactions.findMany({
    where: eq(transactions.sellerId, session.user.id),
    orderBy: [desc(transactions.createdAt)],
  });

  // Get listing titles
  const listingIds = [...new Set(sellerTransactions.map((t) => t.listingId))];
  const listingMap: Record<string, string> = {};
  for (const lid of listingIds) {
    const listing = await db.query.listings.findFirst({
      where: eq(listings.id, lid),
      columns: { title: true },
    });
    if (listing) listingMap[lid] = listing.title;
  }

  const totalEarnings = sellerTransactions
    .filter((t) => ["captured", "transferred", "released"].includes(t.status))
    .reduce((sum, t) => sum + Number(t.sellerPayout), 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {sellerTransactions.length} total · {formatCurrency(totalEarnings)} earned
        </p>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Earned</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalEarnings)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Pending Release</p>
            <p className="text-2xl font-bold">
              {formatCurrency(
                sellerTransactions
                  .filter((t) => t.status === "held")
                  .reduce((s, t) => s + Number(t.sellerPayout), 0)
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Completed Sales</p>
            <p className="text-2xl font-bold">
              {sellerTransactions.filter((t) => ["captured", "transferred", "released"].includes(t.status)).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      {sellerTransactions.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
          <p className="text-muted-foreground">Completed sales will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sellerTransactions.map((tx) => {
            const status = statusConfig[tx.status] ?? { label: tx.status, className: "bg-gray-100 text-gray-600" };
            return (
              <Card key={tx.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full border">
                          {listingMap[tx.listingId] ?? "Container"}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Buyer: {tx.buyerEmail}
                        {tx.paymentMethodLast4 && ` · Card ending ${tx.paymentMethodLast4}`}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(tx.createdAt)}
                        {tx.status === "held" && (
                          <span className="ml-2 text-yellow-700">
                            · Auto-releases {formatRelativeTime(tx.captureDeadline)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-emerald-600">{formatCurrency(Number(tx.sellerPayout))}</p>
                      <p className="text-xs text-muted-foreground">of {formatCurrency(Number(tx.grossAmount))}</p>
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
