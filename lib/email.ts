import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "noreply@boxport.io";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://boxport.io";

// ─── Offer received (to seller) ─────────────────────────────────────────────
export async function sendOfferReceivedEmail({
  sellerEmail,
  sellerName,
  buyerName,
  amount,
  listingTitle,
  message,
}: {
  sellerEmail: string;
  sellerName: string;
  buyerName: string;
  amount: number;
  listingTitle: string;
  message?: string | null;
}) {
  await resend.emails.send({
    from: `BoxPort <${FROM}>`,
    to: sellerEmail,
    subject: `New offer on "${listingTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#1a56db;padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">You received an offer</h1>
        </div>
        <div style="padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          <p>Hi ${sellerName},</p>
          <p><strong>${buyerName}</strong> has made an offer on your listing:</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0">
            <p style="margin:0 0 8px"><strong>Listing:</strong> ${listingTitle}</p>
            <p style="margin:0 0 8px"><strong>Offer Amount:</strong> $${amount.toLocaleString()}</p>
            ${message ? `<p style="margin:0"><strong>Message:</strong> ${message}</p>` : ""}
          </div>
          <a href="${APP_URL}/dashboard/offers" style="display:inline-block;background:#1a56db;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
            View &amp; Respond to Offer
          </a>
          <p style="color:#6b7280;font-size:13px;margin-top:24px">
            Log in to your BoxPort dashboard to accept, decline, or counter this offer.
          </p>
        </div>
      </div>
    `,
  });
}

// ─── Offer accepted (to buyer) ───────────────────────────────────────────────
export async function sendOfferAcceptedEmail({
  buyerEmail,
  buyerName,
  amount,
  listingTitle,
  checkoutUrl,
}: {
  buyerEmail: string;
  buyerName: string;
  amount: number;
  listingTitle: string;
  checkoutUrl: string;
}) {
  await resend.emails.send({
    from: `BoxPort <${FROM}>`,
    to: buyerEmail,
    subject: `Your offer was accepted — complete your purchase`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#057a55;padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">Offer Accepted!</h1>
        </div>
        <div style="padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          <p>Hi ${buyerName},</p>
          <p>Great news — the seller accepted your offer. Complete your purchase to secure the container.</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0">
            <p style="margin:0 0 8px"><strong>Listing:</strong> ${listingTitle}</p>
            <p style="margin:0"><strong>Accepted Amount:</strong> $${amount.toLocaleString()}</p>
          </div>
          <a href="${checkoutUrl}" style="display:inline-block;background:#057a55;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
            Complete Purchase
          </a>
          <p style="color:#6b7280;font-size:13px;margin-top:24px">
            This checkout link expires in 72 hours. Your payment is held in escrow until delivery is confirmed.
          </p>
        </div>
      </div>
    `,
  });
}

// ─── Offer declined (to buyer) ───────────────────────────────────────────────
export async function sendOfferDeclinedEmail({
  buyerEmail,
  buyerName,
  amount,
  listingTitle,
}: {
  buyerEmail: string;
  buyerName: string;
  amount: number;
  listingTitle: string;
}) {
  await resend.emails.send({
    from: `BoxPort <${FROM}>`,
    to: buyerEmail,
    subject: `Your offer on "${listingTitle}" was declined`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#1a56db;padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">Offer Declined</h1>
        </div>
        <div style="padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          <p>Hi ${buyerName},</p>
          <p>The seller has declined your offer of <strong>$${amount.toLocaleString()}</strong> on <strong>${listingTitle}</strong>.</p>
          <p>You can browse other listings or make a new offer at a different price.</p>
          <a href="${APP_URL}/listings" style="display:inline-block;background:#1a56db;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
            Browse Listings
          </a>
        </div>
      </div>
    `,
  });
}

// ─── Counter offer (to buyer) ────────────────────────────────────────────────
export async function sendCounterOfferEmail({
  buyerEmail,
  buyerName,
  originalAmount,
  counterAmount,
  listingTitle,
  message,
}: {
  buyerEmail: string;
  buyerName: string;
  originalAmount: number;
  counterAmount: number;
  listingTitle: string;
  message?: string | null;
}) {
  await resend.emails.send({
    from: `BoxPort <${FROM}>`,
    to: buyerEmail,
    subject: `The seller countered your offer on "${listingTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <div style="background:#1a56db;padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">Counter-Offer Received</h1>
        </div>
        <div style="padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          <p>Hi ${buyerName},</p>
          <p>The seller has countered your offer on <strong>${listingTitle}</strong>.</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0">
            <p style="margin:0 0 8px"><strong>Your Offer:</strong> $${originalAmount.toLocaleString()}</p>
            <p style="margin:0 0 8px"><strong>Seller Counter:</strong> $${counterAmount.toLocaleString()}</p>
            ${message ? `<p style="margin:0"><strong>Message:</strong> ${message}</p>` : ""}
          </div>
          <a href="${APP_URL}/dashboard/offers" style="display:inline-block;background:#1a56db;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
            View Counter Offer
          </a>
        </div>
      </div>
    `,
  });
}
