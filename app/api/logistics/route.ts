import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { carriers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const carrierSchema = z.object({
  businessName: z.string().min(2, "Business name required"),
  contactName: z.string().min(2, "Contact name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone required"),
  dotNumber: z.string().optional(),
  serviceAreas: z.string().min(1, "Select at least one state"),
  equipmentTypes: z.string().min(1, "Select at least one equipment type"),
  serviceRadiusMiles: z.number().optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = carrierSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check for duplicate email
    const existing = await db.query.carriers.findFirst({
      where: eq(carriers.email, data.email),
    });

    if (existing) {
      return NextResponse.json(
        { error: "A carrier with this email is already registered." },
        { status: 409 }
      );
    }

    await db.insert(carriers).values({
      businessName: data.businessName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      dotNumber: data.dotNumber,
      serviceAreas: data.serviceAreas,
      equipmentTypes: data.equipmentTypes,
      serviceRadiusMiles: data.serviceRadiusMiles,
      bio: data.bio,
      website: data.website || undefined,
      isVerified: false,
      isActive: true,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Carrier registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const results = await db.query.carriers.findMany({
      where: eq(carriers.isActive, true),
      orderBy: (c, { desc }) => [desc(c.isVerified), desc(c.createdAt)],
    });
    return NextResponse.json({ carriers: results });
  } catch (error) {
    console.error("Get carriers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
