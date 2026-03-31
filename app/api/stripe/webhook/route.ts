import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { db } from "@/lib/db";
import { transactions, listings, userProfiles, offers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ─── Payment succeeded (funds held) ──────────────────────────────────────
      case "payment_intent.amount_capturable_updated": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const tx = await db.query.transactions.findFirst({
          where: eq(transactions.stripePaymentIntentId, pi.id),
        });
        if (tx && tx.status === "held") {
          // Record last4 if available
          const charge = pi.latest_charge as string | null;
          if (charge) {
            const chargeObj = await stripe.charges.retrieve(charge);
            const last4 = chargeObj.payment_method_details?.card?.last4;
            await db
              .update(transactions)
              .set({
                stripeChargeId: charge,
                paymentMethodLast4: last4 ?? null,
                updatedAt: new Date(),
              })
              .where(eq(transactions.id, tx.id));
          }
        }
        break;
      }

      // ─── Payment captured (auto-release or buyer confirm) ────────────────────
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const tx = await db.query.transactions.findFirst({
          where: eq(transactions.stripePaymentIntentId, pi.id),
        });
        if (tx && tx.status === "held") {
          await db
            .update(transactions)
            .set({ status: "captured", updatedAt: new Date() })
            .where(eq(transactions.id, tx.id));

          await db
            .update(listings)
            .set({ status: "sold", soldAt: new Date(), updatedAt: new Date() })
            .where(eq(listings.id, tx.listingId));
        }
        break;
      }

      // ─── Payment failed ───────────────────────────────────────────────────────
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const tx = await db.query.transactions.findFirst({
          where: eq(transactions.stripePaymentIntentId, pi.id),
        });
        if (tx) {
          // Restore listing to active, reopen offer
          await db
            .update(listings)
            .set({ status: "active", updatedAt: new Date() })
            .where(eq(listings.id, tx.listingId));

          if (tx.offerId) {
            await db
              .update(offers)
              .set({ status: "accepted", updatedAt: new Date() })
              .where(eq(offers.id, tx.offerId));
          }
        }
        break;
      }

      // ─── Dispute filed ────────────────────────────────────────────────────────
      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const charge = dispute.charge as string;
        const tx = await db.query.transactions.findFirst({
          where: eq(transactions.stripeChargeId, charge),
        });
        if (tx) {
          await db
            .update(transactions)
            .set({
              status: "disputed",
              disputedAt: new Date(),
              disputeReason: dispute.reason,
              updatedAt: new Date(),
            })
            .where(eq(transactions.id, tx.id));
        }
        break;
      }

      // ─── Stripe Connect account updated ──────────────────────────────────────
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        const isActive =
          account.details_submitted &&
          account.charges_enabled &&
          account.payouts_enabled;

        const seller = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.stripeAccountId, account.id),
        });

        if (seller) {
          await db
            .update(userProfiles)
            .set({
              stripeAccountStatus: isActive ? "active" : "pending",
              updatedAt: new Date(),
            })
            .where(eq(userProfiles.id, seller.id));
        }
        break;
      }

      // ─── Subscription created / updated ──────────────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const seller = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.stripeCustomerId, customerId),
        });

        if (seller) {
          const isActive = sub.status === "active" || sub.status === "trialing";
          await db
            .update(userProfiles)
            .set({
              subscriptionTier: isActive ? "pro" : "free",
              subscriptionId: sub.id,
              subscriptionStatus: sub.status,
              updatedAt: new Date(),
            })
            .where(eq(userProfiles.id, seller.id));
        }
        break;
      }

      // ─── Subscription cancelled ───────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const seller = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.stripeCustomerId, customerId),
        });

        if (seller) {
          await db
            .update(userProfiles)
            .set({
              subscriptionTier: "free",
              subscriptionId: null,
              subscriptionStatus: "canceled",
              updatedAt: new Date(),
            })
            .where(eq(userProfiles.id, seller.id));
        }
        break;
      }

      default:
        // Unhandled event — ignore
        break;
    }
  } catch (error) {
    console.error(`Webhook handler error for ${event.type}:`, error);
    // Return 200 to prevent Stripe retrying for handler errors
  }

  return NextResponse.json({ received: true });
}
