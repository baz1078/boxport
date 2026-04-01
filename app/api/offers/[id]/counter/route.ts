import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { offers, listings, notifications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { addHours } from "date-fns";
import { MAX_OFFER_ROUNDS, OFFER_EXPIRY_HOURS } from "@/lib/constants/config";
import { sendCounterOfferEmail } from "@/lib/email";

const counterSchema = z.object({
  amount: z.number().positive(),
  message: z.string().max(500).optional(),
});

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
    const body = await req.json();
    const parsed = counterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { amount, message } = parsed.data;

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

    // Check round limit
    if (offer.round >= MAX_OFFER_ROUNDS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_OFFER_ROUNDS} negotiation rounds reached` },
        { status: 400 }
      );
    }

    // Mark original offer as countered
    await db
      .update(offers)
      .set({ status: "countered", updatedAt: new Date() })
      .where(eq(offers.id, offerId));

    // Create new counter-offer (seller's turn becomes buyer's pending)
    const [counterOffer] = await db
      .insert(offers)
      .values({
        listingId: offer.listingId,
        buyerEmail: offer.buyerEmail,
        buyerName: offer.buyerName,
        buyerPhone: offer.buyerPhone,
        amount: amount.toString(),
        message,
        round: offer.round + 1,
        parentOfferId: offerId,
        expiresAt: addHours(new Date(), OFFER_EXPIRY_HOURS),
        // status stays pending — awaiting buyer response
      })
      .returning();

    // Notify seller
    await db.insert(notifications).values({
      userId: session.user.id,
      type: "counter_sent",
      title: "Counter-offer sent",
      body: `You sent a $${amount.toLocaleString()} counter to ${offer.buyerName} on "${listing.title}"`,
      link: `/dashboard/offers`,
    });

    await sendCounterOfferEmail({
      buyerEmail: offer.buyerEmail,
      buyerName: offer.buyerName,
      originalAmount: Number(offer.amount),
      counterAmount: amount,
      listingTitle: listing.title,
      message,
    }).catch((e) => console.error("Email error:", e));

    return NextResponse.json({ success: true, counterOfferId: counterOffer.id });
  } catch (error) {
    console.error("Counter offer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
