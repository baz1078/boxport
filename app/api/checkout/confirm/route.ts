import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions, listings, offers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe/server";

export async function POST(req: NextRequest) {
  try {
    const { transactionId } = await req.json();

    if (!transactionId) {
      return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
    }

    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.id, transactionId),
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.status !== "held") {
      return NextResponse.json(
        { error: "Transaction is not in held state" },
        { status: 400 }
      );
    }

    // Capture the PaymentIntent (release funds to seller)
    await stripe.paymentIntents.capture(transaction.stripePaymentIntentId);

    // Update transaction
    await db
      .update(transactions)
      .set({
        status: "captured",
        buyerConfirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transactionId));

    // Mark listing as sold
    await db
      .update(listings)
      .set({ status: "sold", soldAt: new Date(), updatedAt: new Date() })
      .where(eq(listings.id, transaction.listingId));

    // Mark offer as checkout complete
    if (transaction.offerId) {
      await db
        .update(offers)
        .set({ status: "checkout_initiated", updatedAt: new Date() })
        .where(eq(offers.id, transaction.offerId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Confirm receipt error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
