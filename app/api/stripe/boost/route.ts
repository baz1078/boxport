import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userProfiles, listings, featuredBoosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe/server";
import { addDays } from "date-fns";
import { FEATURED_BOOST_DAYS, FEATURED_BOOST_PRICE } from "@/lib/constants/config";
import { toStripeAmount } from "@/lib/utils/fees";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId } = await req.json();
    if (!listingId) {
      return NextResponse.json({ error: "listingId required" }, { status: 400 });
    }

    const listing = await db.query.listings.findFirst({
      where: eq(listings.id, listingId),
    });

    if (!listing || listing.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const seller = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, session.user.id),
    });

    // Create or retrieve Stripe customer
    let customerId = seller?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;
      await db
        .update(userProfiles)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(userProfiles.id, session.user.id));
    }

    // Create one-time checkout session for boost
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Featured Listing Boost — ${listing.title}`,
              description: `30-day featured placement for your listing`,
            },
            unit_amount: toStripeAmount(FEATURED_BOOST_PRICE),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/listings?boost=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/listings`,
      metadata: {
        type: "featured_boost",
        listingId,
        sellerId: session.user.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Boost error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
