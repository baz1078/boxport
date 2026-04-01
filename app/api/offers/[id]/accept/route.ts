import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { offers, listings, notifications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { sendOfferAcceptedEmail } from "@/lib/email";

const CHECKOUT_TOKEN_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-dev-only"
);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: offerId } = await params;

    // Get offer + listing
    const offer = await db.query.offers.findFirst({
      where: eq(offers.id, offerId),
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (offer.status !== "pending") {
      return NextResponse.json(
        { error: "Offer is no longer pending" },
        { status: 400 }
      );
    }

    // Verify seller owns the listing
    const listing = await db.query.listings.findFirst({
      where: eq(listings.id, offer.listingId),
    });

    if (!listing || listing.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update offer status
    await db
      .update(offers)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(offers.id, offerId));

    // Mark listing as pending
    await db
      .update(listings)
      .set({ status: "pending", updatedAt: new Date() })
      .where(eq(listings.id, offer.listingId));

    // Generate signed checkout token (72hr expiry)
    const checkoutToken = await new SignJWT({
      offerId: offer.id,
      listingId: offer.listingId,
      buyerEmail: offer.buyerEmail,
      amount: offer.amount,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("72h")
      .setIssuedAt()
      .sign(CHECKOUT_TOKEN_SECRET);

    const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout?token=${checkoutToken}`;

    // Notify seller (self notification for reference)
    await db.insert(notifications).values({
      userId: session.user.id,
      type: "offer_accepted",
      title: "Offer accepted",
      body: `You accepted ${offer.buyerName}'s offer of $${Number(offer.amount).toLocaleString()} on "${listing.title}"`,
      link: `/dashboard/offers`,
    });

    await sendOfferAcceptedEmail({
      buyerEmail: offer.buyerEmail,
      buyerName: offer.buyerName,
      amount: Number(offer.amount),
      listingTitle: listing.title,
      checkoutUrl,
    }).catch((e) => console.error("Email error:", e));

    return NextResponse.json({ success: true, checkoutUrl });
  } catch (error) {
    console.error("Accept offer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
