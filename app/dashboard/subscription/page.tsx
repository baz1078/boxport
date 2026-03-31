import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { PRO_SUBSCRIPTION_PRICE, FREE_TIER_LISTING_LIMIT } from "@/lib/constants/config";
import { SubscriptionActions } from "@/components/dashboard/SubscriptionActions";

export const metadata = { title: "Subscription — BoxPort" };

const FREE_FEATURES = [
  `Up to ${FREE_TIER_LISTING_LIMIT} active listings`,
  "Standard listing placement",
  "Offer & counter-offer system",
  "Buyer messaging via offers",
  "BoxPort escrow protection",
];

const PRO_FEATURES = [
  "Unlimited active listings",
  "Priority listing placement",
  "Offer & counter-offer system",
  "Buyer messaging via offers",
  "BoxPort escrow protection",
  "1 free featured boost per month",
  "Analytics dashboard",
  "Priority seller support",
];

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const seller = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.id, session.user.id),
  });

  const isPro = seller?.subscriptionTier === "pro";
  const isCancelling = seller?.subscriptionStatus === "cancel_at_period_end";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isPro ? "You're on the Pro plan" : "Upgrade to unlock unlimited listings"}
        </p>
      </div>

      {/* Current Status */}
      {isPro && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">BoxPort Pro</p>
                <p className="text-sm text-muted-foreground">
                  {isCancelling
                    ? "Cancels at end of billing period"
                    : `$${PRO_SUBSCRIPTION_PRICE}/month · Renews automatically`}
                </p>
              </div>
            </div>
            <Badge className="bg-primary text-primary-foreground">Active</Badge>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <Card className={!isPro ? "border-primary ring-2 ring-primary" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Free</CardTitle>
              {!isPro && <Badge variant="secondary">Current Plan</Badge>}
            </div>
            <p className="text-3xl font-bold">$0<span className="text-base font-normal text-muted-foreground">/mo</span></p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className={isPro ? "border-primary ring-2 ring-primary" : "border-accent"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                Pro
                <Zap className="h-4 w-4 text-accent" />
              </CardTitle>
              {isPro && <Badge className="bg-primary text-primary-foreground">Current Plan</Badge>}
              {!isPro && <Badge className="bg-accent text-accent-foreground">Recommended</Badge>}
            </div>
            <p className="text-3xl font-bold">
              ${PRO_SUBSCRIPTION_PRICE}
              <span className="text-base font-normal text-muted-foreground">/mo</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <SubscriptionActions isPro={isPro} isCancelling={isCancelling} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
