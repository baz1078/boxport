import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe/server";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, session.user.id),
    });

    if (!profile?.stripeAccountId) {
      return NextResponse.json({ error: "No Stripe account found" }, { status: 404 });
    }

    const loginLink = await stripe.accounts.createLoginLink(profile.stripeAccountId);
    return NextResponse.json({ url: loginLink.url });
  } catch (error) {
    console.error("Stripe dashboard link error:", error);
    return NextResponse.json({ error: "Failed to generate dashboard link" }, { status: 500 });
  }
}
