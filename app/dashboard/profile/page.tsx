import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { StripeConnectCard } from "@/components/dashboard/StripeConnectCard";
import { AlertCircle } from "lucide-react";

export const metadata = { title: "Profile Settings" };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const params = await searchParams;
  const isRequired = params.required === "true";

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.id, session.user.id),
  });

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your seller profile and payout settings
        </p>
      </div>

      {isRequired && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            Complete your profile to start listing containers. Stripe is only needed when you receive a payment.
          </p>
        </div>
      )}

      <ProfileForm profile={profile} userId={session.user.id} />
      <StripeConnectCard
        stripeAccountStatus={profile?.stripeAccountStatus}
        stripeAccountId={profile?.stripeAccountId}
      />
    </div>
  );
}
