import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { listings, listingImages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateListingSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  price: z.number().positive().optional(),
  description: z.string().optional(),
  conditionNotes: z.string().optional(),
  allowOffers: z.boolean().optional(),
  buyNowEnabled: z.boolean().optional(),
  status: z.enum(["draft", "active", "paused"]).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = updateListingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Verify ownership
    const listing = await db.query.listings.findFirst({
      where: and(eq(listings.id, id), eq(listings.sellerId, session.user.id)),
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.price !== undefined) updateData.price = data.price.toString();
    if (data.description !== undefined) updateData.description = data.description;
    if (data.conditionNotes !== undefined) updateData.conditionNotes = data.conditionNotes;
    if (data.allowOffers !== undefined) updateData.allowOffers = data.allowOffers;
    if (data.buyNowEnabled !== undefined) updateData.buyNowEnabled = data.buyNowEnabled;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.zip !== undefined) updateData.zip = data.zip;

    const [updated] = await db
      .update(listings)
      .set(updateData as any)
      .where(eq(listings.id, id))
      .returning();

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    console.error("Update listing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Verify ownership and that listing is not in active sale
    const listing = await db.query.listings.findFirst({
      where: and(eq(listings.id, id), eq(listings.sellerId, session.user.id)),
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.status === "pending" || listing.status === "sold") {
      return NextResponse.json(
        { error: "Cannot delete a listing with an active or completed sale" },
        { status: 400 }
      );
    }

    await db.delete(listings).where(eq(listings.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete listing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const listing = await db.query.listings.findFirst({
      where: and(eq(listings.id, id), eq(listings.sellerId, session.user.id)),
      with: { images: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("Get listing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
