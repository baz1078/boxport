import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { offers, listings, transactions, userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";
import { stripe } from "@/lib/stripe/server";
import { calculateFees, toStripeAmount } from "@/lib/utils/fees";
import { addDays } from "date-fns";
import { PAYMENT_HOLD_DAYS } from "@/lib/constants/config";

const CHECKOUT_TOKEN_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-dev-only"
);

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing checkout token" }, { status: 400 });
    }

    // Verify JWT
    let payload: { offerId: string; listingId: string; buyerEmail: string; amount: string };
    try {
      const { payload: p } = await jwtVerify(token, CHECKOUT_TOKEN_SECRET);
      payload = p as typeof payload;
    } catch {
      return NextResponse.json({ error: "Invalid or expired checkout link" }, { status: 400 });
    }

    const { offerId, listingId, buyerEmail, amount } = payload;

    // Verify offer is still accepted
    const offer = await db.query.offers.findFirst({
      where: eq(offers.id, offerId),
    });

    if (!offer || offer.status !== "accepted") {
      return NextResponse.json(
        { error: "This offer is no longer valid" },
        { status: 400 }
      );
    }

    // Verify listing still pending
    const listing = await db.query.listings.findFirst({
      where: eq(listings.id, listingId),
    });

    if (!listing || listing.status !== "pending") {
      return NextResponse.json(
        { error: "Listing is no longer available" },
        { status: 400 }
      );
    }

    // Get seller's Stripe Connect account
    const seller = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, listing.sellerId),
    });

    if (!seller?.stripeAccountId || seller.stripeAccountStatus !== "active") {
      return NextResponse.json(
        { error: "Seller payment account is not set up" },
        { status: 400 }
      );
    }

    const grossAmount = Number(amount);
    const { platformFee, sellerPayout } = calculateFees(grossAmount);

    // Create PaymentIntent with manual capture (escrow)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: toStripeAmount(grossAmount),
      currency: "usd",
      capture_method: "manual",
      application_fee_amount: toStripeAmount(platformFee),
      transfer_data: {
        destination: seller.stripeAccountId,
      },
      metadata: {
        offerId,
        listingId,
        buyerEmail,
        sellerId: listing.sellerId,
        grossAmount: grossAmount.toString(),
        platformFee: platformFee.toString(),
        sellerPayout: sellerPayout.toString(),
      },
      receipt_email: buyerEmail,
    });

    // Create transaction record
    await db.insert(transactions).values({
      listingId,
      offerId,
      buyerEmail,
      sellerId: listing.sellerId,
      grossAmount: grossAmount.toString(),
      platformFee: platformFee.toString(),
      sellerPayout: sellerPayout.toString(),
      stripePaymentIntentId: paymentIntent.id,
      captureDeadline: addDays(new Date(), PAYMENT_HOLD_DAYS),
      status: "held",
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: grossAmount,
      platformFee,
      sellerPayout,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
