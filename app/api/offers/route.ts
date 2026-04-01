import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { offers, listings, notifications, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { addHours } from "date-fns";
import { OFFER_EXPIRY_HOURS } from "@/lib/constants/config";
import { sendOfferReceivedEmail } from "@/lib/email";

const submitOfferSchema = z.object({
  listingId: z.string().uuid(),
  buyerName: z.string().min(2),
  buyerEmail: z.string().email(),
  buyerPhone: z.string().optional(),
  amount: z.number().positive(),
  message: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = submitOfferSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const data = parsed.data;

    // Verify listing exists and is active
    const listing = await db.query.listings.findFirst({
      where: eq(listings.id, data.listingId),
    });

    if (!listing || listing.status !== "active") {
      return NextResponse.json({ error: "Listing not found or unavailable" }, { status: 404 });
    }

    if (!listing.allowOffers) {
      return NextResponse.json({ error: "This listing does not accept offers" }, { status: 400 });
    }

    // Create offer
    const [newOffer] = await db.insert(offers).values({
      listingId: data.listingId,
      buyerEmail: data.buyerEmail,
      buyerName: data.buyerName,
      buyerPhone: data.buyerPhone,
      amount: data.amount.toString(),
      message: data.message,
      expiresAt: addHours(new Date(), OFFER_EXPIRY_HOURS),
    }).returning();

    // Notify seller
    await db.insert(notifications).values({
      userId: listing.sellerId,
      type: "offer_received",
      title: "New offer received",
      body: `${data.buyerName} offered $${data.amount.toLocaleString()} on "${listing.title}"`,
      link: `/dashboard/offers`,
    });

    // Update inquiry count
    await db.update(listings)
      .set({ inquiryCount: listing.inquiryCount + 1 })
      .where(eq(listings.id, data.listingId));

    // Email seller
    const seller = await db.query.users.findFirst({
      where: eq(users.id, listing.sellerId),
    });
    if (seller?.email) {
      await sendOfferReceivedEmail({
        sellerEmail: seller.email,
        sellerName: seller.name || "there",
        buyerName: data.buyerName,
        amount: data.amount,
        listingTitle: listing.title,
        message: data.message,
      }).catch((e) => console.error("Email error:", e));
    }

    return NextResponse.json({ success: true, offerId: newOffer.id }, { status: 201 });
  } catch (error) {
    console.error("Submit offer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
