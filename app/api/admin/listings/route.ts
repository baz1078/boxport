import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { listings, listingImages, userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { generateSlug } from "@/lib/utils/formatters";

const schema = z.object({
  sellerId: z.string().min(1),
  title: z.string().min(5).max(100),
  containerType: z.string(),
  condition: z.string(),
  price: z.number().positive(),
  allowOffers: z.boolean().default(true),
  buyNowEnabled: z.boolean().default(true),
  description: z.string().optional(),
  conditionNotes: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  yearManufactured: z.number().optional(),
  images: z.array(z.object({ url: z.string(), key: z.string() })),
});

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    // Verify the seller exists
    const sellerProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, data.sellerId),
    });

    if (!sellerProfile) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const slug = generateSlug(data.title, crypto.randomUUID());

    const [newListing] = await db
      .insert(listings)
      .values({
        sellerId: data.sellerId,
        title: data.title,
        slug,
        containerType: data.containerType as any,
        condition: data.condition as any,
        price: data.price.toString(),
        allowOffers: data.allowOffers,
        buyNowEnabled: data.buyNowEnabled,
        description: data.description,
        conditionNotes: data.conditionNotes,
        city: data.city,
        state: data.state,
        zip: data.zip,
        yearManufactured: data.yearManufactured,
        status: "active",
      })
      .returning();

    if (data.images.length > 0) {
      await db.insert(listingImages).values(
        data.images.map((img, index) => ({
          listingId: newListing.id,
          url: img.url,
          key: img.key,
          position: index,
          isPrimary: index === 0,
        }))
      );
    }

    // Update seller's listing count
    await db
      .update(userProfiles)
      .set({
        listingsCount: (sellerProfile.listingsCount ?? 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.id, data.sellerId));

    return NextResponse.json({ success: true, listing: newListing }, { status: 201 });
  } catch (error) {
    console.error("Admin create listing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
