import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const seller = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, session.user.id),
    });

    if (!seller) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (seller.subscriptionTier === "pro") {
      return NextResponse.json({ error: "Already on Pro plan" }, { status: 400 });
    }

    // Create or retrieve Stripe customer
    let customerId = seller.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: seller.fullName || seller.businessName || undefined,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;

      await db
        .update(userProfiles)
        .set({ stripeCustomerId: customerId, updatedAt: new Date() })
        .where(eq(userProfiles.id, session.user.id));
    }

    // Create Stripe Checkout session for subscription
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`,
      metadata: { userId: session.user.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const seller = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, session.user.id),
    });

    if (!seller?.subscriptionId) {
      return NextResponse.json({ error: "No active subscription" }, { status: 400 });
    }

    // Cancel at period end
    await stripe.subscriptions.update(seller.subscriptionId, {
      cancel_at_period_end: true,
    });

    await db
      .update(userProfiles)
      .set({ subscriptionStatus: "cancel_at_period_end", updatedAt: new Date() })
      .where(eq(userProfiles.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
