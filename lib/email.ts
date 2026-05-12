import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "hello@boxport.io";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://boxport.io";

// ─── Welcome emails ───────────────────────────────────────────────────────────

export async function sendSellerWelcomeEmail(email: string, name: string) {
  const firstName = name.split(" ")[0];
  await resend.emails.send({
    from: `BoxPort <${FROM}>`,
    to: email,
    subject: `Welcome to BoxPort, ${firstName} — your free listing is waiting`,
    html: sellerWelcomeHtml(firstName),
  });
}

export async function sendBuyerWelcomeEmail(email: string, name: string) {
  const firstName = name.split(" ")[0];
  await resend.emails.send({
    from: `BoxPort <${FROM}>`,
    to: email,
    subject: `Welcome to BoxPort, ${firstName} — find your container today`,
    html: buyerWelcomeHtml(firstName),
  });
}

// ─── Loops: add contact + trigger signup event for follow-up sequences ────────

export async function addToLoops(email: string, name: string, role: "seller" | "buyer") {
  const apiKey = process.env.LOOPS_API_KEY;
  if (!apiKey) return;

  const firstName = name.split(" ")[0];
  const lastName = name.split(" ").slice(1).join(" ") || "";

  await fetch("https://app.loops.so/api/v1/contacts/create", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, firstName, lastName, userGroup: role, source: "BoxPort signup" }),
  });

  await fetch("https://app.loops.so/api/v1/events/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, eventName: "signup", eventProperties: { role } }),
  });
}

function sellerWelcomeHtml(firstName: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
<tr><td style="background:#1a2332;padding:32px 40px;text-align:center;">
  <span style="font-size:22px;font-weight:700;color:#ffffff;">Box<span style="color:#f97316;">Port</span></span>
</td></tr>
<tr><td style="padding:40px 40px 32px;">
  <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;">Hey ${firstName}, welcome aboard 👋</p>
  <p style="margin:0 0 28px;font-size:15px;color:#71717a;line-height:1.6;">You're now on BoxPort — the US marketplace built for container sellers. Your first listing is completely free.</p>
  <p style="margin:0 0 16px;font-size:14px;font-weight:600;color:#09090b;">Here's how it works:</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
    <tr><td style="padding:12px 0;border-bottom:1px solid #f4f4f5;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="width:32px;vertical-align:top;padding-top:2px;"><div style="width:24px;height:24px;background:#f97316;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#fff;">1</div></td>
        <td style="padding-left:12px;"><p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#09090b;">Create a free listing</p><p style="margin:0;font-size:13px;color:#71717a;">Upload photos, set your price, describe the container. 5 minutes.</p></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:12px 0;border-bottom:1px solid #f4f4f5;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="width:32px;vertical-align:top;padding-top:2px;"><div style="width:24px;height:24px;background:#f97316;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#fff;">2</div></td>
        <td style="padding-left:12px;"><p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#09090b;">Receive offers</p><p style="margin:0;font-size:13px;color:#71717a;">Buyers message you, make offers, or purchase instantly. You're in control.</p></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:12px 0;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="width:32px;vertical-align:top;padding-top:2px;"><div style="width:24px;height:24px;background:#f97316;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#fff;">3</div></td>
        <td style="padding-left:12px;"><p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#09090b;">Get paid via escrow</p><p style="margin:0;font-size:13px;color:#71717a;">Funds held securely, released after delivery confirmed. Flat success fee only.</p></td>
      </tr></table>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <a href="${APP_URL}/dashboard/listings/new" style="display:inline-block;background:#f97316;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">Create Your First Listing →</a>
  </td></tr></table>
</td></tr>
<tr><td style="padding:24px 40px;text-align:center;border-top:1px solid #f4f4f5;">
  <p style="margin:0 0 6px;font-size:13px;color:#a1a1aa;">Questions? <a href="mailto:hello@boxport.io" style="color:#f97316;text-decoration:none;">hello@boxport.io</a></p>
  <p style="margin:0;font-size:12px;color:#d4d4d8;">© ${new Date().getFullYear()} BoxPort · Chicago, IL · Listings are always free</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

function buyerWelcomeHtml(firstName: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
<tr><td style="background:#1a2332;padding:32px 40px;text-align:center;">
  <span style="font-size:22px;font-weight:700;color:#ffffff;">Box<span style="color:#f97316;">Port</span></span>
</td></tr>
<tr><td style="padding:40px 40px 32px;">
  <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;">Hey ${firstName}, welcome to BoxPort 🚢</p>
  <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.6;">You now have access to hundreds of shipping containers across the US — all with escrow-protected payments so you can buy with confidence.</p>
  <ul style="margin:0 0 28px;padding-left:20px;color:#71717a;font-size:14px;line-height:1.9;">
    <li>Browse new, used, and rent-to-own containers</li>
    <li>Make offers and negotiate directly with sellers</li>
    <li>Pay securely — funds held in escrow until delivery</li>
    <li>Find vetted carriers to handle transport</li>
  </ul>
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <a href="${APP_URL}/listings" style="display:inline-block;background:#1a2332;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">Browse Containers →</a>
  </td></tr></table>
</td></tr>
<tr><td style="padding:24px 40px;text-align:center;border-top:1px solid #f4f4f5;">
  <p style="margin:0 0 6px;font-size:13px;color:#a1a1aa;">Questions? <a href="mailto:hello@boxport.io" style="color:#f97316;text-decoration:none;">hello@boxport.io</a></p>
  <p style="margin:0;font-size:12px;color:#d4d4d8;">© ${new Date().getFullYear()} BoxPort · Chicago, IL</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

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
