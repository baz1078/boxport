import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "BoxPort <hello@boxport.io>";

// ─── Resend: Immediate welcome emails ────────────────────────────────────────

export async function sendSellerWelcomeEmail(email: string, name: string) {
  const firstName = name.split(" ")[0];

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Welcome to BoxPort, ${firstName} — your free listing is waiting`,
    html: sellerWelcomeHtml(firstName),
  });
}

export async function sendBuyerWelcomeEmail(email: string, name: string) {
  const firstName = name.split(" ")[0];

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Welcome to BoxPort, ${firstName} — find your container today`,
    html: buyerWelcomeHtml(firstName),
  });
}

// ─── Loops: Add contact + trigger signup event for sequences ─────────────────

export async function addToLoops(
  email: string,
  name: string,
  role: "seller" | "buyer"
) {
  const apiKey = process.env.LOOPS_API_KEY;
  if (!apiKey) return; // silently skip if not configured

  const firstName = name.split(" ")[0];
  const lastName = name.split(" ").slice(1).join(" ") || "";

  // Create/update the contact
  await fetch("https://app.loops.so/api/v1/contacts/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      firstName,
      lastName,
      userGroup: role,
      source: "BoxPort signup",
    }),
  });

  // Trigger the signup event — sequences in Loops listen for this
  await fetch("https://app.loops.so/api/v1/events/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      eventName: "signup",
      eventProperties: { role },
    }),
  });
}

// ─── Email Templates ──────────────────────────────────────────────────────────

function sellerWelcomeHtml(firstName: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to BoxPort</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">

          <!-- Header -->
          <tr>
            <td style="background:#1a2332;padding:32px 40px;text-align:center;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                Box<span style="color:#f97316;">Port</span>
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;line-height:1.3;">
                Hey ${firstName}, welcome aboard 👋
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#71717a;line-height:1.6;">
                You're now on BoxPort — the US marketplace built for container sellers. Your first listing is completely free.
              </p>

              <!-- Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                ${sellerStep("1", "Create your listing", "Upload photos, set your price, and describe your container. Takes about 5 minutes.")}
                ${sellerStep("2", "Receive offers", "Buyers can message you, make offers, or purchase instantly. You're in control.")}
                ${sellerStep("3", "Get paid via escrow", "Funds are held securely until the buyer confirms delivery. BoxPort releases your payout minus a flat fee.")}
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://boxport.io/dashboard/listings/new"
                       style="display:inline-block;background:#f97316;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
                      Create Your First Listing →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;"><div style="height:1px;background:#f4f4f5;"></div></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#a1a1aa;">
                Questions? Reply to this email or reach us at
                <a href="mailto:hello@boxport.io" style="color:#f97316;text-decoration:none;">hello@boxport.io</a>
              </p>
              <p style="margin:0;font-size:12px;color:#d4d4d8;">
                © ${new Date().getFullYear()} BoxPort · Chicago, IL · Listings are always free
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function sellerStep(num: string, title: string, desc: string): string {
  return `<tr>
    <td style="padding:12px 0;border-bottom:1px solid #f4f4f5;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:32px;vertical-align:top;padding-top:2px;">
            <div style="width:24px;height:24px;background:#f97316;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#fff;">${num}</div>
          </td>
          <td style="padding-left:12px;">
            <p style="margin:0 0 3px;font-size:14px;font-weight:600;color:#09090b;">${title}</p>
            <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">${desc}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function buyerWelcomeHtml(firstName: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to BoxPort</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">

          <!-- Header -->
          <tr>
            <td style="background:#1a2332;padding:32px 40px;text-align:center;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                Box<span style="color:#f97316;">Port</span>
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#09090b;line-height:1.3;">
                Hey ${firstName}, welcome to BoxPort 🚢
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#71717a;line-height:1.6;">
                You now have access to hundreds of shipping containers across the US — all with escrow-protected payments so you can buy with confidence.
              </p>

              <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#09090b;">What you can do on BoxPort:</p>
              <ul style="margin:0 0 28px;padding-left:20px;color:#71717a;font-size:14px;line-height:1.8;">
                <li>Browse new, used, and rent-to-own containers</li>
                <li>Make offers and negotiate directly with sellers</li>
                <li>Pay securely — funds held in escrow until delivery</li>
                <li>Find vetted carriers to handle transport</li>
              </ul>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://boxport.io/listings"
                       style="display:inline-block;background:#1a2332;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
                      Browse Containers →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;border-top:1px solid #f4f4f5;">
              <p style="margin:0 0 8px;font-size:13px;color:#a1a1aa;">
                Questions? <a href="mailto:hello@boxport.io" style="color:#f97316;text-decoration:none;">hello@boxport.io</a>
              </p>
              <p style="margin:0;font-size:12px;color:#d4d4d8;">
                © ${new Date().getFullYear()} BoxPort · Chicago, IL
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
