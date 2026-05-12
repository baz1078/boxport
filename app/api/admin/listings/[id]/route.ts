import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { listings, listingImages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  listingType: z.enum(["sale", "rent_to_own"]).optional(),
  containerType: z.string().optional(),
  condition: z.string().optional(),
  price: z.number().positive().optional(),
  allowOffers: z.boolean().optional(),
  buyNowEnabled: z.boolean().optional(),
  description: z.string().optional(),
  conditionNotes: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  yearManufactured: z.number().optional(),
  rtoMonthlyPayment: z.number().optional(),
  rtoTermMonths: z.number().optional(),
  rtoDownPayment: z.number().optional(),
  status: z.enum(["draft", "active", "paused", "pending", "sold"]).optional(),
  images: z.array(z.object({ url: z.string(), key: z.string() })).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await db.query.listings.findFirst({
      where: eq(listings.id, id),
    });
    if (!existing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.listingType !== undefined) updateData.listingType = data.listingType;
    if (data.containerType !== undefined) updateData.containerType = data.containerType;
    if (data.condition !== undefined) updateData.condition = data.condition;
    if (data.price !== undefined) updateData.price = data.price.toString();
    if (data.allowOffers !== undefined) updateData.allowOffers = data.allowOffers;
    if (data.buyNowEnabled !== undefined) updateData.buyNowEnabled = data.buyNowEnabled;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.conditionNotes !== undefined) updateData.conditionNotes = data.conditionNotes;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.zip !== undefined) updateData.zip = data.zip;
    if (data.yearManufactured !== undefined) updateData.yearManufactured = data.yearManufactured;
    if (data.rtoMonthlyPayment !== undefined) updateData.rtoMonthlyPayment = data.rtoMonthlyPayment.toString();
    if (data.rtoTermMonths !== undefined) updateData.rtoTermMonths = data.rtoTermMonths;
    if (data.rtoDownPayment !== undefined) updateData.rtoDownPayment = data.rtoDownPayment.toString();
    if (data.status !== undefined) updateData.status = data.status;

    const [updated] = await db
      .update(listings)
      .set(updateData as any)
      .where(eq(listings.id, id))
      .returning();

    // Replace images if provided
    if (data.images !== undefined) {
      await db.delete(listingImages).where(eq(listingImages.listingId, id));
      if (data.images.length > 0) {
        await db.insert(listingImages).values(
          data.images.map((img, index) => ({
            listingId: id,
            url: img.url,
            key: img.key,
            position: index,
            isPrimary: index === 0,
          }))
        );
      }
    }

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    console.error("Admin update listing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
