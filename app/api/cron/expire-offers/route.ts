import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { offers } from "@/lib/db/schema";
import { and, eq, lt } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Expire all pending offers past their expiry time
    const result = await db
      .update(offers)
      .set({ status: "expired", updatedAt: now })
      .where(
        and(
          eq(offers.status, "pending"),
          lt(offers.expiresAt, now)
        )
      )
      .returning({ id: offers.id });

    console.log(`[CRON] Expired ${result.length} offers`);

    return NextResponse.json({ expired: result.length });
  } catch (error) {
    console.error("Expire offers cron error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
