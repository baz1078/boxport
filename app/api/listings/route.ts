import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { listings, listingImages, userProfiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { generateSlug } from "@/lib/utils/formatters";
import { FREE_TIER_LISTING_LIMIT } from "@/lib/constants/config";

const createListingSchema = z.object({
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

  try {
    const body = await req.json();
    const parsed = createListingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    // Check listing limit for free tier
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, session.user.id),
    });

    if (profile?.subscriptionTier === "free") {
      const existingCount = await db
        .select()
        .from(listings)
        .where(and(eq(listings.sellerId, session.user.id)))
        .then((r) => r.length);

      if (existingCount >= FREE_TIER_LISTING_LIMIT) {
        return NextResponse.json(
          { error: "Free plan limit reached. Upgrade to Pro for unlimited listings." },
          { status: 403 }
        );
      }
    }

    // Generate slug
    const tempId = crypto.randomUUID();
    const slug = generateSlug(data.title, tempId);

    // Create listing
    const [newListing] = await db
      .insert(listings)
      .values({
        sellerId: session.user.id,
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

    // Insert images
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

    // Update listing count on profile
    await db
      .update(userProfiles)
      .set({ listingsCount: (profile?.listingsCount ?? 0) + 1, updatedAt: new Date() })
      .where(eq(userProfiles.id, session.user.id));

    return NextResponse.json({ success: true, listing: newListing }, { status: 201 });
  } catch (error) {
    console.error("Create listing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const condition = searchParams.get("condition");
  const state = searchParams.get("state");
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 12);

  try {
    const conditions = [eq(listings.status, "active")];
    if (type) conditions.push(eq(listings.containerType, type as any));
    if (condition) conditions.push(eq(listings.condition, condition as any));
    if (state) conditions.push(eq(listings.state, state));

    const results = await db.query.listings.findMany({
      where: and(...conditions),
      with: { images: true },
      orderBy: (l, { desc }) => [desc(l.isFeatured), desc(l.createdAt)],
      limit,
      offset: (page - 1) * limit,
    });

    return NextResponse.json({ listings: results });
  } catch (error) {
    console.error("Get listings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
