import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions, listings, offers } from "@/lib/db/schema";
import { and, eq, lt } from "drizzle-orm";
import { stripe } from "@/lib/stripe/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find all held transactions past their capture deadline
    const overdueTransactions = await db.query.transactions.findMany({
      where: and(
        eq(transactions.status, "held"),
        lt(transactions.captureDeadline, now)
      ),
    });

    let released = 0;
    const errors: string[] = [];

    for (const tx of overdueTransactions) {
      try {
        // Capture the PaymentIntent (auto-release)
        await stripe.paymentIntents.capture(tx.stripePaymentIntentId);

        // Update transaction
        await db
          .update(transactions)
          .set({
            status: "released",
            autoReleasedAt: now,
            updatedAt: now,
          })
          .where(eq(transactions.id, tx.id));

        // Mark listing as sold
        await db
          .update(listings)
          .set({ status: "sold", soldAt: now, updatedAt: now })
          .where(eq(listings.id, tx.listingId));

        // Update offer if linked
        if (tx.offerId) {
          await db
            .update(offers)
            .set({ status: "checkout_initiated", updatedAt: now })
            .where(eq(offers.id, tx.offerId));
        }

        released++;
        console.log(`[CRON] Auto-released transaction ${tx.id}`);
      } catch (err) {
        errors.push(`${tx.id}: ${err}`);
        console.error(`[CRON] Failed to auto-release ${tx.id}:`, err);
      }
    }

    return NextResponse.json({ released, errors: errors.length, total: overdueTransactions.length });
  } catch (error) {
    console.error("Auto-release cron error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
