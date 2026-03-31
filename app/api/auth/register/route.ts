import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, accounts, userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [newUser] = await db.insert(users).values({
      name,
      email,
      emailVerified: new Date(), // auto-verify for now
    }).returning();

    // Store password hash in accounts table (credentials provider)
    await db.insert(accounts).values({
      userId: newUser.id,
      type: "credentials" as any,
      provider: "credentials",
      providerAccountId: newUser.id,
      access_token: hashedPassword, // used as password storage
    });

    // Create user profile
    await db.insert(userProfiles).values({
      id: newUser.id,
      role: "seller",
      fullName: name,
      isProfileComplete: false,
    });

    return NextResponse.json({ success: true, userId: newUser.id }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
